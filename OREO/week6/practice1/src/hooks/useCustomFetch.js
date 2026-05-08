import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * 영상/블로그(개발자 매튜 — React Query 알고 쓰기) 흐름대로 단계적으로 만들어 본 훅.
 *
 *   1) 처음: fetch → setData
 *   2) +isPending (로딩 상태)
 *   3) +isError  (에러 상태)
 *   4) +localStorage 캐싱 (staleTime) → 같은 url을 다시 호출하면 캐시 사용
 *   5) +AbortController로 unmount 시 요청 취소
 *   6) +지수 백오프 자동 재시도 (1초 → 2초 → 4초 …)
 *
 * 시연용으로 fetchedAt, failureCount, fromCache도 함께 반환합니다.
 *
 * @param {string} url
 */

const STALE_TIME = 5 * 60 * 1000 // 5분
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000

export function useCustomFetch(url) {
  const [data, setData] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [fetchedAt, setFetchedAt] = useState(null)
  const [failureCount, setFailureCount] = useState(0)
  const [fromCache, setFromCache] = useState(false)

  const abortControllerRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  const storageKey = useMemo(() => `cache::${url}`, [url])

  useEffect(() => {
    setIsError(false)
    setFailureCount(0)
    setFromCache(false)

    // 1) 캐시 hit 체크
    const cached = localStorage.getItem(storageKey)
    if (cached) {
      try {
        const { data: cachedData, lastFetched } = JSON.parse(cached)
        if (Date.now() - lastFetched < STALE_TIME) {
          setData(cachedData)
          setIsPending(false)
          setFetchedAt(lastFetched)
          setFromCache(true)
          return
        }
      } catch {
        // 손상된 캐시면 무시
      }
    }

    // 2) 진짜 fetch
    abortControllerRef.current = new AbortController()
    setIsPending(true)

    const fetchData = async (currentRetry = 0) => {
      try {
        const response = await fetch(url, {
          signal: abortControllerRef.current?.signal,
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()

        const now = Date.now()
        setData(json)
        setIsPending(false)
        setFetchedAt(now)
        setFromCache(false)

        localStorage.setItem(
          storageKey,
          JSON.stringify({ data: json, lastFetched: now }),
        )
      } catch (err) {
        if (err?.name === 'AbortError') return

        if (currentRetry < MAX_RETRIES) {
          // 지수 백오프: 1s → 2s → 4s
          setFailureCount(currentRetry + 1)
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, currentRetry)
          retryTimeoutRef.current = window.setTimeout(() => {
            fetchData(currentRetry + 1)
          }, delay)
        } else {
          setIsError(true)
          setIsPending(false)
        }
      }
    }

    fetchData()

    return () => {
      abortControllerRef.current?.abort()
      if (retryTimeoutRef.current !== null) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [url, storageKey])

  return { data, isPending, isError, fetchedAt, failureCount, fromCache }
}

export function clearCustomFetchCache() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('cache::'))
    .forEach((k) => localStorage.removeItem(k))
}
