import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './store'
import { calculateTotals } from './features/cart/cartSlice'
import Navbar from './components/Navbar'
import CartList from './components/CartList'
import Footer from './components/Footer'
import Modal from './components/Modal'

export default function App() {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((state) => state.cart.cartItems)

  useEffect(() => {
    dispatch(calculateTotals())
  }, [dispatch, cartItems])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="flex-1">
        <CartList />
      </main>
      <Footer />
      {/* modalSlice.isOpen 이 true일 때만 내부에서 렌더 */}
      <Modal />
    </div>
  )
}
