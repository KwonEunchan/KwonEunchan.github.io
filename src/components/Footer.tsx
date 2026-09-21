import { siteConfig } from '@/site.config'
import BackToTop from './BackToTop'

export default function Footer() {
  const { author } = siteConfig
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__copy">
          © {year} {author.name}
        </p>
        <nav className="site-footer__links" aria-label="바닥글">
          {author.email && <a href={`mailto:${author.email}`}>Email</a>}
          <BackToTop />
        </nav>
      </div>
    </footer>
  )
}
