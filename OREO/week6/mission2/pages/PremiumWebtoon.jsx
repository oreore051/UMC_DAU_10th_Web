import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/axios.js'

export default function PremiumWebtoon() {
  const { id } = useParams()
  const [me, setMe] = useState(null)
  const [callCount, setCallCount] = useState(0)
  const [lastCallAt, setLastCallAt] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const callMe = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/users/me')
      setMe(data)
      setCallCount((c) => c + 1)
      setLastCallAt(new Date().toLocaleTimeString())
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? '요청 실패'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    callMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="page">
      <h1>🔒 프리미엄 웹툰 #{id}</h1>
      <p>로그인된 회원만 볼 수 있는 컨텐츠입니다.</p>

      <article className="webtoon">
        <h2>오늘의 에피소드</h2>
        <p className="quote">"Refresh Token으로 끊김 없이 보는 그날까지"</p>
        <p>
          이 페이지에 진입할 때마다 <code>GET /v1/users/me</code>를 호출해요.
          <br />
          access token이 만료된 상태(30초 후)에서 호출하면, axios interceptor가
          <br />
          refresh API를 자동으로 호출해 새 토큰을 받고 원 요청을 재시도합니다.
        </p>
      </article>

      <section className="diag">
        <h3>🔍 Refresh Token 흐름 검증</h3>
        <ul className="kv">
          <li>
            <span>API 호출 횟수:</span> <code>{callCount}</code>
          </li>
          <li>
            <span>마지막 호출 시각:</span> <code>{lastCallAt ?? '-'}</code>
          </li>
          <li>
            <span>받아온 유저:</span>{' '}
            <code>{me ? `${me.name} (${me.email})` : '-'}</code>
          </li>
        </ul>
        <button className="btn primary" onClick={callMe} disabled={loading}>
          {loading ? '호출 중…' : '🔄 GET /users/me 다시 호출'}
        </button>
        {error && <p className="error">⚠ {error}</p>}

        <details className="tip">
          <summary>📘 동작 검증 방법</summary>
          <ol>
            <li>로그인 후 이 페이지 진입 (1번째 호출 — 200)</li>
            <li>
              <strong>30초 대기</strong> (백엔드 <code>JWT_EXPIRES_IN=30s</code>)
            </li>
            <li>다시 호출 버튼 클릭 — DevTools Network 탭에서 다음 흐름 확인:
              <ol>
                <li><code>GET /users/me</code> → 401</li>
                <li><code>POST /auth/refresh</code> → 200 (토큰 갱신)</li>
                <li><code>GET /users/me</code> 재시도 → 200</li>
              </ol>
            </li>
            <li>화면에는 끊김 없이 정상적으로 데이터 갱신</li>
          </ol>
        </details>
      </section>
    </main>
  )
}
