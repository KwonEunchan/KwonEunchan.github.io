import posts from "../../data/posts.json";
import "../../styles/ContentList.scss";

export default function ContentList({ selectedCategory, keyword }) {

  // 🔥 한글 카테고리 → 영어 카테고리 매핑
  const categoryMap = {
    "전체": null,
    "문제해결": "Trouble Shooting",
    "설계": "Design",
    "운영": "Operation",
    "프로젝트": "Project",
    "인사이트": "Insight",
    "학습": "Study",
    "커리어": "Career",
    "데브옵스": "DevOps"
  };

  const filtered = posts.filter((p) => {
    const mapped = categoryMap[selectedCategory];

    // 🔥 카테고리 체크
    const matchCategory = !mapped || p.category === mapped;

    // 🔥 검색어 체크 (title/summary null 안정 처리)
    const t = p.title || "";
    const s = p.summary || "";

    const matchKeyword =
      keyword.trim() === "" ||
      t.includes(keyword) ||
      s.includes(keyword);

    return matchCategory && matchKeyword;
  });

  return (
    <section id="content-list">
      <div className="inner">
        <ul className="post-list">
          {filtered.map((p) => (
            <li key={p.id} className="post-item">
              <a href={p.url} target="_blank">

                <div className="post-title-row">
                  <h3>{p.title || "(제목 없음)"}</h3>

                  {p.state === "진행" && (
                    <span className="state-badge progress">진행</span>
                  )}
                  {p.state === "완료" && (
                    <span className="state-badge done">완료</span>
                  )}
                </div>

                <p>{p.summary}</p>

                <div className="date">
                  {p.published_date || p.created_time?.slice(0, 10)}
                </div>

              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
