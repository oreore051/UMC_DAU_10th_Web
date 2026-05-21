import { useEffect, useState } from 'react'

// 값 지연형 useDebounce.
// value가 마지막으로 바뀐 뒤 delay 동안 다시 안 바뀌면 그제서야 debounced 값으로 반영.
//
// 동작 핵심:
// 1) value(또는 delay)가 바뀔 때마다 setTimeout 예약
// 2) 다음 변경 직전 clearTimeout으로 이전 예약을 취소 (이게 "마지막 입력만 유효" 효과)
// 3) 언마운트 시에도 같은 클린업으로 타이머가 살아남는 누수를 막음
//
// delay 변경 즉시 반영: useEffect의 deps에 delay를 포함했으므로 delay가 바뀌면
// 이전 타이머가 정리되고 새 delay로 다시 예약된다.
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
