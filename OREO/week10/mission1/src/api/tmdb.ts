import axios from 'axios'

// TMDB API client.
// v4 Read Access Token (Bearer JWT)을 Authorization 헤더에 박는 방식.
// API key 방식(?api_key=)도 가능하지만, v4 token이 권장되는 인증 방식.
const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

export const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 응답 타입 정의 — TMDB가 내려주는 것 중 우리가 쓸 필드만.
export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  adult: boolean
  original_language: string
}

export interface MovieSearchResponse {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface MovieDetail extends Movie {
  runtime: number | null
  genres: { id: number; name: string }[]
  tagline: string
  status: string
}

// TMDB 이미지 호스트 — 사이즈는 w200/w300/w500/original 등.
// poster_path 가 null이면 placeholder를 따로 처리.
export const tmdbImage = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500') => {
  if (!path) return ''
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export async function searchMovies(params: {
  query: string
  language: string
  includeAdult: boolean
  page?: number
}): Promise<MovieSearchResponse> {
  const { data } = await tmdb.get<MovieSearchResponse>('/search/movie', {
    params: {
      query: params.query,
      language: params.language,
      include_adult: params.includeAdult,
      page: params.page ?? 1,
    },
  })
  return data
}

export async function fetchMovieDetail(id: number, language: string): Promise<MovieDetail> {
  const { data } = await tmdb.get<MovieDetail>(`/movie/${id}`, {
    params: { language },
  })
  return data
}
