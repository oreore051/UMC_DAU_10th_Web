import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { redirectToGoogleLogin } from '../api/google.js'

const DEMO = { email: 'umc@umc.com', password: '1234' }

const ERROR_LABELS = {
  missing_code: 'Google에서 인증 코드를 받지 못했어요.',
  missing_tokens: '토큰을 받지 못했어요. 다시 시도해주세요.',
  google_not_configured:
    'Google OAuth가 아직 설정되지 않았어요. backend/.env에 GOOGLE_CLIENT_ID/SECRET을 채워주세요.',
  google_oauth_failed: 'Google 로그인에 실패했어요.',
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const { status, user, login, logout } = useAuth()

  const [email, setEmail] = useState(DEMO.email)
  const [password, setPassword] = useState(DEMO.password)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const queryError = params.get('error')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      const redirectTo = location.state?.from?.pathname ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? '로그인 실패'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'authenticated') {
    return (
      <main className="page">
        <h1>로그인</h1>
        <p>
          이미 <strong>{user?.name ?? user?.email}</strong> 으로 로그인되어 있어요.
        </p>
        <button className="btn ghost" onClick={logout}>
          로그아웃
        </button>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>로그인</h1>
      <p>데모 계정 자동 입력. 그대로 로그인 누르거나, Google 로그인을 시도해보세요.</p>

      {queryError && (
        <p className="error">⚠ {ERROR_LABELS[queryError] ?? queryError}</p>
      )}

      <button
        type="button"
        className="btn google"
        onClick={redirectToGoogleLogin}
      >
        <span className="g-icon" aria-hidden>G</span>
        Google로 계속하기
      </button>

      <div className="divider"><span>또는 이메일로 로그인</span></div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">⚠ {error}</p>}
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </button>
      </form>
    </main>
  )
}
