import { useAppDispatch, useAppSelector } from '../store'
import { clearCart } from '../features/cart/cartSlice'
import CartItemCard from './CartItemCard'

export default function CartList() {
  const cartItems = useAppSelector((state) => state.cart.cartItems)
  const dispatch = useAppDispatch()

  if (cartItems.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">장바구니가 비어 있어요</h2>
        <p className="text-gray-500">담긴 음반이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">당신의 장바구니</h2>
        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="rounded-md border border-red-500 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          전체 삭제
        </button>
      </header>
      <div>
        {cartItems.map((item) => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
