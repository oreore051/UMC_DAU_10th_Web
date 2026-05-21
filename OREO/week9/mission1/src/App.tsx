import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './store'
import { calculateTotals } from './features/cart/cartSlice'
import Navbar from './components/Navbar'
import CartList from './components/CartList'
import Footer from './components/Footer'

export default function App() {
  const dispatch = useAppDispatch()
  // cartItems가 바뀔 때마다 합계 재계산.
  // increase/decrease/removeItem 후 자동으로 amount·total 동기화.
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
    </div>
  )
}
