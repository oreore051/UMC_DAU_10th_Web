import { useCallback, useEffect, useRef, useState } from 'react'

// ── 값형 useThrottle ─────────────────────────────────────────────
// value가 빠르게 바뀌어도 interval 주기로만 throttled 값이 업데이트.
// leading edge 동작 — 첫 변경은 즉시 반영, 그 뒤로는 interval 지나야 다시 반영.
// 마지막 미반영 변경은 trailing edge로 한 번 더 반영 (스로틀의 표준 패턴).
//
// 클린업: trailing timer는 다음 변경 / interval 변경 / 언마운트 시 모두 정리.
export default function useThrottle(value, interval = 300) {
  const [throttled, setThrottled] = useState(value)
  const lastUpdatedRef = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastUpdatedRef.current

    if (elapsed >= interval) {
      lastUpdatedRef.current = now
      setThrottled(value)
      return
    }

    const timer = setTimeout(() => {
      lastUpdatedRef.current = Date.now()
      setThrottled(value)
    }, interval - elapsed)

    return () => clearTimeout(timer)
  }, [value, interval])

  return throttled
}

// ── 콜백형 useThrottleCallback ───────────────────────────────────
// 스크롤·리사이즈 같은 이벤트 핸들러용. 반환된 함수를 호출해도
// interval 안에 두 번 이상 들어오면 마지막 한 번만 실행됨.
//
// callbackRef로 최신 콜백을 박아 stale closure를 피한다 (의존성 배열에 callback이
// 들어가지 않으니, 매 렌더마다 새 함수 reference가 생겨도 throttle 상태가 깨지지 않음).
export function useThrottleCallback(callback, interval = 300) {
  const lastCallRef = useRef(0)
  const timerRef = useRef(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // 언마운트 시 trailing timer가 살아남지 않도록 정리.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return useCallback(
    (...args) => {
      const now = Date.now()
      const elapsed = now - lastCallRef.current

      if (elapsed >= interval) {
        lastCallRef.current = now
        callbackRef.current(...args)
        return
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        lastCallRef.current = Date.now()
        callbackRef.current(...args)
      }, interval - elapsed)
    },
    [interval],
  )
}
