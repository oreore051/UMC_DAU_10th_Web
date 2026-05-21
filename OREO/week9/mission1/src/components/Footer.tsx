import { useAppSelector } from '../store'

// 총 수량과 총 금액을 화면 하단 sticky 영역에 노출.
export default function Footer() {
  const { amount, total } = useAppSelector((state) => state.cart)

  if (amount === 0) return null

  return (
    <footer className="sticky bottom-0 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div className="text-sm text-gray-500">
          총 수량 <strong className="ml-1 text-base text-gray-900">{amount}개</strong>
        </div>
        <div className="text-sm text-gray-500">
          총 결제 금액{' '}
          <strong className="ml-1 text-base text-violet-700">
            {total.toLocaleString()}원
          </strong>
        </div>
      </div>
    </footer>
  )
}
