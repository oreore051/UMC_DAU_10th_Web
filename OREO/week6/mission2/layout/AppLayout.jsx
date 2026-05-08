import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

// 첫 진입 시 데스크톱(>=768)이면 열림, 모바일이면 닫힘.
const initialOpen = () =>
  typeof window !== 'undefined' && window.innerWidth >= 768

export default function AppLayout() {
  const navigate = useNavigate()
  const { status, user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen)

  // Esc 키로 닫기
  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  const close = () => setSidebarOpen(false)
  const toggle = () => setSidebarOpen((v) => !v)

  return (
    <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <header className="app-header">
        <div className="header-left">
          <button
            type="button"
            className="hamburger"
            aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
            onClick={toggle}
          >
            <svg width="28" height="28" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M7.95 11.95h32m-32 12h32m-32 12h32"
              />
            </svg>
          </button>
          <Link to="/" className="brand">
            📚 UMC Webtoon
          </Link>
        </div>
        <div className="header-right">
          {status === 'authenticated' ? (
            <>
              <span className="welcome">{user?.name ?? user?.email}님 반갑습니다.</span>
              <button className="btn ghost small" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost small">
                로그인
              </Link>
              <Link to="/signup" className="btn small">
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={close}
          >
            홈
          </NavLink>
          <NavLink
            to="/webtoons"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={close}
          >
            웹툰 둘러보기
          </NavLink>
          {status === 'authenticated' ? (
            <>
              <NavLink
                to="/premium/webtoon/1"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={close}
              >
                프리미엄
              </NavLink>
              <button
                type="button"
                className="link-like"
                onClick={() => {
                  close()
                  logout()
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={close}
              >
                로그인
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={close}
              >
                회원가입
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      {/* 모바일에서만 backdrop 표시. 데스크톱은 사이드바가 grid 영역을 차지/해제하므로 backdrop 불필요 */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <main className="app-main">
        <Outlet />
      </main>

      <button
        type="button"
        className="fab"
        aria-label="새 글 작성"
        onClick={() => navigate('/webtoons/new')}
      >
        +
      </button>
    </div>
  )
}
