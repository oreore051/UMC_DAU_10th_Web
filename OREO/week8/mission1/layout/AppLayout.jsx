import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext.jsx'
import LpWriteModal from '../components/LpWriteModal.jsx'

const initialOpen = () =>
  typeof window !== 'undefined' && window.innerWidth >= 768

export default function AppLayout() {
  const navigate = useNavigate()
  const { status, user, logout: contextLogout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen)
  const [writeOpen, setWriteOpen] = useState(false)

  // 로그아웃을 useMutation으로 — 미션 요구사항
  const logoutMut = useMutation({
    mutationFn: contextLogout,
  })

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

  const handleFab = () => {
    if (status !== 'authenticated') {
      navigate('/login')
      return
    }
    setWriteOpen(true)
  }

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
            📚 UMC LP
          </Link>
        </div>
        <div className="header-right">
          <Link to="/search" className="btn ghost small" aria-label="검색">
            🔍 검색
          </Link>
          {status === 'authenticated' ? (
            <>
              <Link to="/my" className="welcome welcome-link">
                {user?.name ?? user?.email}님
              </Link>
              <button
                className="btn ghost small"
                onClick={() => logoutMut.mutate()}
                disabled={logoutMut.isPending}
              >
                {logoutMut.isPending ? '로그아웃 중…' : '로그아웃'}
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
            LP 둘러보기
          </NavLink>
          <NavLink
            to="/search"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={close}
          >
            🔍 검색
          </NavLink>
          {status === 'authenticated' ? (
            <>
              <NavLink
                to="/my"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={close}
              >
                마이 페이지
              </NavLink>
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
                  logoutMut.mutate()
                }}
                disabled={logoutMut.isPending}
              >
                로그아웃
              </button>
              <NavLink
                to="/my?delete=1"
                className="link-like danger"
                onClick={close}
              >
                탈퇴하기
              </NavLink>
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
        aria-label="새 LP 작성"
        onClick={handleFab}
      >
        +
      </button>

      <LpWriteModal
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        mode="create"
        onSuccess={(created) => navigate(`/webtoons/${created.id}`)}
      />
    </div>
  )
}
