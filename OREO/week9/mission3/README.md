# Week 9 — Mission 3: Zustand 리팩토링

UMC 10th DAU Web · 9주차 미션 3 — **미션 2의 Redux Toolkit 코드를 Zustand로 전환. cart + modal 상태를 하나의 store에 묶고, 컴포넌트에서 필요한 것만 꺼내 쓰는 형태**

---

## 폴더 비교

| 항목 | 미션 2 (Redux) | 미션 3 (Zustand) |
|---|---|---|
| 상태 정의 | `features/cart/cartSlice.ts` + `features/modal/modalSlice.ts` | `stores/usePlayListStore.ts` 하나로 통합 |
| 중앙 저장소 | `store/index.ts` (configureStore) | 모듈 싱글톤 (`create(() => ({ ... }))`) |
| Provider | `<Provider store={store}>` | **없음** (모든 컴포넌트가 같은 store 인스턴스 자동 공유) |
| 의존성 | `@reduxjs/toolkit` + `react-redux` | `zustand` 하나 |
| 컴포넌트 접근 | `useAppSelector`/`useAppDispatch` + actions import | `usePlayListStore(state => state.x)` 한 줄 |

---

## Redux → Zustand 매핑

```ts
// Redux
const dispatch = useAppDispatch()
const cartItems = useAppSelector((s) => s.cart.cartItems)
dispatch(increase(id))

// Zustand
const { cartItems, increase } = usePlayListStore()
increase(id)
```

### reducer → set 변환

| Redux Toolkit | Zustand |
|---|---|
| `state.amount += 1` (Immer 처리) | `set((state) => ({ amount: state.amount + 1 }))` |
| `state.cartItems = state.cartItems.filter(...)` | `set((state) => ({ cartItems: state.cartItems.filter(...) }))` |
| state 자체 변경(`state.isOpen = true`) | `set({ isModalOpen: true })` |

> Redux Toolkit이 Immer로 가려주던 immutable update를 직접 spread/map으로 처리.

---

## `usePlayListStore` 통합 store

```ts
interface State {
  cartItems: CartItem[]
  amount: number
  total: number
  isModalOpen: boolean
}

interface Actions {
  increase / decrease / removeItem / clearCart / calculateTotals
  openModal / closeModal
  confirmClear     // ← cart + modal 합성 액션
}

export const usePlayListStore = create<State & Actions>((set, get) => ({ ... }))
```

### 두 슬라이스를 하나로 묶을 때 생긴 가장 큰 차이 — **합성 액션**

Redux에서는 `"네"` 클릭 시 `dispatch(clearCart()) + dispatch(closeModal())` 두 번 dispatch했어야 함. Zustand는 store 안에서 다른 액션을 자유롭게 호출할 수 있어서 **`confirmClear()` 하나로 묶음**:

```ts
confirmClear: () => {
  get().clearCart()
  set({ isModalOpen: false })
}
```

컴포넌트 코드도 `onClick={confirmClear}` 한 줄로 줄어듦.

---

## 컴포넌트에서 Redux 흔적 0

- `useSelector` / `useDispatch` → 모두 제거
- `<Provider>` → `main.tsx`에서 제거
- 액션 import → store 자체에서 함수 꺼내 쓰므로 더 이상 필요 없음
- `useAppSelector` / `useAppDispatch` 같은 헬퍼 훅 → 제거

---

## 미션 체크리스트

### 1. Zustand store 생성
- [x] `create()`로 store 정의
- [x] cart / modal 상태값을 초기값으로 옮김
- [x] TS 인터페이스로 State & Actions 정의

### 2. 액션/리듀서 로직 이전
- [x] increase / decrease / removeItem / clearCart / calculateTotals 모두 이전
- [x] **동일한 이름·시그니처** 유지 (컴포넌트 수정 최소화)
- [x] reducer mutation 코드를 `set((state) => ({ ... }))`로 변환

### 3. 모달 상태도 Zustand로
- [x] `isModalOpen`을 store 상태로 옮김
- [x] `openModal` / `closeModal` 별도 액션
- [x] `confirmClear` 합성 액션으로 모달 + cart 연동

### 4. 컴포넌트 정리
- [x] `useSelector` / `useDispatch` 제거
- [x] `usePlayListStore` 셀렉터/구조 분해 할당으로 변경
- [x] `<Provider>` 제거 (`main.tsx`)
- [x] 사용 안 하는 redux 의존성 `package.json`에서 제거

### 5. 동작 동일성
- [x] Redux 버전과 화면 동작 완전 동일
- [x] 모달 "네/아니요" 시나리오도 그대로 동작

---

## 실행

```bash
npm install
npm run dev
```
