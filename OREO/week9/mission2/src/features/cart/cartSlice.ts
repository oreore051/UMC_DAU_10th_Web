import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import cartItemsMock, { type CartItem } from '../../constants/cartItems'

// Redux Toolkit 의 createSlice 패턴.
// reducer 안에서 mutate처럼 보이는 코드(예: item.amount += 1)를 써도
// 내부적으로 Immer가 immutable update로 변환해준다.
//
// useReducer + dispatch 패턴을 한 단계 더 자동화한 셈:
//   - action type 문자열(constants) 정의 → createSlice 가 자동 생성
//   - reducer switch-case → reducers 객체 안의 메서드
//   - 액션 생성자 함수 → slice.actions 로 export

export interface CartState {
  cartItems: CartItem[]
  amount: number
  total: number
}

// 초기 합계도 mock 기준으로 계산해서 들고 시작.
const initialAmount = cartItemsMock.reduce((acc, item) => acc + item.amount, 0)
const initialTotal = cartItemsMock.reduce(
  (acc, item) => acc + Number(item.price) * item.amount,
  0,
)

const initialState: CartState = {
  cartItems: cartItemsMock,
  amount: initialAmount,
  total: initialTotal,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // 1) 수량 증가 — payload는 id
    increase(state, action: PayloadAction<string>) {
      const item = state.cartItems.find((it) => it.id === action.payload)
      if (item) item.amount += 1
    },

    // 2) 수량 감소 — 1 이하로 떨어지면 자동 제거
    decrease(state, action: PayloadAction<string>) {
      const item = state.cartItems.find((it) => it.id === action.payload)
      if (!item) return
      if (item.amount <= 1) {
        state.cartItems = state.cartItems.filter((it) => it.id !== action.payload)
      } else {
        item.amount -= 1
      }
    },

    // 3) 단일 아이템 제거
    removeItem(state, action: PayloadAction<string>) {
      state.cartItems = state.cartItems.filter((it) => it.id !== action.payload)
    },

    // 4) 전체 삭제 — 합계도 0 으로
    clearCart(state) {
      state.cartItems = []
      state.amount = 0
      state.total = 0
    },

    // 5) 합계 재계산 — 위 액션들이 발화한 뒤 매번 호출되어 amount/total을 동기화
    calculateTotals(state) {
      let amount = 0
      let total = 0
      state.cartItems.forEach((item) => {
        amount += item.amount
        total += Number(item.price) * item.amount
      })
      state.amount = amount
      state.total = total
    },
  },
})

export const { increase, decrease, removeItem, clearCart, calculateTotals } =
  cartSlice.actions

export default cartSlice.reducer
