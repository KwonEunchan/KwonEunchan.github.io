const { Client } = require("@notionhq/client");
const fs = require("fs");
const path = require("path");

// Notion 클라이언트 생성
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

async function main() {
  let results = [];
  let cursor = undefined;

  while (true) {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100
    });

    results = results.concat(res.results);

    if (!res.has_more) break;
    cursor = res.next_cursor;
  }

  const posts = results.map((post) => ({
    id: post.id,
    title: post.properties.Title.title?.[0]?.plain_text ?? "",
    summary: post.properties.Summary.rich_text?.[0]?.plain_text ?? "",
    category: post.properties.Category.select?.name ?? "",
    created_time: post.created_time,
    url: post.url
  }));

  // posts 폴더 없으면 생성
  if (!fs.existsSync("posts")) fs.mkdirSync("posts");

  // JSON 저장
  fs.writeFileSync(
    path.join("posts", "posts.json"),
    JSON.stringify(posts, null, 2),
    "utf8"
  );
}

main();
