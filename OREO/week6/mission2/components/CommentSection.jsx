import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchWebtoonComments } from '../api/webtoons.js'
import { SkeletonCommentList } from './Skeleton.jsx'

const PAGE_SIZE = 10

export default function CommentSection({ webtoonId }) {
  const [order, setOrder] = useState('newest')
  const [draft, setDraft] = useState('')
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
    queryKey: ['webtoonComments', Number(webtoonId), order],
    queryFn: ({ pageParam = null }) =>
      fetchWebtoonComments({
        webtoonId,
        cursor: pageParam,
        size: PAGE_SIZE,
        order,
      }),
    initialPageParam: null,
    // 커서 기반 페이지네이션: 서버가 nextCursor를 주면 다음 호출의 pageParam이 됨.
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(webtoonId),
    staleTime: 30 * 1000,
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
      { rootMargin: '80px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const comments = data?.pages.flatMap((p) => p.items) ?? []
  const total = data?.pages?.[0]?.total ?? 0
  const trimmed = draft.trim()

  return (
    <section className="comment-section">
      <header className="comment-header">
        <h2>댓글 {total ? `(${total})` : ''}</h2>
        <div className="sort-toggle">
          <button
            type="button"
            className={`btn small ${order === 'newest' ? '' : 'ghost'}`}
            onClick={() => setOrder('newest')}
          >
            최신순
          </button>
          <button
            type="button"
            className={`btn small ${order === 'oldest' ? '' : 'ghost'}`}
            onClick={() => setOrder('oldest')}
          >
            오래된순
          </button>
        </div>
      </header>

      <form
        className="comment-form"
        onSubmit={(e) => {
          e.preventDefault()
          // 다음 주차에서 useMutation으로 실제 등록 연결.
          alert('댓글 등록은 다음 주차(useMutation)에서 구현해요!')
        }}
      >
        <textarea
          rows={3}
          placeholder="댓글을 입력하세요"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="comment-form-foot">
          <span className="muted small">
            {trimmed.length === 0
              ? '내용을 입력해주세요'
              : `${trimmed.length}자`}
          </span>
          <button
            type="submit"
            className="btn small"
            disabled={trimmed.length === 0}
          >
            등록
          </button>
        </div>
      </form>

      {/* 초기 로딩: 상단에 스켈레톤 코멘트 4개 */}
      {isPending && <SkeletonCommentList count={4} />}

      {isError && (
        <div className="centered">
          <p>오류: {error?.message ?? '댓글을 불러오지 못했어요.'}</p>
          <button className="btn small" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {!isPending && !isError && (
        <>
          <ul className="comment-list">
            {comments.map((c) => (
              <li key={c.id} className="comment">
                <div className="comment-meta">
                  <strong>{c.author}</strong>
                  <span className="muted small">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="comment-content">{c.content}</p>
              </li>
            ))}
          </ul>

          {/* 추가 로딩: 하단에만 스켈레톤 2개 */}
          {isFetchingNextPage && <SkeletonCommentList count={2} />}

          <div ref={sentinelRef} style={{ height: 1 }} />

          {!hasNextPage && comments.length > 0 && (
            <p className="muted small" style={{ textAlign: 'center', marginTop: 12 }}>
              댓글의 끝이에요.
            </p>
          )}
          {comments.length === 0 && (
            <p className="muted small" style={{ textAlign: 'center' }}>
              아직 댓글이 없어요.
            </p>
          )}
        </>
      )}
    </section>
  )
}
