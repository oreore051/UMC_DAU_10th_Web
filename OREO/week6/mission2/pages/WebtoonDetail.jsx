import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchWebtoon } from '../api/webtoons.js'
import CommentSection from '../components/CommentSection.jsx'
import { SkeletonCard } from '../components/Skeleton.jsx'

export default function WebtoonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['webtoon', Number(id)],
    queryFn: () => fetchWebtoon(id),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(id),
  })

  return (
    <section className="page detail-page">
      <button className="btn ghost small back-btn" onClick={() => navigate(-1)}>
        ← 뒤로
      </button>

      {isPending && <DetailSkeleton />}

      {isError && (
        <div className="centered">
          <p>오류: {error?.message ?? '데이터를 불러오지 못했어요.'}</p>
          <button className="btn small" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      )}

      {data && (
        <article className="detail">
          <div className="detail-hero">
            <img src={data.thumbnail} alt={data.title} className="detail-thumb" />
            <div className="detail-meta">
              <h1>{data.title}</h1>
              <p className="muted">{data.author}</p>
              <p className="muted">
                {new Date(data.createdAt).toLocaleDateString()} · ❤️ {data.likes}
              </p>
              <div className="detail-actions">
                <button className="btn small">❤️ 좋아요</button>
                <button className="btn ghost small">수정</button>
                <button className="btn ghost small danger">삭제</button>
              </div>
            </div>
          </div>

          <section className="detail-body">
            <p className="lead">{data.description}</p>
            <p>{data.body}</p>
          </section>

          <CommentSection webtoonId={id} />
        </article>
      )}
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="detail">
      <div className="detail-hero">
        <div className="detail-thumb skeleton-shimmer" />
        <div className="detail-meta">
          <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: 24 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: 14, marginTop: 10 }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: 14, marginTop: 6 }} />
        </div>
      </div>
      <div className="detail-body">
        <div className="skeleton-line skeleton-shimmer" style={{ width: '90%', height: 14 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: 14, marginTop: 8 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '85%', height: 14, marginTop: 8 }} />
      </div>
      <SkeletonCard />
    </div>
  )
}
