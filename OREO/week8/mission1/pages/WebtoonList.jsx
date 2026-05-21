import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchWebtoons } from '../api/webtoons.js'
import { qk } from '../lib/queryKeys.js'
import { SkeletonGrid } from '../components/Skeleton.jsx'

const PAGE_SIZE = 12

export default function WebtoonList() {
  const [sort, setSort] = useState('newest')
  const sentinelRef = useRef(null)

  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: qk.webtoons.list({ sort }),
    queryFn: ({ pageParam = 1 }) =>
      fetchWebtoons({ sort, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 1,
    // 서버 응답의 hasNext / page를 보고 다음 pageParam 계산.
    // undefined를 반환하면 hasNextPage가 false가 됨.
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })

  // 바닥 감지 → 자동 로딩.
  // sentinel 요소가 화면에 들어오면 fetchNextPage 호출.
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

  const items = data?.pages.flatMap((p) => p.items) ?? []

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
        </div>
      </header>

      {/* 초기 로딩: 화면 전체 스켈레톤 그리드 */}
      {isPending && <SkeletonGrid count={PAGE_SIZE} />}

      {isError && (
        <div className="centered">
          <p>오류: {error?.message ?? '데이터를 불러오지 못했어요.'}</p>
          <button className="btn small" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {!isPending && !isError && (
        <>
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

          {/* 추가 로딩: 하단에만 스켈레톤 4개 (초기 로딩 위치와 분리) */}
          {isFetchingNextPage && <SkeletonGrid count={4} />}

          <div ref={sentinelRef} style={{ height: 1 }} />

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
        </>
      )}
    </section>
  )
}
