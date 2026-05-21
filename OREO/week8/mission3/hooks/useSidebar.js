import { useCallback, useEffect, useState } from 'react'

// Sidebar의 열림/닫힘 상태와 부수 효과(ESC 닫기 · 배경 스크롤 잠금)를
// 한 곳에 모은 커스텀 훅.
//
// 반환 인터페이스:
//   { isOpen, open(), close(), toggle() }
//
// AppLayout 외의 페이지에서도 같은 정책으로 재사용할 수 있도록 추출했다.
export default function useSidebar(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  // ESC 키로 닫기.
  // isOpen=false일 땐 listener를 아예 등록하지 않아 키보드 이벤트 부하를 최소화하고,
  // cleanup에서 removeEventListener로 메모리 누수를 방지.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // 배경 스크롤 잠금.
  // body의 overflow를 'hidden'으로 바꾸고, 닫힐 때 직전 값을 복원.
  // 사이드바가 닫혀 있을 때만 useEffect가 다시 돌면서 cleanup이 발화하므로
  // 이전 overflow 값(빈 문자열 / 'auto' / 'scroll' 등)이 안전하게 되돌아간다.
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  return { isOpen, open, close, toggle }
}
