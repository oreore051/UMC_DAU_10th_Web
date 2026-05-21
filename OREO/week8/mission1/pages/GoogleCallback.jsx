import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { tokenStorage } from '../auth/tokenStorage.js'

export default function GoogleCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const error = params.get('error')
    if (error) {
      console.error('[Google OAuth] error:', error)
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true })
      return
    }

    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken || !refreshToken) {
      navigate('/login?error=missing_tokens', { replace: true })
      return
    }

    tokenStorage.set({ accessToken, refreshToken })
    window.location.replace('/')
  }, [params, navigate])

  return (
    <main className="page">
      <h1>Google 로그인 처리 중…</h1>
      <p>잠시만 기다려주세요.</p>
    </main>
  )
}
