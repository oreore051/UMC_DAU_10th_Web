import { useEffect, useState } from 'react'

// 8주차 미션1에서 만든 useDebounce 그대로 TS 화.
// 검색어 입력 중에는 API 호출을 미루고, 입력이 멈춘 뒤 delay 후 한 번만 발화.
export default function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
