"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import styles from './Write.module.scss';

const BlockNoteEditor = dynamic(() => import('./BlockNoteEditor'), {
  ssr: false,
  loading: () => <div className={styles.loadingPlaceholder}>에디터를 로드 중입니다...</div>
});

function WriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTroubleshooting, setIsTroubleshooting] = useState(false);
  const [originalSha, setOriginalSha] = useState('');
  const [isLoadingEdit, setIsLoadingEdit] = useState(!!editSlug);
  const [originalDate, setOriginalDate] = useState('');

  const editorRef = useRef<any>(null);

  useEffect(() => {
    const loadEditData = async () => {
      if (!editSlug) return;
      try {
        const owner = 'KwonEunchan';
        const repo = 'KwonEunchan.github.io';
        const path = `contents/posts/${editSlug}.md`;

        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
        if (res.ok) {
          const data = await res.json();
          setOriginalSha(data.sha);

          const decodedContent = decodeURIComponent(escape(atob(data.content)));
          const match = decodedContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
          
          if (match) {
            const frontmatter = match[1];
            const body = match[2];

            const titleMatch = frontmatter.match(/title:\s*"(.*?)"/);
            if (titleMatch) setTitle(titleMatch[1]);

            const descMatch = frontmatter.match(/description:\s*"(.*?)"/);
            if (descMatch) setDescription(descMatch[1]);

            const dateMatch = frontmatter.match(/date:\s*"(.*?)"/);
            if (dateMatch) setOriginalDate(dateMatch[1]);

            if (frontmatter.includes('tags: ["트러블슈팅"]')) setIsTroubleshooting(true);

            const waitForEditor = setInterval(async () => {
              if (editorRef.current) {
                clearInterval(waitForEditor);
                const blocks = await editorRef.current.tryParseMarkdownToBlocks(body.trim());
                editorRef.current.replaceBlocks(editorRef.current.document, blocks);
                setIsLoadingEdit(false);
              }
            }, 50);
          }
        }
      } catch (error) {
        console.error(error);
        setIsLoadingEdit(false);
      }
    };

    loadEditData();
  }, [editSlug]);

  const uploadImageToGithub = async (blobUrl: string, postId: string, index: number) => {
    const owner = 'KwonEunchan';
    const repo = 'KwonEunchan.github.io';
    const fileName = `${postId}_img${String(index + 1).padStart(3, '0')}.png`;
    const path = `public/images/${fileName}`;
    
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise<string>((resolve, reject) => {
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];

          const checkFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: { 'Authorization': `Bearer ${githubToken}` }
          });

          let sha = undefined;
          if (checkFile.ok) {
            const fileData = await checkFile.json();
            sha = fileData.sha;
          }

          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: `upload: image - ${fileName}`,
              content: base64data,
              sha: sha
            }),
          });

          if (res.ok || res.status === 409) {
            resolve(`/images/${fileName}`);
          } else {
            reject('Image upload failed');
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return blobUrl;
    }
  };

  const handleSubmit = async () => {
    const editor = editorRef.current;
    if (!title.trim() || !description.trim() || !githubToken.trim() || !editor) return;

    let markdown = await editor.blocksToMarkdownLossy(editor.document);
    if (!markdown.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const fixedId = now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0') +
        String(now.getHours()).padStart(2, '0') +
        String(now.getMinutes()).padStart(2, '0') +
        String(now.getSeconds()).padStart(2, '0');

      const slug = editSlug ? editSlug : fixedId;

      const blobRegex = /!\[.*?\]\((blob:.*?)\)/g;
      const matches = Array.from(markdown.matchAll(blobRegex)) as RegExpMatchArray[];
      
      if (matches.length > 0) {
        let i = 0;
        for (const match of matches) {
          const blobUrl = match[1];
          const uploadedPath = await uploadImageToGithub(blobUrl, slug, i);
          markdown = markdown.split(blobUrl).join(uploadedPath);
          i++;
        }
      }

      const owner = 'KwonEunchan';
      const repo = 'KwonEunchan.github.io';
      
      const formattedDate = editSlug && originalDate 
        ? originalDate 
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const fileName = `${slug}.md`;
      const path = `contents/posts/${fileName}`;
      const tags = isTroubleshooting ? '\ntags: ["트러블슈팅"]' : '';
      
      const firstImageMatch = markdown.match(/!\[.*?\]\((.*?)\)/);
      const thumbnail = firstImageMatch ? firstImageMatch[1] : '';
      const thumbField = thumbnail ? `\nthumbnail: "${thumbnail}"` : '';

      const frontmatter = `---\nid: ${slug}\ntitle: "${title}"\ndescription: "${description}"${thumbField}\ndate: "${formattedDate}"${tags}\n---\n\n`;
      const fullContent = frontmatter + markdown;
      const contentEncoded = btoa(unescape(encodeURIComponent(fullContent)));

      const bodyData: any = {
        message: editSlug ? `docs: 포스트 수정 - ${title}` : `docs: 새 포스트 - ${title}`,
        content: contentEncoded,
      };

      if (editSlug && originalSha) {
        bodyData.sha = originalSha;
      }

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        alert(editSlug ? '수정 완료!' : '업로드 완료!');
        router.push('/');
      } else {
        const errorData = await res.json();
        alert(`실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h2>{editSlug ? '포스트 수정하기' : '새 포스트 작성하기'}</h2>
            <p>오늘의 배움을 기록합니다.</p>
          </div>
          <div className={styles.actions}>
            <div className={styles.tokenWrapper}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <input 
                type="password"
                placeholder="GitHub Token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className={styles.tokenInput}
                disabled={isSubmitting}
              />
            </div>
            <button className={styles.cancelBtn} onClick={() => router.back()} disabled={isSubmitting}>나가기</button>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !description.trim() || !githubToken.trim() || isLoadingEdit}>
              {isSubmitting ? '처리 중...' : (editSlug ? '수정 완료' : '업로드')}
            </button>
          </div>
        </div>

        <div className={styles.editorMain}>
          <div className={styles.editorHeader}>
            <div className={styles.topRow}>
              <div className={styles.categoryTab}>Metadata</div>
              <label className={styles.troubleShootOption}>
                <input type="checkbox" checked={isTroubleshooting} onChange={(e) => setIsTroubleshooting(e.target.checked)} disabled={isSubmitting} />
                <span className={styles.checkboxRect}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span className={styles.checkboxLabel}>트러블 슈팅 기록</span>
              </label>
            </div>
            
            <div className={styles.metaFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>제목</label>
                <input 
                  className={styles.titleInput} 
                  type="text" 
                  placeholder="포스트의 제목을 입력하세요" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>요약</label>
                <input 
                  className={styles.descInput} 
                  type="text" 
                  placeholder="포스트를 한 문장으로 설명해주세요" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  disabled={isSubmitting} 
                />
              </div>
            </div>
          </div>

          <div className={styles.editorBody}>
            <div className={styles.bodyTabRow}>
              <div className={styles.categoryTab}>Content</div>
            </div>
            <div className={styles.bnWrapper} style={{ position: 'relative' }}>
              {isLoadingEdit && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.9)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontWeight: 500 }}>
                  기존 데이터를 불러오는 중입니다...
                </div>
              )}
              <BlockNoteEditor editorRef={editorRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>에디터를 준비 중입니다...</div>}>
      <WriteForm />
    </Suspense>
  );
}