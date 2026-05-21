import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchMovies, type Movie } from '../api/tmdb'
import useDebounce from '../hooks/useDebounce'
import SearchForm, { type Language } from '../components/SearchForm'
import MovieList from '../components/MovieList'
import MovieModal from '../components/MovieModal'

// 미션1의 App.tsx 내용을 그대로 옮긴 검색 페이지.
// 카드 클릭 시 (a) 모달을 띄울지 / (b) `/movies/:movieId`로 이동할지 둘 다 지원.
// 미션2 워크북 요구: "/movies/:movieId 페이지 이동이 되는지 확인" → 모달이 아니라 navigate로 변경.

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [includeAdult, setIncludeAdult] = useState(false)
  const [language, setLanguage] = useState<Language>('ko-KR')
  const [previewId, setPreviewId] = useState<number | null>(null)

  const debouncedQuery = useDebounce(query, 300)
  const trimmed = debouncedQuery.trim()
  const enabled = trimmed.length > 0

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ['movies', 'search', { q: trimmed, language, includeAdult }],
    queryFn: () => searchMovies({ query: trimmed, language, includeAdult }),
    enabled,
    staleTime: 1000 * 60 * 5,
  })

  const movies: Movie[] = useMemo(() => {
    if (!data) return []
    return [...data.results].sort((a, b) => b.vote_average - a.vote_average)
  }, [data])

  const handleQueryChange = useCallback((v: string) => setQuery(v), [])
  const handleAdultChange = useCallback((v: boolean) => setIncludeAdult(v), [])
  const handleLanguageChange = useCallback((v: Language) => setLanguage(v), [])
  const handleSubmit = useCallback(() => setQuery((v) => v.trim()), [])

  // ✅ 미션2 — 카드 클릭 시 라우트로 이동 (`/movies/:movieId`)
  const handleCardClick = useCallback(
    (id: number) => navigate(`/movies/${id}`),
    [navigate],
  )

  // 모달 미리보기를 원하면 이 콜백을 사용 (현재는 라우트 이동을 우선)
  const handlePreview = useCallback((id: number) => setPreviewId(id), [])
  const handleModalClose = useCallback(() => setPreviewId(null), [])
  void handlePreview // 미사용 경고 회피 (사용자가 원하면 카드 long-press 등으로 연결)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold">🎬 UMC 10주차 미션2 — Vercel 배포</h1>
          <p className="text-sm text-indigo-200">
            검색 + 최적화 (미션1) + /movies/:movieId 라우팅 + Vercel SPA 설정
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
            <p className="py-20 text-center text-gray-400">검색어를 입력해주세요.</p>
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

      {previewId != null && (
        <MovieModal
          movieId={previewId}
          language={language}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
