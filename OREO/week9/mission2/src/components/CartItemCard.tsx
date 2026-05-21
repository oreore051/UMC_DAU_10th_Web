import { useAppDispatch } from '../store'
import { decrease, increase, removeItem } from '../features/cart/cartSlice'
import type { CartItem } from '../constants/cartItems'

interface Props {
  item: CartItem
}

// 한 아이템(LP) 카드. 수량 +/- 와 제거 버튼.
export default function CartItemCard({ item }: Props) {
  const dispatch = useAppDispatch()

  return (
    <article className="flex items-center gap-4 border-b border-gray-200 py-5">
      <img
        src={item.img}
        alt={item.title}
        className="h-24 w-24 rounded-md object-cover shadow-sm"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-base font-semibold text-gray-900">
          {item.title}
        </h3>
        <p className="truncate text-sm text-gray-500">{item.singer}</p>
        <p className="mt-1 text-sm font-medium text-violet-700">
          {Number(item.price).toLocaleString()}원
        </p>
        <button
          type="button"
          onClick={() => dispatch(removeItem(item.id))}
          className="mt-1 text-xs text-gray-400 hover:text-red-500"
        >
          제거
        </button>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          aria-label="수량 증가"
          onClick={() => dispatch(increase(item.id))}
          className="text-violet-600 hover:text-violet-800"
        >
          ▲
        </button>
        <span className="min-w-6 text-center font-semibold tabular-nums">
          {item.amount}
        </span>
        <button
          type="button"
          aria-label="수량 감소"
          onClick={() => dispatch(decrease(item.id))}
          className="text-violet-600 hover:text-violet-800"
        >
          ▼
        </button>
      </div>
    </article>
  )
}
