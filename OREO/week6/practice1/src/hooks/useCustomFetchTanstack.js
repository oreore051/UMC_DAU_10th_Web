import { useQuery } from '@tanstack/react-query'

/**
 * 영상의 "마무리" 코드.
 *
 * 위에서 직접 만든 ~110줄짜리 훅(useCustomFetch.js)이
 * TanStack Query를 쓰면 아래 ~15줄로 줄어들어요.
 *
 * - localStorage 캐싱 → 메모리 캐시 (queryKey)
 * - AbortController → queryFn의 signal 인자
 * - 지수 백오프 retry → retryDelay 옵션
 * - staleTime → staleTime 옵션 (그대로)
 * - 추가 보너스 → gcTime, refetchOnWindowFocus 등 풍부한 옵션
 */
export function useCustomFetchTanstack(url) {
  return useQuery({
    queryKey: [url],
    queryFn: async ({ signal }) => {
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
