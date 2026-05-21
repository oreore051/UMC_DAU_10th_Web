# Week 9 — Mission 2: Modal Slice 추가

UMC 10th DAU Web · 9주차 미션 2 — **모달 상태도 Redux로 관리. cartSlice / modalSlice를 별도 파일로 분리하고, 컴포넌트에서는 useState를 일절 쓰지 않고 dispatch만으로 UI를 제어**

미션1 베이스에 `modalSlice`만 추가했습니다.

---

## Slice 분리

```
src/features/
  cart/
    cartSlice.ts        ← 미션1 그대로
  modal/
    modalSlice.ts       ← 신규
src/store/index.ts
  reducer: {
    cart: cartReducer,
    modal: modalReducer,      ← 한 줄 추가
  }
```

`createSlice`의 장점이 여기서 드러남 — 새 슬라이스 추가 비용이 한 줄.

---

## `modalSlice` 설계

```ts
interface ModalState { isOpen: boolean }
const initialState: ModalState = { isOpen: false }

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal(state)  { state.isOpen = true  },
    closeModal(state) { state.isOpen = false },
  },
})
```

- 액션 두 개만으로 충분 — 토글이 필요한 곳에서도 의도가 분명한 `openModal()` / `closeModal()` 을 호출
- 컴포넌트에 `useState(false)` 단 한 줄도 두지 않음

---

## 흐름

```
[전체 삭제 버튼 클릭]
  └─> dispatch(openModal())
       └─> store.modal.isOpen = true
            └─> <Modal /> 가 렌더 (오버레이 + 확인 다이얼로그)

[아니요 클릭] → dispatch(closeModal())
[네 클릭]    → dispatch(clearCart()) + dispatch(closeModal())
```

**한 컴포넌트(`Modal`)가 두 슬라이스의 액션을 같이 호출하는 패턴**도 자연스럽게 등장 — Redux의 단방향 흐름 안에서 cart 와 modal 이 독립적이지만 함께 협력.

---

## 컴포넌트에 useState 0개

- `CartList.tsx` — 전체 삭제 버튼이 `dispatch(openModal())`
- `Modal.tsx` — `useAppSelector(state => state.modal.isOpen)` + 두 가지 dispatch
- `App.tsx` — `<Modal />` 을 항상 마운트하고, 내부에서 `isOpen` 가드

→ 모달 UI 코드에서 `useState`를 검색하면 한 곳도 안 나옴.

---

## 미션 체크리스트

### 1. Slice 분리
- [x] cartSlice / modalSlice 서로 다른 파일
- [x] store reducer에 각각 별도 등록

### 2. Modal Slice
- [x] `isOpen: boolean` 상태
- [x] `openModal()` / `closeModal()` 리듀서
- [x] 컴포넌트에서 useState 없이 dispatch만 사용

### 3. Modal UI
- [x] 어두운 반투명 오버레이 (`bg-black/50`)
- [x] `isOpen=true` 일 때만 렌더
- [x] "아니요" → closeModal
- [x] "네" → clearCart + closeModal

### 4. Reducer 중심
- [x] 열림/닫힘 상태가 modalSlice에서만 변경됨
- [x] 모달 컴포넌트 내부에 useState 없음

### 5. 동작 테스트
- [x] 전체 삭제 버튼 → 모달 등장
- [x] 아니요 → 모달만 닫힘
- [x] 네 → 전체 삭제 + 모달 닫힘

---

## 실행

```bash
npm install
npm run dev
```
