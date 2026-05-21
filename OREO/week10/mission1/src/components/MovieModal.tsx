import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetail, tmdbImage } from '../api/tmdb'

interface Props {
  movieId: number
  language: string
  onClose: () => void
}

export default function MovieModal({ movieId, language, onClose }: Props) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['movie', movieId, language],
    queryFn: () => fetchMovieDetail(movieId, language),
    staleTime: 1000 * 60 * 10,
  })

  // ESC 키로 닫기 + body scroll lock (8주차 useSidebar 패턴 응용)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const title = data?.title ?? ''
  const imdbHref = `https://www.imdb.com/find?q=${encodeURIComponent(title)}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          ✕
        </button>

        {isPending && (
          <div className="flex h-80 items-center justify-center text-gray-400">
            영화 정보를 불러오는 중…
          </div>
        )}
        {isError && (
          <div className="flex h-80 items-center justify-center text-red-500">
            정보를 불러오지 못했어요.
          </div>
        )}
        {data && (
          <div className="flex max-h-[90vh] flex-col overflow-y-auto">
            {data.backdrop_path && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                <img
                  src={tmdbImage(data.backdrop_path, 'w500')}
                  alt={data.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h2
                  id="movie-modal-title"
                  className="absolute bottom-4 left-6 right-6 text-3xl font-bold text-white drop-shadow"
                >
                  {data.title}
                </h2>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
              <div className="sm:col-span-1">
                {data.poster_path ? (
                  <img
                    src={tmdbImage(data.poster_path, 'w300')}
                    alt={data.title}
                    className="w-full rounded-lg shadow-md"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-gray-100 text-3xl text-gray-300">
                    🎬
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                {!data.backdrop_path && (
                  <h2 id="movie-modal-title" className="mb-2 text-2xl font-bold text-gray-900">
                    {data.title}
                  </h2>
                )}
                {data.tagline && (
                  <p className="mb-3 text-sm italic text-gray-500">"{data.tagline}"</p>
                )}
                <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-400">평점</dt>
                    <dd className="font-semibold text-amber-500">
                      ⭐ {data.vote_average.toFixed(1)}{' '}
                      <span className="text-xs text-gray-400">({data.vote_count.toLocaleString()})</span>
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
                <h3 className="mb-1 text-sm font-semibold text-gray-700">줄거리</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {data.overview || '줄거리 정보가 없어요.'}
                </p>
                <a
                  href={imdbHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-500"
                >
                  🎬 IMDb에서 검색하기
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
