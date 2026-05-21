import { usePlayListStore } from '../stores/usePlayListStore'

// "정말 모두 삭제할까요?" 확인용 모달.
// 컴포넌트 내부에 useState 없음. 모든 상태가 Zustand store.isModalOpen 으로 제어됨.
//
// Zustand 마이그레이션 포인트:
//   Redux에서는 "네" 클릭 시 dispatch(clearCart) + dispatch(closeModal) 두 번 dispatch 했는데,
//   Zustand는 store 안에서 다른 액션을 호출할 수 있으니 confirmClear() 합성 액션으로 묶음.
export default function Modal() {
  const isOpen = usePlayListStore((state) => state.isModalOpen)
  const closeModal = usePlayListStore((state) => state.closeModal)
  const confirmClear = usePlayListStore((state) => state.confirmClear)

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeModal}
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
            onClick={closeModal}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            아니요
          </button>
          <button
            type="button"
            onClick={confirmClear}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            네, 삭제할래요
          </button>
        </div>
      </div>
    </div>
  )
}
