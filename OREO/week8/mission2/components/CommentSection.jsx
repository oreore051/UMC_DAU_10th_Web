import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWebtoonComments, createComment } from '../api/webtoons.js'
import { qk } from '../lib/queryKeys.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { SkeletonCommentList } from './Skeleton.jsx'
import CommentItem from './CommentItem.jsx'

const PAGE_SIZE = 10

export default function CommentSection({ webtoonId }) {
  const qc = useQueryClient()
  const { user } = useAuth()
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
    queryKey: qk.webtoons.commentList(webtoonId, { order }),
    queryFn: ({ pageParam = null }) =>
      fetchWebtoonComments({
        webtoonId,
        cursor: pageParam,
        size: PAGE_SIZE,
        order,
      }),
    initialPageParam: null,
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

  // 댓글 생성 — useMutation + onSuccess invalidate
  const createMut = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.webtoons.comments(webtoonId) })
      setDraft('')
    },
  })

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
          if (!trimmed) return
          if (!user) {
            alert('로그인 후 댓글을 남길 수 있어요.')
            return
          }
          createMut.mutate({ webtoonId, content: trimmed })
        }}
      >
        <textarea
          rows={3}
          placeholder={user ? '댓글을 입력하세요' : '로그인 후 댓글을 남길 수 있어요'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!user || createMut.isPending}
        />
        <div className="comment-form-foot">
          <span className="muted small">
            {trimmed.length === 0 ? '내용을 입력해주세요' : `${trimmed.length}자`}
          </span>
          <button
            type="submit"
            className="btn small primary"
            disabled={trimmed.length === 0 || !user || createMut.isPending}
          >
            {createMut.isPending ? '등록 중…' : '등록'}
          </button>
        </div>
        {createMut.isError && (
          <p className="error small">
            ⚠ {createMut.error.response?.data?.message ?? createMut.error.message}
          </p>
        )}
      </form>

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
              <CommentItem
                key={c.id}
                comment={c}
                isMine={user?.id === c.authorId}
                webtoonId={webtoonId}
              />
            ))}
          </ul>

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
