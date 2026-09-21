import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import AdminMenu from './AdminMenu'

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <div className="site-header__actions">
          <ThemeToggle />
          <AdminMenu />
        </div>
      </div>
    </header>
  )
}
