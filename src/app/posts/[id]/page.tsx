import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowLeft, Calendar, FolderKanban, Code2, Wrench } from "lucide-react";
import ClientButtons from "./ClientButtons";

interface PostData {
  id: string;
  title: string;
  summary?: string;
  content: string;
  categories: string[];
  skills: string[];
  isTroubleShooting: boolean;
  createdAt?: string;
  date?: string;
}

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "src", "posts");
  if (!fs.existsSync(postsDir)) return [{ id: "test" }];
  const fileNames = fs.readdirSync(postsDir);
  const params = fileNames.map((fileName) => ({
    id: fileName.replace(/\.md$/, ""),
  }));
  return params.length > 0 ? params : [{ id: "test" }];
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const decodedId = decodeURIComponent(id);

  const postsDir = path.join(process.cwd(), "src", "posts");
  let filePath = path.join(postsDir, `${decodedId}.md`);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), "posts", `${decodedId}.md`);
  }

  if (!fs.existsSync(filePath)) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm font-bold">포스트 파일을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">
          메인으로 이동
        </Link>
      </div>
    );
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  let post: PostData;

  const safeParseArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      if (value.startsWith("[") && value.endsWith("]")) {
        return value.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      }
      return value.split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    }
    return [];
  };

  try {
    post = JSON.parse(rawContent);
    post.id = decodedId;
    post.categories = safeParseArray(post.categories);
    post.skills = safeParseArray(post.skills);
  } catch (e) {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = rawContent.match(frontmatterRegex);

    if (match) {
      const yamlBlock = match[1];
      const markdownBody = match[2];

      const metadata: any = {};
      yamlBlock.split("\n").forEach((line) => {
        const parts = line.split(":");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          metadata[key] = parts.slice(1).join(":").trim();
        }
      });

      post = {
        id: decodedId,
        title: metadata.title?.replace(/^["']|["']$/g, "") || decodedId,
        summary: metadata.summary?.replace(/^["']|["']$/g, "") || "",
        content: markdownBody,
        categories: safeParseArray(metadata.categories),
        skills: safeParseArray(metadata.skills),
        isTroubleShooting: metadata.isTroubleShooting === "true" || metadata.isTroubleShooting === true || metadata.isTroubleShooting === "TroubleShooting",
        createdAt: metadata.createdAt?.replace(/^["']|["']$/g, "") || "",
      };
    } else {
      post = {
        id: decodedId,
        title: decodedId,
        content: rawContent,
        categories: ["Tech"],
        skills: [],
        isTroubleShooting: false,
      };
    }
  }

  const fileStat = fs.statSync(filePath);
  const formattedDate = post.createdAt || fileStat.birthtime.toISOString().split("T")[0];
  post.date = formattedDate;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans antialiased text-slate-800 selection:bg-blue-50 selection:text-blue-600">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
        .main-canvas-wrapper, .html-article-view, .meta-info-row-text { font-family: "Pretendard Variable", Pretendard, sans-serif !important; }
        .html-article-view { color: #1e293b !important; }
        .html-article-view p, .html-article-view h1, .html-article-view h2, .html-article-view h3, .html-article-view li, .html-article-view strong { color: inherit !important; background-color: transparent !important; }
        .html-article-view code { background-color: rgba(239, 246, 255, 0.7) !important; color: #2563eb !important; font-family: monospace !important; }
        .html-article-view pre, .html-article-view pre code { background-color: #0f172a !important; color: #f8fafc !important; font-family: monospace !important; }
      `}} />

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-8 h-8 rounded-xl border border-slate-200/70 hover:border-blue-500/80 hover:text-blue-600 flex items-center justify-center bg-white text-slate-400 transition-all active:scale-95 group">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <ClientButtons post={{ ...post, date: post.date || "" }} />
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 md:px-12 py-8 flex flex-col gap-6 main-canvas-wrapper">
        <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] p-8 md:p-14 select-text flex flex-col">
          <div className="flex flex-col gap-4 pb-8 border-b border-slate-100 mb-8">
            {post.isTroubleShooting && (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 font-black text-[11px] rounded-lg tracking-wider uppercase border border-emerald-200/50 w-fit shadow-sm">
                  <Wrench className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                  Solved Troubleshooting
                </span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mt-1">{post.title}</h1>
            <div className="flex items-center gap-3 mt-3 meta-info-row-text">
              <div className="flex items-center gap-1.5 text-[12px] font-black text-slate-400 uppercase tracking-wider w-20 shrink-0">
                <FolderKanban className="w-4 h-4 stroke-[2.5]" />
                <span>카테고리</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(post.categories) && post.categories.length > 0 ? (
                  post.categories.map((cat) => (
                    <span key={cat} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-extrabold rounded border border-blue-200/50 tracking-wider">
                      {cat}
                    </span>
                  ))
                ) : <span className="text-slate-400 font-bold text-[14px]">미분류</span>}
              </div>
            </div>
            {Array.isArray(post.skills) && post.skills.length > 0 && (
              <div className="flex items-center gap-3 meta-info-row-text">
                <div className="flex items-center gap-1.5 text-[12px] font-black text-slate-400 uppercase tracking-wider w-20 shrink-0">
                  <Code2 className="w-4 h-4 stroke-[2.5]" />
                  <span>스킬셋</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.skills.map((skill) => (
                    <span key={skill} className="inline-block px-2 py-0.5 bg-slate-50 text-slate-500 text-[11px] font-extrabold rounded border border-slate-200/60 tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 meta-info-row-text">
              <div className="flex items-center gap-1.5 text-[12px] font-black text-slate-400 uppercase tracking-wider w-20 shrink-0">
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                <span>작성일</span>
              </div>
              <span className="text-slate-600 font-extrabold tracking-tight text-[14px]">{formattedDate}</span>
            </div>
          </div>
          <div className="html-article-view">
            <article className="prose prose-slate max-w-none break-words text-slate-800 prose-headings:font-black prose-p:text-[14.5px] prose-p:text-slate-600 prose-strong:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50/70 prose-pre:bg-slate-900" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </main>
    </div>
  );
}