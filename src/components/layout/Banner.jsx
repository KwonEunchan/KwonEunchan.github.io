import { useMemo } from "react";
import "../../styles/Banner.scss";
import posts from "@data/posts.json";
import bannerOutline from "../../assets/banner-outline.png";
import profile from "../../assets/profile.png";

export default function Banner() {

  const careerText = useMemo(() => {
    const start = new Date(2022, 10, 7);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years}년 ${months}개월째 달려오는 중`;
  }, []);

  const { progressCount, doneCount } = useMemo(() => {
    let progress = 0;
    let done = 0;

    posts.forEach((p) => {
      if (p.state === "진행") progress++;
      if (p.state === "완료") done++;
    });

    return { progressCount: progress, doneCount: done };
  }, []);

  return (
    <section id="banner">
      <div className="header-dummy"></div>
      <div className="banner-inner">
        <img className="banner-outline" src={bannerOutline} alt="" />
        <div className="banner-profile">
          <img src={profile} alt="" />
          <div className="profile-text-box">
            <h1>나날이 성장하고 있어요</h1>
            <h2>{careerText}</h2>
          </div>
        </div>

        <div className="profile-badges">
          <div className="badge">⭐ 헤쳐온 함정의 수 : {doneCount}개</div>
          <div className="badge">⏳ 진행 중인 이슈 : {progressCount}개</div>
        </div>

      </div>
    </section>
  );
}

