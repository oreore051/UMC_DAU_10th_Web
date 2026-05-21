import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { status } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)

  if (status === 'loading') {
    return (
      <main className="page">
        <p>인증 정보를 확인하는 중…</p>
      </main>
    )
  }
  if (status === 'unauthenticated') {
    if (confirmed) {
      return <Navigate to="/login" replace state={{ from: location }} />
    }
    return (
      <div className="auth-modal-backdrop">
        <div className="auth-modal">
          <h3>로그인이 필요해요</h3>
          <p>이 페이지를 이용하려면 로그인이 필요합니다.</p>
          <div className="auth-modal-actions">
            <button className="btn ghost small" onClick={() => navigate(-1)}>
              취소
            </button>
            <button className="btn small" onClick={() => setConfirmed(true)}>
              로그인하러 가기
            </button>
          </div>
        </div>
      </div>
    )
  }
  return children
}
