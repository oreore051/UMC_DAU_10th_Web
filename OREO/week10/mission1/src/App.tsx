import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchMovies, type Movie } from './api/tmdb'
import useDebounce from './hooks/useDebounce'
import SearchForm, { type Language } from './components/SearchForm'
import MovieList from './components/MovieList'
import MovieModal from './components/MovieModal'

// 🎯 미션1 최적화 포인트 정리 (자세한 내용은 README의 "성능 최적화" 섹션)
//
//  - useDebounce: query 입력 중 매번 API 호출되는 걸 방지 (8주차 미션1 패턴)
//  - useCallback: SearchForm·MovieCard에 내려주는 콜백들의 참조를 고정.
//                 부모(App)의 다른 state가 바뀌어도 자식 memo가 깨지지 않음
//  - useMemo:     평점이 일정 이상인 영화만 필터링·정렬한 파생 배열을 메모이제이션
//  - memo:        SearchForm / MovieList / MovieCard 세 컴포넌트 모두 memo로 감쌈

const MIN_VOTE_FOR_LIST = 0 // 필요하면 6.0 등으로 필터링 가능

export default function App() {
  const [query, setQuery] = useState('')
  const [includeAdult, setIncludeAdult] = useState(false)
  const [language, setLanguage] = useState<Language>('ko-KR')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // debounce된 검색어 — query가 빠르게 바뀌어도 300ms 멈춰야 API 호출
  const debouncedQuery = useDebounce(query, 300)

  const trimmed = debouncedQuery.trim()
  const enabled = trimmed.length > 0

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ['movies', 'search', { q: trimmed, language, includeAdult }],
    queryFn: () => searchMovies({ query: trimmed, language, includeAdult }),
    enabled,
    staleTime: 1000 * 60 * 5,
  })

  // 🎯 useMemo — 응답에서 평점 기준 필터링/정렬한 파생 배열.
  // 부모가 selectedId만 바뀌어도 results를 그대로 재계산하지 않도록 캐싱.
  const movies: Movie[] = useMemo(() => {
    if (!data) return []
    return [...data.results]
      .filter((m) => m.vote_average >= MIN_VOTE_FOR_LIST)
      .sort((a, b) => b.vote_average - a.vote_average)
  }, [data])

  // 🎯 useCallback — 자식 memo가 작동하도록 콜백 참조 고정
  const handleQueryChange = useCallback((v: string) => setQuery(v), [])
  const handleAdultChange = useCallback((v: boolean) => setIncludeAdult(v), [])
  const handleLanguageChange = useCallback((v: Language) => setLanguage(v), [])
  const handleSubmit = useCallback(() => {
    // 폼 submit 시 즉시 검색 — debounce 우회용 (Enter로 빠르게 검색하고 싶을 때)
    setQuery((v) => v.trim())
  }, [])
  const handleCardClick = useCallback((id: number) => setSelectedId(id), [])
  const handleModalClose = useCallback(() => setSelectedId(null), [])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold">🎬 UMC 10주차 — 영화 검색</h1>
          <p className="text-sm text-indigo-200">
            TMDB API + useCallback / useMemo / memo 적용
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <SearchForm
          query={query}
          includeAdult={includeAdult}
          language={language}
          onQueryChange={handleQueryChange}
          onAdultChange={handleAdultChange}
          onLanguageChange={handleLanguageChange}
          onSubmit={handleSubmit}
        />

        <section className="mt-6">
          {!enabled && (
            <p className="py-20 text-center text-gray-400">
              검색어를 입력해주세요.
            </p>
          )}
          {enabled && isPending && (
            <p className="py-20 text-center text-gray-400">검색 중…</p>
          )}
          {enabled && isError && (
            <p className="py-20 text-center text-red-500">
              오류: {(error as Error).message}
            </p>
          )}
          {enabled && !isPending && !isError && (
            <>
              <p className="mb-3 text-sm text-gray-500">
                "{trimmed}" 결과 {data?.total_results.toLocaleString() ?? 0}건
                {isFetching && ' · 새로고침 중'}
              </p>
              <MovieList movies={movies} onCardClick={handleCardClick} />
            </>
          )}
        </section>
      </main>

      {selectedId != null && (
        <MovieModal
          movieId={selectedId}
          language={language}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
