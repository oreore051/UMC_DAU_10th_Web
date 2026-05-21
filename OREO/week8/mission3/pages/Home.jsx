import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

// 미션3 검증용: 사이드바를 모바일 폭에서 열었을 때
// 뒷배경이 스크롤되지 않는지 확인하려면 충분히 긴 콘텐츠가 필요.
const LONG_PARAGRAPHS = Array.from({ length: 15 }, (_, i) => (
  <p key={i} className="muted">
    [scroll lock 데모용 {i + 1}/15] 사이드바가 열려 있는 동안에는 이 영역이 스크롤되지 않아야 합니다.
    햄버거 메뉴를 누르고 페이지를 위·아래로 휠/터치 스크롤 해보세요. 닫으면 다시 스크롤이 자유롭게 동작합니다.
    이 정책은 모달이 떠 있을 때 뒷배경이 같이 움직이지 않게 하는 일반적인 UX 패턴과 동일합니다.
  </p>
))

export default function Home() {
  const { status, user } = useAuth()
  return (
    <main className="page">
      <h1>홈</h1>
      <p>UMC 8주차 미션3 — useSidebar 커스텀 훅 · ESC 닫기 · 배경 스크롤 잠금</p>
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
      <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid #e5e7eb' }} />
      <h2 style={{ marginBottom: 12 }}>📜 스크롤 잠금 확인 영역</h2>
      {LONG_PARAGRAPHS}
    </main>
  )
}
