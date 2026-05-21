import { createSlice } from '@reduxjs/toolkit'

// 모달의 열림/닫힘 상태만 담당하는 슬라이스.
// useState로도 가능한 단순한 상태지만, 이번 미션의 목적은
// "UI 상태도 Redux로 한 곳에서 관리하는 흐름"을 경험하는 것.
//
// reducer를 두 개로 분리한 이유:
//   - openModal()  : 모달 진입을 명시적으로 표현
//   - closeModal() : 닫기 동작도 dispatch로만 발화
// 컴포넌트에서 useState를 절대 쓰지 않고 dispatch만으로 UI를 제어한다.

export interface ModalState {
  isOpen: boolean
}

const initialState: ModalState = { isOpen: false }

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal(state) {
      state.isOpen = true
    },
    closeModal(state) {
      state.isOpen = false
    },
  },
})

export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer
