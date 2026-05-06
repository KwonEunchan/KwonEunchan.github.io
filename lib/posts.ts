import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'contents/posts');

export interface PostData {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail?: string;
  tags: string[];
}

export function getSortedPostsData(): PostData[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const fileId = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      id: matterResult.data.id ? String(matterResult.data.id) : fileId,
      slug: fileId,
      title: matterResult.data.title || '',
      date: matterResult.data.date || '',
      description: matterResult.data.description || '',
      thumbnail: matterResult.data.thumbnail || undefined,
      tags: matterResult.data.tags || [],
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostsByIds(ids: string[]): PostData[] {
  return ids
    .map((id) => {
      const fullPath = path.join(postsDirectory, `${id}.md`);
      if (!fs.existsSync(fullPath)) return null;

      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const post: PostData = {
        id: matterResult.data.id ? String(matterResult.data.id) : id,
        slug: id,
        title: matterResult.data.title || '',
        date: matterResult.data.date || '',
        description: matterResult.data.description || '',
        thumbnail: matterResult.data.thumbnail || undefined,
        tags: matterResult.data.tags || [],
      };
      return post;
    })
    .filter((post): post is PostData => post !== null);
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: matterResult.data.id ? String(matterResult.data.id) : id,
    slug: id,
    contentHtml,
    title: matterResult.data.title || '',
    date: matterResult.data.date || '',
    description: matterResult.data.description || '',
    thumbnail: matterResult.data.thumbnail || undefined,
    tags: matterResult.data.tags || [],
  };
}