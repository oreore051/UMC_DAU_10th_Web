import { memo } from 'react'
import type { Movie } from '../api/tmdb'
import MovieCard from './MovieCard'

interface Props {
  movies: Movie[]
  onCardClick: (id: number) => void
}

// MovieList도 memo로 — 영화 배열·onCardClick reference 가 같으면 리렌더 스킵.
// movies 배열을 부모(App)에서 useMemo로 안정시켜 두면 효과 확실.
function MovieList({ movies, onCardClick }: Props) {
  console.log(`[render] <MovieList count=${movies.length} />`)

  if (movies.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        검색 결과가 없어요.
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} onClick={onCardClick} />
        </li>
      ))}
    </ul>
  )
}

export default memo(MovieList)
