import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchWebtoons } from '../api/webtoons.js'
import { qk } from '../lib/queryKeys.js'
import { SkeletonGrid } from '../components/Skeleton.jsx'
import useThrottle, { useThrottleCallback } from '../hooks/useThrottle.js'

const PAGE_SIZE = 12
const SCROLL_THROTTLE_MS = 200
const FETCH_THROTTLE_MS = 1000

export default function WebtoonList() {
  const [sort, setSort] = useState('newest')
  const sentinelRef = useRef(null)

  // 1) 값형 useThrottle 데모 — 스크롤 위치(scrollY) raw vs throttled 비교.
  //    raw는 매 스크롤 프레임마다 바뀌고, throttled는 SCROLL_THROTTLE_MS 주기로만.
  const [scrollY, setScrollY] = useState(0)
  const throttledScrollY = useThrottle(scrollY, SCROLL_THROTTLE_MS)

  useEffect(() => {
    const onScroll = () => setScrollY(Math.round(window.scrollY))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 콘솔에서 두 값의 호출 빈도 차이를 한눈에 보기 위한 로그.
  // raw는 폭포처럼, throttled는 정확히 SCROLL_THROTTLE_MS 간격으로 찍힘.
  useEffect(() => {
    console.log('[scroll raw]', scrollY)
  }, [scrollY])
  useEffect(() => {
    console.log('[scroll throttled]', throttledScrollY)
  }, [throttledScrollY])

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
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })

  // 2) 콜백형 useThrottleCallback — 빠른 스크롤에도 fetchNextPage가
  //    FETCH_THROTTLE_MS 안에 두 번 이상 발화하지 않도록.
  //    IntersectionObserver 콜백이 짧은 간격으로 여러 번 들어와도
  //    실제 페이지 요청은 최대 1초에 한 번.
  const throttledFetch = useThrottleCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('[fetchNextPage] fired', Date.now())
      fetchNextPage()
    }
  }, FETCH_THROTTLE_MS)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          throttledFetch()
        }
      },
      { rootMargin: '120px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [throttledFetch])

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

      {/* 스크롤 throttle 데모 패널 — raw vs throttled 값을 화면에서도 비교 */}
      <div className="scroll-meter" aria-hidden="true">
        <span>
          📏 raw <strong>{scrollY}px</strong>
        </span>
        <span>
          ⏱ throttled({SCROLL_THROTTLE_MS}ms) <strong>{throttledScrollY}px</strong>
        </span>
        <span className="muted small">fetch는 {FETCH_THROTTLE_MS}ms에 한 번만</span>
      </div>

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
