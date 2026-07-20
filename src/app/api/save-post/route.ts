import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { 
      title, 
      summary, 
      content, 
      categories, 
      skills, 
      isTroubleShooting, 
      thumbnail, 
      editId, 
      originalDate 
    } = await request.json();

    const githubToken = process.env.BLOG_GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json({ success: false, error: "GitHub Token is missing" }, { status: 500 });
    }

    const owner = "KwonEunchan";
    const repo = "KwonEunchan.github.io";
    
    const fileName = editId 
      ? `${editId}.md` 
      : `post-${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12)}.md`;
    
    const filePath = `src/posts/${fileName}`;
    const dateStr = originalDate || new Date().toISOString().split('T')[0];
    
    const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
summary: "${summary ? summary.replace(/"/g, '\\"') : ""}"
createdAt: "${dateStr}"
categories: ${JSON.stringify(categories || [])}
skills: ${JSON.stringify(skills || [])}
isTroubleShooting: ${!!isTroubleShooting}
thumbnail: "${thumbnail || ""}"
---

${content}`;

    let sha = "";
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      sha = fileData.sha;
    }

    const commitMessage = editId ? `style: update post ${fileName}` : `feat: add post ${fileName}`;
    const utf8Bytes = new TextEncoder().encode(fileContent);
    const base64Content = btoa(String.fromCharCode(...utf8Bytes));

    const saveResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: base64Content,
          sha: sha || undefined,
        }),
      }
    );

    if (saveResponse.ok) {
      return NextResponse.json({ 
        success: true, 
        fileName: fileName.replace(".md", "")
      });
    } else {
      const errorData = await saveResponse.json();
      return NextResponse.json({ success: false, error: errorData.message || "GitHub API Error" }, { status: saveResponse.status });
    }

  } catch (error) {
    console.error("Save Post Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}