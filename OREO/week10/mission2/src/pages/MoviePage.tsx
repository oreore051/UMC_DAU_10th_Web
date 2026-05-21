import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetail, tmdbImage } from '../api/tmdb'

// 미션2 — `/movies/:movieId` 경로의 영화 상세 페이지.
// 워크북: "실제로 디자인을 할 필요는 없습니다" — 라우팅 동작 확인이 우선.
// 그래도 최소 정보(제목·평점·줄거리 + IMDb 링크)는 보여줌.

export default function MoviePage() {
  const params = useParams<{ movieId: string }>()
  const movieId = Number(params.movieId)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['movie', movieId, 'ko-KR'],
    queryFn: () => fetchMovieDetail(movieId, 'ko-KR'),
    enabled: Number.isFinite(movieId) && movieId > 0,
    staleTime: 1000 * 60 * 10,
  })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-indigo-700 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm text-indigo-200 hover:text-white">
            ← 검색으로 돌아가기
          </Link>
          <span className="text-xs text-indigo-300">/movies/{movieId}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {isPending && <p className="py-20 text-center text-gray-400">불러오는 중…</p>}
        {isError && (
          <p className="py-20 text-center text-red-500">
            오류: {(error as Error).message}
          </p>
        )}
        {data && (
          <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row">
              {data.poster_path ? (
                <img
                  src={tmdbImage(data.poster_path, 'w300')}
                  alt={data.title}
                  className="w-full max-w-[200px] rounded-lg shadow"
                />
              ) : (
                <div className="flex h-72 w-48 items-center justify-center rounded-lg bg-gray-100 text-3xl text-gray-300">
                  🎬
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
                {data.tagline && (
                  <p className="mt-1 text-sm italic text-gray-500">"{data.tagline}"</p>
                )}
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-400">평점</dt>
                    <dd className="font-semibold text-amber-500">
                      ⭐ {data.vote_average.toFixed(1)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">개봉일</dt>
                    <dd className="font-semibold text-gray-700">{data.release_date || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">러닝타임</dt>
                    <dd className="font-semibold text-gray-700">
                      {data.runtime ? `${data.runtime}분` : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">장르</dt>
                    <dd className="font-semibold text-gray-700">
                      {data.genres.map((g) => g.name).join(', ') || '-'}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {data.overview || '줄거리 정보가 없어요.'}
                </p>
                <a
                  href={`https://www.imdb.com/find?q=${encodeURIComponent(data.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-500"
                >
                  🎬 IMDb에서 검색하기
                </a>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
