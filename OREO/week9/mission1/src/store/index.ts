import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import cartReducer from '../features/cart/cartSlice'

// 중앙 저장소. 미션 2 에서 modal slice 가 추가될 자리(`modal: modalReducer`)도
// 같은 방식으로 reducer 객체에 한 줄만 더 붙이면 된다.
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 매번 (state: RootState) => ... 처럼 제네릭을 지정하지 않아도 되도록
// 타입이 박힌 훅을 만들어 컴포넌트에서 가져다 쓰게 한다.
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
