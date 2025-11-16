import "../../styles/Header.scss";
import iconBlog from "../../assets/icon-blog.png";

export default function Header() {
  return (
    <header id="header">
      <div className="header-inner">
        <div className="logo">
          <img src={iconBlog} className="logo-icon" />
          <div className="logo-text">IT’s Trap</div>
        </div>
      </div>

      <div className="header-dummy"></div>
    </header>
  );
}
