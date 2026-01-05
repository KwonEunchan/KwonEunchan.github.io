const fs = require("fs");
const path = require("path");
const axios = require("axios");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

async function generate() {
  const res = await axios.post(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {},
    {
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Notion-Version": "2022-06-28",
      },
    }
  );

  // const posts = res.data.results.map((item) => ({
  //   id: item.id,
  //   title: item.properties.Name?.title?.[0]?.plain_text ?? "",
  //   url: item.url,
  //   summary: item.properties.Summary?.rich_text?.[0]?.plain_text ?? "",
  //   category: item.properties.Category?.select?.name ?? "",
  //   state: item.properties.State?.select?.name ?? "",
  //   created_time: item.created_time,
  // }));

  const posts = res.data.results.map((item) => ({
  id: item.id,
  title: item.properties.Title?.title?.[0]?.plain_text ?? "",  
  url: item.url,  
  summary: item.properties.Summary?.rich_text?.[0]?.plain_text ?? "",
  category: item.properties.Category?.select?.name ?? "",
  state: item.properties.Clear?.status?.name ?? "",
  created_time: item.created_time,
}));

  fs.writeFileSync(
    path.join(dataDir, "posts.json"),
    JSON.stringify(posts, null, 2)
  );

  console.log("posts.json 생성 완료");
}

generate();
