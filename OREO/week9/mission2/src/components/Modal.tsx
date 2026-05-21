import { useAppDispatch, useAppSelector } from '../store'
import { closeModal } from '../features/modal/modalSlice'
import { clearCart } from '../features/cart/cartSlice'

// "정말 모두 삭제할까요?" 확인용 모달.
// 컴포넌트 내부에 useState 없음. 모든 상태가 Redux store.modal.isOpen 으로 제어됨.
//
// 흐름:
//   1. CartList의 전체 삭제 클릭 → dispatch(openModal())
//   2. modal.isOpen === true 일 때만 렌더
//   3. 아니요 → dispatch(closeModal())
//   4. 네     → dispatch(clearCart()) + dispatch(closeModal())
export default function Modal() {
  const isOpen = useAppSelector((state) => state.modal.isOpen)
  const dispatch = useAppDispatch()

  if (!isOpen) return null

  const handleConfirm = () => {
    dispatch(clearCart())
    dispatch(closeModal())
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* 어두운 반투명 오버레이 — 클릭 시 닫힘 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => dispatch(closeModal())}
        aria-hidden="true"
      />
      <div className="relative z-10 w-[90%] max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 id="modal-title" className="mb-2 text-2xl font-bold text-gray-900">
          정말 모두 삭제하시겠어요?
        </h2>
        <p className="mb-6 text-gray-500">
          장바구니에 담긴 모든 음반이 삭제됩니다. 이 작업은 되돌릴 수 없어요.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            아니요
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            네, 삭제할래요
          </button>
        </div>
      </div>
    </div>
  )
}
