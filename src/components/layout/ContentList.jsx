import posts from "@data/posts.json";
import "../../styles/ContentList.scss";

export default function ContentList({ selectedCategory, keyword }) {

  const categoryMap = {
    "문제해결": "Trouble Shooting",
    "인사이트": "Insight",
    "기술스택": "Tech Stack"
  };

  const filtered = posts
    .filter((p) => {
      const mapped = categoryMap[selectedCategory];
      const matchCategory = !mapped || p.category === mapped;

      const t = p.title || "";
      const s = p.summary || "";

      const matchKeyword =
        keyword.trim() === "" ||
        t.includes(keyword) ||
        s.includes(keyword);

      return matchCategory && matchKeyword;
    })
    // 🔥 여기에 정렬 로직 추가 (내림차순: 최신순)
    .sort((a, b) => {
      const dateA = new Date(a.created_time);
      const dateB = new Date(b.created_time);
      return dateB - dateA; // B에서 A를 빼면 양수일 때 B가 앞으로 옴 (내림차순)
    });

  return (
    <section id="content-list">
      <div className="inner">
        <ul className="post-list">
          {filtered.map((p) => (
            <li key={p.id} className="post-item">
              <a href={p.url} target="_blank" rel="noreferrer">

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
                  {/* JSON 생성 시 날짜를 created_time에 넣어뒀으므로 이걸 우선 사용 */}
                  {p.created_time ? p.created_time.slice(0, 10) : ""}
                </div>

              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}


