import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="not-found__code">404</p>
      <h1>찾는 페이지가 없습니다</h1>
      <p>주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
      <Link href="/" className="button button--primary">글 목록으로 가기</Link>
    </div>
  )
}
