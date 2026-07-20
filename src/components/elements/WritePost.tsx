"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Save, Sparkles, FolderKanban, Code2, Plus, X, 
  Bold, Italic, List, Quote, Code, Heading1, Heading2, Image as ImageIcon, ListOrdered, 
  Table as TableIcon, Trash2, Info, ShieldCheck, ShieldAlert
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import { createLowlight, common } from 'lowlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import 'highlight.js/styles/atom-one-dark.css'; 
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CATEGORIES } from "@/constants/categories";

const lowlight = createLowlight(common);

const GITHUB_OWNER = "KwonEunchan";
const GITHUB_REPO = "KwonEunchan.github.io";

const MAGIC_CODE = "dktm1541!";
const ENCODED_REAL_TOKEN = "Z2hwX0Z4NThLclQxZzR3OTBvckNza3R0M0E1V0Jld213ejBTeGhaTA=="; 

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
      <div className="flex items-center gap-1 pr-2 border-r border-slate-200/60">
        {[
          { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), title: "굵게" },
          { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), title: "기울임" },
          { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), title: "제목1" },
          { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), title: "제목2" },
          { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), title: "글머리 기호" },
          { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), title: "번호 매기기" },
          { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), title: "인용구" },
          { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), title: "코드 블록" },
          { icon: ImageIcon, action: () => { const url = prompt("클라우드플레어 이미지 URL (링크)을 붙여넣으세요:"); if (url) editor.chain().focus().setImage({ src: url }).run(); }, title: "이미지 링크 삽입" },
        ].map((t, i) => (
          <button 
            key={i} 
            type="button"
            onClick={t.action} 
            title={t.title}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
          >
            <t.icon className="w-[18px] h-[18px]" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-slate-50/80 px-2 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
        <button 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="표 삽입 (3x3)"
          className="p-1.5 text-slate-500 bg-white hover:text-blue-600 hover:border-blue-300 border border-slate-200/80 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <TableIcon className="w-4 h-4" />
          <span className="text-[11px] font-black pr-0.5">표 삽입</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

        <div className="flex items-center gap-1.5">
          {[
            { label: "행 추가", action: () => editor.chain().focus().addRowAfter().run(), type: 'add' },
            { label: "행 삭제", action: () => editor.chain().focus().deleteRow().run(), type: 'delete' },
            { label: "열 추가", action: () => editor.chain().focus().addColumnAfter().run(), type: 'add' },
            { label: "열 삭제", action: () => editor.chain().focus().deleteColumn().run(), type: 'delete' },
          ].map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              className={`px-2.5 py-1 text-[11px] font-black rounded-md border shadow-sm transition-all cursor-pointer flex items-center justify-center
                ${btn.type === 'add' 
                  ? 'bg-white border-slate-200/80 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50' 
                  : 'bg-white border-slate-200/80 text-slate-600 hover:text-red-500 hover:border-red-300 hover:bg-red-50'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

        <button 
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="표 전체 삭제"
          className="p-1.5 text-slate-400 bg-white border border-slate-200/80 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function WritePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const editId = searchParams.get("edit");
  
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [originalDate, setOriginalDate] = useState(""); 
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Middleware"]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isTroubleShooting, setIsTroubleShooting] = useState<boolean>(false);

  const [githubToken, setGithubToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [isSecureConnected, setIsSecureConnected] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, 
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      CodeBlockLowlight.configure({ lowlight }),
      ImageResize, Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content: "", 
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'prose prose-slate max-w-none focus:outline-none min-h-[580px] p-5 md:p-8 tiptap-editor' }
    }
  });

  useEffect(() => {
    setMounted(true);
    
    const savedToken = localStorage.getItem("gh_blog_token") || "";
    if (savedToken) {
      setGithubToken(savedToken);
      setTokenInput(savedToken.startsWith("ghp_") ? MAGIC_CODE : savedToken);
      setIsSecureConnected(true);
    }

    if (editId && editor) {
      const savedData = sessionStorage.getItem("editPostData");
      
      if (savedData && savedData !== "undefined") {
        try {
          const post = JSON.parse(savedData);
          
          setTitle(post.title || "");
          setSummary(post.summary || post.description || ""); 
          setOriginalDate(post.date || ""); 
          
          if (post.categories) {
            setSelectedCategories(Array.isArray(post.categories) ? post.categories : [post.categories]);
          }
          if (post.skills) {
            setSkills(Array.isArray(post.skills) ? post.skills : [post.skills]);
          }
          if (post.isTroubleShooting !== undefined) {
            setIsTroubleShooting(post.isTroubleShooting);
          }
          
          setTimeout(() => {
            editor.commands.setContent(post.content || "");
            setContent(post.content || ""); 
          }, 50);
          
        } catch (error) {
          console.error("세션 스토리지 파싱 에러:", error);
        }
      }
    }
  }, [editId, editor]);

  const handleToggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) setSkills([...skills, trimmed]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleTokenChange = (val: string) => {
    const trimmed = val.trim();
    setTokenInput(trimmed);

    if (trimmed === MAGIC_CODE) {
      try {
        const decodedToken = atob(ENCODED_REAL_TOKEN);
        setGithubToken(decodedToken);
        localStorage.setItem("gh_blog_token", decodedToken);
        setIsSecureConnected(true);
      } catch (e) {
        console.error(e);
      }
    } else if (trimmed.startsWith("ghp_") || trimmed.length > 10) {
      setGithubToken(trimmed);
      localStorage.setItem("gh_blog_token", trimmed);
      setIsSecureConnected(true);
    } else {
      setGithubToken("");
      localStorage.removeItem("gh_blog_token");
      setIsSecureConnected(false);
    }
  };

  const handleSave = async () => {
    if (!githubToken.trim()) {
      alert("GitHub 토큰 또는 비밀 코드를 입력하여 보안 연동을 완료해 주세요.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 본문 내용을 모두 입력해주세요.");
      return;
    }

    const imgTagMatch = content.match(/<img[^>]+src="([^">]+)"/);
    const thumbnail = imgTagMatch ? imgTagMatch[1] : null;

    const formattedDate = originalDate || new Date().toISOString().split("T")[0];
    const fileName = editId ? editId : `${formattedDate}-${title.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/(^-|-$)/g, "")}`;
    const filePath = `_posts/${fileName}.md`;

    const markdownTemplate = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${summary.replace(/"/g, '\\"')}"
date: "${formattedDate}"
categories: [${selectedCategories.map(c => `"${c}"`).join(", ")}]
skills: [${skills.map(s => `"${s}"`).join(", ")}]
isTroubleShooting: ${isTroubleShooting}
thumbnail: ${thumbnail ? `"${thumbnail}"` : "null"}
---

${content}
`;

    try {
      let existingSha = null;

      if (editId) {
        const getFileResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
          headers: {
            "Authorization": `token ${githubToken}`,
            "Accept": "application/vnd.github.v3+json"
          }
        });

        if (getFileResponse.ok) {
          const fileData = await getFileResponse.json();
          existingSha = fileData.sha;
        }
      }

      const utf8B64 = btoa(encodeURIComponent(markdownTemplate).replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      ));

      const commitMessage = editId ? `Update post: ${title}` : `Create post: ${title}`;

      const putFileResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${githubToken}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          message: commitMessage,
          content: utf8B64,
          sha: existingSha || undefined
        })
      });

      if (!putFileResponse.ok) {
        const errorData = await putFileResponse.json();
        alert(`GitHub 반영 실패: ${errorData.message || "알 수 없는 에러가 발생했습니다."}`);
        return;
      }

      alert(editId ? "포스트가 성공적으로 수정 및 커밋되었습니다!" : `[GitHub 커밋 성공] ${fileName}.md 파일이 반영되었습니다!`);
      sessionStorage.removeItem("editPostData");
      router.push(editId ? `/posts/${editId}` : "/");

    } catch (error) {
      console.error("GitHub API 연동 오류:", error);
      alert("GitHub API 통신 중 오류가 발생했습니다.");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#fafafa]" />;

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col font-sans antialiased text-slate-800 selection:bg-blue-50 selection:text-blue-600 [&_input]:font-sans [&_textarea]:font-sans [&_select]:font-sans [&_button]:font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        .tiptap-editor table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 1.5rem 0; overflow: hidden; }
        .tiptap-editor table td, .tiptap-editor table th { min-width: 1em; border: 1px solid #cbd5e1; padding: 0.5rem; vertical-align: top; box-sizing: border-box; position: relative; }
        .tiptap-editor table th { font-weight: 700; text-align: left; background-color: #f8fafc; }
        .tiptap-editor table .selectedCell:after { z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0; background: rgba(200, 200, 255, 0.4); pointer-events: none; }
        .tiptap-editor table .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: -2px; width: 4px; background-color: #3b82f6; pointer-events: none; cursor: col-resize; }
        .tiptap-editor pre { background: #282c34 !important; color: #abb2bf !important; border-radius: 0.5rem; padding: 1rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .tiptap-editor pre code { color: inherit; padding: 0; background: none; font-size: 0.875rem; }
      `}} />

      <header className="bg-white/70 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-xl border border-slate-200/70 hover:border-blue-500/80 hover:text-blue-600 flex items-center justify-center bg-white text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 active:scale-95 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform"/>
          </button>
          <div className="h-4 w-px bg-slate-200/80"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]"/>
            </div>
            <div>
              <h2 className="text-[13px] font-black text-slate-900 leading-tight">포스트 작성하기</h2>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-blue-100 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]"/> {editId ? "수정 완료" : "작성 완료"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 md:px-12 py-8 flex flex-col gap-6">
        
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] space-y-6">
          
          <div className={`p-4 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4
            ${isSecureConnected 
              ? "bg-emerald-50/20 border-emerald-500/20 shadow-[0_2px_10px_-2px_rgba(16,185,129,0.04)]" 
              : "bg-slate-50/50 border-slate-200/60"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isSecureConnected ? "scale-105" : ""}`}>
                {isSecureConnected ? (
                  <div className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-white stroke-[2.5]" />
                    </span>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                    <ShieldAlert className="w-3 h-3 text-slate-500 stroke-[2.5]" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {isSecureConnected ? "GitHub 보안 연결 완료" : "GitHub 계정 권한 인증"}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-normal">
                  {isSecureConnected 
                    ? "블로그 저장소에 마크다운 파일을 다이렉트로 반영할 준비가 되었습니다." 
                    : "토큰을 입력하여 발행 권한을 획득해 주세요."
                  }
                </p>
              </div>
            </div>
            
            <div className="sm:max-w-xs w-full">
              <input
                type="password"
                placeholder="토큰을 입력해주세요"
                value={tokenInput}
                onChange={(e) => handleTokenChange(e.target.value)}
                className={`w-full h-9.5 px-3.5 border rounded-xl text-xs font-mono focus:outline-none transition-all duration-300 shadow-sm
                  ${isSecureConnected 
                    ? "border-emerald-200 focus:border-emerald-500 bg-white" 
                    : "border-slate-200/80 focus:border-blue-500 bg-slate-50/30"
                  }`}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100/80"></div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <FolderKanban className="w-3.5 h-3.5 stroke-[2.5]"/>
              <span>카테고리</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-4 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-100/80"></div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 stroke-[2.5]"/>
              <span>상세</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTroubleShooting(!isTroubleShooting)}
              className={`px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center gap-2 max-w-max ${
                isTroubleShooting ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              트러블 슈팅
            </button>
          </div>

          <div className="h-px bg-slate-100/80"></div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5 stroke-[2.5]"/>
              <span>태그</span>
            </div>
            <form onSubmit={handleAddSkill} className="flex max-w-xs gap-2">
              <input
                type="text"
                placeholder="스킬 입력 후 Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 h-8.5 px-3 border border-slate-200/70 focus:border-blue-500/80 rounded-xl text-xs font-bold focus:outline-none bg-white shadow-inner"
              />
              <button type="submit" className="w-8.5 h-8.5 rounded-xl bg-slate-900 text-white flex items-center justify-center cursor-pointer">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]"/>
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <div key={skill} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200/50">
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="p-0.5 text-slate-400 hover:text-red-500 cursor-pointer">
                    <X className="w-2.5 h-2.5 stroke-[2.5]"/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100/80"></div>

          <div className="flex flex-col gap-3">
            <input 
              type="text"
              placeholder="제목을 입력해 주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 px-2 border-b border-slate-100 focus:border-slate-300 text-xl font-black text-slate-900 focus:outline-none bg-transparent"
            />
            <div className="flex items-start gap-2 px-2 group">
              <textarea 
                placeholder="해당 포스트에 대한 요약을 입력해주세요."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-1 py-2 text-sm font-medium text-slate-600 border-none focus:ring-0 focus:outline-none placeholder:text-slate-300 resize-none bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white border border-slate-200/50 rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-[660px]">          
          <div className="flex-1 h-full min-h-[600px] text-slate-800 flex flex-col bg-white">
            <Toolbar editor={editor} />
            <EditorContent className="flex-1 overflow-y-auto" editor={editor} />
          </div>
        </div>

      </main>
    </div>
  );
}

const DynamicWriteContent = dynamic(() => Promise.resolve({ default: WritePostContent }), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-bold text-gray-400">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      Loading Workspace...
    </div>
  )
});

export default function WritePage() {
  return <DynamicWriteContent />;
}