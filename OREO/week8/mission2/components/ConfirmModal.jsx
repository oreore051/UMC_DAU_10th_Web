import Modal from './Modal.jsx'

// 위험 액션(탈퇴/삭제 등)에 쓰는 확인 모달.
// confirmDanger=true면 확인 버튼이 빨간 톤.
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '예',
  cancelText = '아니오',
  confirmDanger = false,
  pending = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="btn ghost small"
            onClick={onClose}
            disabled={pending}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn small ${confirmDanger ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? '처리 중…' : confirmText}
          </button>
        </>
      }
    >
      <p className="confirm-message">{message}</p>
    </Modal>
  )
}
