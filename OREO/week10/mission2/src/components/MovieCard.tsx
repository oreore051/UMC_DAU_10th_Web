import { memo } from 'react'
import { tmdbImage, type Movie } from '../api/tmdb'

interface Props {
  movie: Movie
  onClick: (id: number) => void
}

// 영화 카드 — 큰 리스트의 한 항목.
// memo로 감싸 부모(MovieList)가 다른 이유로 리렌더되어도 같은 movie+onClick이면 스킵.
function MovieCard({ movie, onClick }: Props) {
  // 카드별 렌더 로그 — 최적화 효과 시각화용
  console.log(`[render] <MovieCard id=${movie.id} />`)

  const poster = tmdbImage(movie.poster_path, 'w300')

  return (
    <button
      type="button"
      onClick={() => onClick(movie.id)}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:shadow-lg"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-gray-100">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">
            🎬
          </div>
        )}
      </div>
      <div className="flex-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {movie.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          ⭐ {movie.vote_average.toFixed(1)} · {movie.release_date || '개봉미정'}
        </p>
      </div>
    </button>
  )
}

export default memo(MovieCard)
