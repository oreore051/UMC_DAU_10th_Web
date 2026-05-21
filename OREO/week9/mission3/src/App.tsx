import { useEffect } from 'react'
import { usePlayListStore } from './stores/usePlayListStore'
import Navbar from './components/Navbar'
import CartList from './components/CartList'
import Footer from './components/Footer'
import Modal from './components/Modal'

export default function App() {
  // cartItems가 바뀔 때마다 합계 재계산.
  // Zustand에서는 액션 함수도 셀렉터로 꺼낼 수 있다.
  const cartItems = usePlayListStore((state) => state.cartItems)
  const calculateTotals = usePlayListStore((state) => state.calculateTotals)

  useEffect(() => {
    calculateTotals()
  }, [cartItems, calculateTotals])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="flex-1">
        <CartList />
      </main>
      <Footer />
      <Modal />
    </div>
  )
}
