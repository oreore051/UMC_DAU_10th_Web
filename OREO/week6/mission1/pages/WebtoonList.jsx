import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchWebtoons } from '../api/webtoons.js'

export default function WebtoonList() {
  const [sort, setSort] = useState('newest')

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    // queryKey에 sort를 포함 → 정렬이 바뀌면 별도 캐시로 동작.
    queryKey: ['webtoons', { sort, page: 1, size: 12 }],
    queryFn: () => fetchWebtoons({ sort, page: 1, size: 12 }),
    // 목록은 자주 바뀌지 않으므로 staleTime을 1분 정도로 짧게 설정.
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // 정렬 토글 깜빡임 방지
  })

  return (
    <section className="page">
      <header className="list-header">
        <h1>웹툰 목록</h1>
        <div className="sort-toggle">
          <button
            type="button"
            className={`btn small ${sort === 'newest' ? '' : 'ghost'}`}
            onClick={() => setSort('newest')}
          >
            최신순
          </button>
          <button
            type="button"
            className={`btn small ${sort === 'oldest' ? '' : 'ghost'}`}
            onClick={() => setSort('oldest')}
          >
            오래된순
          </button>
          {isFetching && <span className="muted">동기화 중…</span>}
        </div>
      </header>

      {isPending && (
        <div className="centered">
          <span className="spinner" />
          <p>불러오는 중…</p>
        </div>
      )}

      {isError && (
        <div className="centered">
          <p>오류: {error?.message ?? '데이터를 불러오지 못했어요.'}</p>
          <button className="btn small" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {data && (
        <ul className="card-grid">
          {data.items.map((w) => (
            <li key={w.id} className="card">
              <Link to={`/webtoons/${w.id}`} className="card-link">
                <div className="thumb">
                  <img src={w.thumbnail} alt={w.title} loading="lazy" />
                  <div className="overlay">
                    <h3>{w.title}</h3>
                    <p className="meta">
                      {new Date(w.createdAt).toLocaleDateString()} · ❤️ {w.likes}
                    </p>
                  </div>
                </div>
                <div className="card-body">
                  <h4 className="title">{w.title}</h4>
                  <p className="muted small">{w.author}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
