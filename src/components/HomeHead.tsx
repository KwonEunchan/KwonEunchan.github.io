import { siteConfig } from '@/site.config'

/** 홈 상단 문구 */
export default function HomeHead() {
  return (
    <section className="home-head">
      <h1 className="home-head__title">{siteConfig.headline}</h1>
      <p className="home-head__desc">{siteConfig.subline}</p>
    </section>
  )
}
