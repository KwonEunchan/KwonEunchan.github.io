import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "@/components/elements/PostCard";

const postsDirectory = path.join(process.cwd(), "src/posts");

export function getSortedPostsData(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md")) 
    .map((fileName) => {

      const id = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data, content } = matter(fileContents);
      const summary = data.summary || content.slice(0, 150).replace(/[#*`_\n]/g, "") + "...";

      let parsedSkills: string[] = [];
      if (Array.isArray(data.skills)) {
        parsedSkills = data.skills;
      } else if (typeof data.skills === "string") {
        parsedSkills = data.skills.split(",").map((s) => s.trim());
      }

      let parsedCategories: string[] = [];
      if (Array.isArray(data.categories)) {
        parsedCategories = data.categories;
      } else if (typeof data.categories === "string") {
        parsedCategories = data.categories.split(",").map((s) => s.trim());
      } else {
        parsedCategories = ["Tech"]; 
      }

      let extractedThumbnail = data.thumbnail;
      if (!extractedThumbnail) {
        const imgHtmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        const imgMdMatch = content.match(/!\[.*?\]\((.*?)\)/);

        if (imgHtmlMatch && imgHtmlMatch[1]) {
          extractedThumbnail = imgHtmlMatch[1];
        } else if (imgMdMatch && imgMdMatch[1]) {
          extractedThumbnail = imgMdMatch[1];
        } else {
          extractedThumbnail = null;
        }
      }

      return {
        id: Number(id) || id,
        title: data.title || "제목 없음",
        summary: summary,
        date: data.date || "2026-07-14",
        categories: parsedCategories,
        skills: parsedSkills,
        isTroubleShooting: data.isTroubleShooting || false,
        thumbnail: extractedThumbnail,
      } as Post;
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}