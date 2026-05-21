import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// 공통 모달 컴포넌트.
// - 바깥 영역 클릭으로 닫힘 (요청 사양)
// - X 버튼으로 닫힘
// - Esc로 닫힘
// - body scroll 잠금
// - title을 prop으로 받아 헤더 렌더
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => {
        // 백드롭 자체 클릭만 닫기. 내부 요소 클릭은 무시 (stopPropagation 안 써도 e.target 비교로 충분)
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className={`modal modal-${size}`} role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close"
            aria-label="닫기"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
