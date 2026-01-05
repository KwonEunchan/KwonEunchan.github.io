import { useState } from "react";
import Header from "./Header";
import Banner from "./Banner";
import CategoryPanel from "./CategoryPanel";
import ContentList from "./ContentList";

export default function Layout() {
  const [category, setCategory] = useState("문제해결");
  const [keyword, setKeyword] = useState("");

  return (
    <div className="layout-container">
      <Header />
      <Banner />
      <CategoryPanel
        onSelect={(c) => setCategory(c)}
        onSearch={(k) => setKeyword(k)}
      />
      <ContentList selectedCategory={category} keyword={keyword} />
    </div>
  );
}

