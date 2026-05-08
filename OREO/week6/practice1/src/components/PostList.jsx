import { useState } from 'react'
import { useCustomFetch, clearCustomFetchCache } from '../hooks/useCustomFetch.js'
import { useCustomFetchTanstack } from '../hooks/useCustomFetchTanstack.js'

const NORMAL_URLS = [
  'https://jsonplaceholder.typicode.com/users/1',
  'https://jsonplaceholder.typicode.com/users/2',
  'https://jsonplaceholder.typicode.com/users/3',
]

// 강제 실패 모드: 이 URL은 반드시 404를 돌려준다 → 재시도 시연용
const FAIL_URL = 'https://jsonplaceholder.typicode.com/zzzz/users/1'

// 느린 응답 모드: 우리가 띄운 stub 백엔드의 600ms 지연 라우트 → Loading 상태 시연용
const SLOW_URL = 'http://localhost:8000/v1/webtoons/1'

function fmt(ts) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleTimeString() + '.' + String(d.getMilliseconds()).padStart(3, '0')
}

function summarize(data) {
  if (!data) return null
  if (data.name && data.email) return `${data.name} (${data.email})`
  if (data.title) return `📚 ${data.title}${data.author ? ' / ' + data.author : ''}`
  return JSON.stringify(data).slice(0, 80) + '…'
}

export default function PostList() {
  const [normalUrl, setNormalUrl] = useState(NORMAL_URLS[0])
  const [forceFail, setForceFail] = useState(false)
  const [slow, setSlow] = useState(false)

  // 토글 우선순위: 강제실패 > 느린 응답 > 정상
  const url = forceFail ? FAIL_URL : slow ? SLOW_URL : normalUrl

  return (
    <section className="practice">
      <h2>① 시연 — 직접 만든 useCustomFetch vs TanStack Query</h2>
      <p className="muted small">
        같은 url을 두 훅이 동시에 호출. 토글로 캐시/재시도/로딩 동작을 관찰.
      </p>

      <div className="controls">
        <strong>URL:</strong>
        {NORMAL_URLS.map((u) => (
          <button
            key={u}
            className={u === normalUrl && !forceFail && !slow ? '' : 'ghost'}
            onClick={() => {
              setForceFail(false)
              setSlow(false)
              setNormalUrl(u)
            }}
          >
            {u.split('/').pop()}
          </button>
        ))}
      </div>

      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={forceFail}
            onChange={(e) => {
              setForceFail(e.target.checked)
              if (e.target.checked) setSlow(false)
            }}
          />
          <strong>강제 실패</strong> (404 → 재시도 1s/2s/4s 후 isError)
        </label>
        <label>
          <input
            type="checkbox"
            checked={slow}
            onChange={(e) => {
              setSlow(e.target.checked)
              if (e.target.checked) setForceFail(false)
            }}
          />
          <strong>느린 응답</strong> (로컬 백엔드 600ms 지연 — Loading 길게 노출)
        </label>
        <button
          onClick={() => {
            clearCustomFetchCache()
            alert('localStorage 캐시 비웠어요. URL 다시 누르거나 새로고침 해보세요.')
          }}
        >
          🗑 캐시 비우기
        </button>
      </div>

      <p className="muted small" style={{ marginTop: 6 }}>
        현재 URL: <code>{url}</code>
      </p>

      <div className="grid-2">
        <CustomFetchPanel url={url} />
        <TanstackPanel url={url} />
      </div>
    </section>
  )
}

function CustomFetchPanel({ url }) {
  const { data, isPending, isError, fetchedAt, failureCount, fromCache } =
    useCustomFetch(url)

  return (
    <div className="panel">
      <h3>왼쪽 — 직접 만든 훅</h3>
      <p className="muted small">
        <code>useCustomFetch(url)</code>
      </p>

      <div className="status">
        <span>isPending: <b>{String(isPending)}</b></span>
        <span>isError: <b>{String(isError)}</b></span>
      </div>

      {isPending && <p>⏳ Loading… (재시도 {failureCount}/3)</p>}
      {isError && (
        <p className="error">
          ✗ 3회 재시도 후 실패 (지수 백오프 1s/2s/4s 적용)
        </p>
      )}
      {!isPending && !isError && data && (
        <p>{summarize(data)}</p>
      )}

      <ul className="kv mini">
        <li><span>마지막 fetch</span> {fmt(fetchedAt)}</li>
        <li><span>재시도 카운트</span> {failureCount}</li>
        <li><span>출처</span> {fromCache ? '🟢 localStorage 캐시' : '🌐 네트워크'}</li>
      </ul>
    </div>
  )
}

function TanstackPanel({ url }) {
  const { data, isPending, isError, dataUpdatedAt, failureCount, isFetching } =
    useCustomFetchTanstack(url)

  return (
    <div className="panel">
      <h3>오른쪽 — TanStack Query</h3>
      <p className="muted small">
        <code>useCustomFetchTanstack(url)</code>
      </p>

      <div className="status">
        <span>isPending: <b>{String(isPending)}</b></span>
        <span>isError: <b>{String(isError)}</b></span>
        <span>isFetching: <b>{String(isFetching)}</b></span>
      </div>

      {isPending && <p>⏳ Loading… (재시도 {failureCount}/3)</p>}
      {isError && (
        <p className="error">
          ✗ 3회 재시도 후 실패 (TanStack Query 자체 retryDelay 적용)
        </p>
      )}
      {!isPending && !isError && data && (
        <p>{summarize(data)}</p>
      )}

      <ul className="kv mini">
        <li><span>마지막 fetch</span> {fmt(dataUpdatedAt || null)}</li>
        <li><span>실패 횟수</span> {failureCount}</li>
        <li>
          <span>출처</span>{' '}
          {!isFetching && data ? '🟢 메모리 캐시 hit' : '🌐 네트워크'}
        </li>
      </ul>
    </div>
  )
}

