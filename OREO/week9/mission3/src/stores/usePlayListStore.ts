import { create } from 'zustand'
import cartItemsMock, { type CartItem } from '../constants/cartItems'

// 미션 3 — Redux Toolkit으로 만들었던 cart + modal 상태를 Zustand 하나로 통합.
//
// Redux와의 매핑:
//   - state                        ↔ store가 들고 있는 필드들
//   - dispatch(action)             ↔ 직접 함수 호출 (store.increase(id))
//   - reducer 안의 state mutation  ↔ set((state) => ({ ... }))
//   - useSelector                  ↔ usePlayListStore(state => state.cartItems)
//
// 한 store 안에 cart + modal 상태/액션을 묶고, 컴포넌트에서는 필요한 것만 꺼내 쓰는 형태.

interface State {
  cartItems: CartItem[]
  amount: number
  total: number
  isModalOpen: boolean
}

interface Actions {
  // cart actions — 이름/시그니처를 Redux 버전과 동일하게 유지해 컴포넌트 수정 최소화
  increase: (id: string) => void
  decrease: (id: string) => void
  removeItem: (id: string) => void
  clearCart: () => void
  calculateTotals: () => void
  // modal actions
  openModal: () => void
  closeModal: () => void
  // modal "네" 클릭 시 한 번에 처리 — clearCart + closeModal
  confirmClear: () => void
}

type PlayListStore = State & Actions

const initialAmount = cartItemsMock.reduce((acc, item) => acc + item.amount, 0)
const initialTotal = cartItemsMock.reduce(
  (acc, item) => acc + Number(item.price) * item.amount,
  0,
)

export const usePlayListStore = create<PlayListStore>((set, get) => ({
  // ── state
  cartItems: cartItemsMock,
  amount: initialAmount,
  total: initialTotal,
  isModalOpen: false,

  // ── cart actions ────────────────────────────────
  increase: (id) =>
    set((state) => ({
      cartItems: state.cartItems.map((it) =>
        it.id === id ? { ...it, amount: it.amount + 1 } : it,
      ),
    })),

  decrease: (id) =>
    set((state) => {
      const target = state.cartItems.find((it) => it.id === id)
      if (!target) return state
      if (target.amount <= 1) {
        return { cartItems: state.cartItems.filter((it) => it.id !== id) }
      }
      return {
        cartItems: state.cartItems.map((it) =>
          it.id === id ? { ...it, amount: it.amount - 1 } : it,
        ),
      }
    }),

  removeItem: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((it) => it.id !== id),
    })),

  clearCart: () => set({ cartItems: [], amount: 0, total: 0 }),

  calculateTotals: () => {
    const { cartItems } = get()
    let amount = 0
    let total = 0
    cartItems.forEach((item) => {
      amount += item.amount
      total += Number(item.price) * item.amount
    })
    set({ amount, total })
  },

  // ── modal actions ───────────────────────────────
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  // 두 상태(cart + modal)를 잇는 합성 액션.
  // Redux에서는 컴포넌트가 dispatch(clearCart) + dispatch(closeModal) 두 번 했지만,
  // Zustand에서는 store 안의 함수가 다른 액션을 직접 호출할 수 있어 한 곳에 묶을 수 있다.
  confirmClear: () => {
    get().clearCart()
    set({ isModalOpen: false })
  },
}))
