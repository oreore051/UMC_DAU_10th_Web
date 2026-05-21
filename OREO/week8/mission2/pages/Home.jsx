import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Home() {
  const { status, user } = useAuth()
  return (
    <main className="page">
      <h1>홈</h1>
      <p>UMC 7주차 미션1 — useMutation으로 LP CUD · 댓글 CUD · MyPage · Auth 표준화</p>
      {status === 'authenticated' ? (
        <p>
          <strong>{user?.name}</strong> 님으로 로그인 됨.
        </p>
      ) : (
        <p>아직 로그인하지 않았어요.</p>
      )}
      <div className="cta">
        <Link to="/webtoons" className="btn primary">
          📚 LP 둘러보기
        </Link>
        <Link to="/my" className="btn ghost">
          👤 마이 페이지
        </Link>
      </div>
      <p className="muted small" style={{ marginTop: 16 }}>
        우측 하단 + 버튼으로 새 LP를 작성할 수 있어요. 본인이 작성한 LP·댓글에는 수정/삭제 메뉴가 보입니다.
      </p>
    </main>
  )
}
