import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import cartReducer from '../features/cart/cartSlice'
import modalReducer from '../features/modal/modalSlice'

// 미션 2 — modal slice를 별도 파일로 분리해 reducer 객체에 등록만 추가.
// Slice 추가 비용이 한 줄밖에 안 든다는 게 createSlice 패턴의 강점.
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    modal: modalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
