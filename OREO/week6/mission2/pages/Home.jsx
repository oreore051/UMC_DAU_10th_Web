import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Home() {
  const { status, user } = useAuth()
  return (
    <main className="page">
      <h1>홈</h1>
      <p>UMC 6주차 미션1 — TanStack Query로 목록·상세 조회 표준화</p>
      {status === 'authenticated' ? (
        <p>
          <strong>{user?.name}</strong> 님으로 로그인 됨.
        </p>
      ) : (
        <p>아직 로그인하지 않았어요.</p>
      )}
      <div className="cta">
        <Link to="/webtoons" className="btn primary">
          📚 웹툰 둘러보기
        </Link>
        <Link to="/premium/webtoon/1" className="btn ghost">
          🔒 프리미엄 (보호 라우트)
        </Link>
      </div>
    </main>
  )
}
