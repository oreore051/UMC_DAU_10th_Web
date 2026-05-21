import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { searchWebtoons } from '../api/webtoons.js'
import { qk } from '../lib/queryKeys.js'
import useDebounce from '../hooks/useDebounce.js'
import { SkeletonGrid } from '../components/Skeleton.jsx'

const PAGE_SIZE = 12
const DEBOUNCE_DELAY = 300

export default function Search() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY)
  const sentinelRef = useRef(null)

  // 입력값과 debounced 값이 어떻게 다르게 흐르는지 콘솔에서 확인용.
  // 한글 자모 입력 중에는 query만 계속 바뀌고 debouncedQuery는 멈춰 있어야 함.
  useEffect(() => {
    console.log('[input]', JSON.stringify(query))
  }, [query])
  useEffect(() => {
    console.log('[debounced]', JSON.stringify(debouncedQuery))
  }, [debouncedQuery])

  const trimmed = debouncedQuery.trim()
  const enabled = trimmed.length > 0

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    // queryKey에 지연된 값을 넣어야 입력 중 매 키 입력마다 새 쿼리가 만들어지지 않는다.
    queryKey: qk.webtoons.search(trimmed),
    queryFn: ({ pageParam }) =>
      searchWebtoons({ q: trimmed, cursor: pageParam, size: PAGE_SIZE }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // 빈 검색어 / 공백만 입력일 땐 요청 자체를 차단.
    enabled,
    // 최근 검색어로 다시 돌아오면 5분 동안은 서버에 안 물어보고 캐시 그대로.
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '120px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const items = enabled ? data?.pages.flatMap((p) => p.items) ?? [] : []
  const total = enabled ? data?.pages?.[0]?.total ?? null : null

  // 입력은 했는데 아직 debounce 지연 중인 상태를 한 번에 판별.
  const pendingDebounce = enabled && query !== debouncedQuery

  return (
    <section className="page">
      <header className="list-header">
        <h1>🔍 LP 검색</h1>
      </header>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          className="input"
          placeholder="제목·작가·태그로 검색해보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="LP 검색"
        />
        <p
          className="muted small"
          style={{ marginTop: 8 }}
          aria-live="polite"
        >
          {query.trim().length === 0
            ? `검색어를 입력하면 ${DEBOUNCE_DELAY}ms 뒤에 자동으로 찾아드려요.`
            : pendingDebounce
            ? '입력이 끝나길 기다리는 중…'
            : isFetching && !isFetchingNextPage
            ? '검색 중…'
            : total != null
            ? `"${trimmed}" 결과 ${total}건`
            : ''}
        </p>
      </div>

      {!enabled && (
        <div className="centered" style={{ paddingTop: 40 }}>
          <p className="muted">검색어를 입력해주세요.</p>
        </div>
      )}

      {enabled && isPending && <SkeletonGrid count={PAGE_SIZE} />}

      {enabled && isError && (
        <div className="centered">
          <p>오류: {error?.message ?? '데이터를 불러오지 못했어요.'}</p>
          <button className="btn small" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {enabled && !isPending && !isError && (
        <>
          {items.length === 0 ? (
            <div className="centered" style={{ paddingTop: 40 }}>
              <p className="muted">"{trimmed}" 결과가 없어요.</p>
            </div>
          ) : (
            <ul className="card-grid">
              {items.map((w) => (
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

          {isFetchingNextPage && <SkeletonGrid count={4} />}

          <div ref={sentinelRef} style={{ height: 1 }} />

          {items.length > 0 && (
            <p
              className="muted small"
              style={{ textAlign: 'center', marginTop: 24 }}
            >
              {isFetchingNextPage
                ? '더 불러오는 중…'
                : hasNextPage
                ? '아래로 스크롤하면 더 가져와요.'
                : '마지막이에요.'}
            </p>
          )}
        </>
      )}
    </section>
  )
}
