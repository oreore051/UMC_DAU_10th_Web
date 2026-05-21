import { usePlayListStore } from '../stores/usePlayListStore'
import type { CartItem } from '../constants/cartItems'

interface Props {
  item: CartItem
}

// Zustand 마이그레이션 포인트:
//   useDispatch + actions → store에서 함수 자체를 구조 분해 할당으로 꺼내옴.
//   이름과 시그니처가 Redux 버전과 동일해서 JSX 내부는 dispatch(...) 만 떼면 됨.
export default function CartItemCard({ item }: Props) {
  const { increase, decrease, removeItem } = usePlayListStore()

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
          onClick={() => removeItem(item.id)}
          className="mt-1 text-xs text-gray-400 hover:text-red-500"
        >
          제거
        </button>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          aria-label="수량 증가"
          onClick={() => increase(item.id)}
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
          onClick={() => decrease(item.id)}
          className="text-violet-600 hover:text-violet-800"
        >
          ▼
        </button>
      </div>
    </article>
  )
}
