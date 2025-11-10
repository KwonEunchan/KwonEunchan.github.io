import fs from "fs";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function fetchNotionList() {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        // ✅ Notion은 사용자 정의 Date 필드는 정렬 가능
        sorts: [
          { property: "Publish Date", direction: "descending" }
        ]
      })
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`Notion API Error (${response.status}): ${JSON.stringify(json, null, 2)}`);
  }

  return json;
}

async function main() {
  console.log("✅ ENV CHECK:", {
    token: NOTION_TOKEN ? "OK" : "EMPTY",
    db: DATABASE_ID ? "OK" : "EMPTY"
  });

  const data = await fetchNotionList();

  const posts = data.results.map(page => ({
    id: page.id,
    url: page.url,
    title: page.properties?.Name?.title?.[0]?.plain_text ?? "",
    summary: page.properties?.Summary?.rich_text?.[0]?.plain_text ?? "",
    category: page.properties?.Category?.select?.name ?? "",
    state: page.properties?.State?.select?.name ?? "",
    // ✅ Published Date 필드가 date 타입일 때
    published_date: page.properties["Publish Date"]?.date?.start ?? null,
    created_time: page.created_time
  }));

  fs.mkdirSync("./posts", { recursive: true });
  fs.writeFileSync("./posts/posts.json", JSON.stringify(posts, null, 2));

  console.log("✅ posts.json updated successfully");
}

main().catch(err => {
  console.error("❌ ERROR:", err);
  console.error(err.stack);
  process.exit(1);
});
