import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchWebtoon } from '../api/webtoons.js'

export default function WebtoonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['webtoon', Number(id)],
    queryFn: () => fetchWebtoon(id),
    // 상세는 변동이 거의 없으므로 staleTime을 더 길게.
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(id),
  })

  return (
    <section className="page detail-page">
      <button className="btn ghost small back-btn" onClick={() => navigate(-1)}>
        ← 뒤로
      </button>

      {isPending && (
        <div className="centered">
          <span className="spinner" />
          <p>상세 정보를 불러오는 중…</p>
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

          <p className="muted small">
            * 댓글 영역은 미션 2에서 useInfiniteQuery로 구현할 예정이에요.{' '}
            <Link to="/webtoons">목록으로</Link>
          </p>
        </article>
      )}
    </section>
  )
}
