# Week 9 — Mission 1: Redux Toolkit UMC Play List

UMC 10th DAU Web · 9주차 미션 1 — **Redux Toolkit + TypeScript + Tailwind CSS로 장바구니 화면 구현**

---

## 폴더 구조

```
src/
  constants/
    cartItems.ts          ← mock data + CartItem 타입
  features/
    cart/
      cartSlice.ts        ← createSlice (increase/decrease/removeItem/clearCart/calculateTotals)
  store/
    index.ts              ← configureStore + 타입 박힌 useAppDispatch/useAppSelector
  components/
    Navbar.tsx            ← 상단 바 + 총 수량 뱃지
    CartList.tsx          ← 헤더 + 전체 삭제 + 카드 리스트
    CartItemCard.tsx      ← 단일 LP 카드 (수량 ▲▼, 제거)
    Footer.tsx            ← 하단 sticky 합계
  App.tsx
  main.tsx                ← <Provider store={store}>
```

---

## Redux Toolkit 핵심

### 1) `createSlice` — boilerplate 제거
`useReducer`로 짜면 action constants + reducer switch + action creators 세 가지를 매번 손으로 작성해야 하는데, `createSlice`는 reducers 객체 하나로 모두 자동 생성:

```ts
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    increase(state, action: PayloadAction<string>) {
      const item = state.cartItems.find((it) => it.id === action.payload)
      if (item) item.amount += 1
    },
    // ...
  },
})

export const { increase, decrease, removeItem, clearCart, calculateTotals } = cartSlice.actions
export default cartSlice.reducer
```

### 2) Immer가 immutable update 대신 처리
`item.amount += 1`처럼 mutable로 보이는 코드를 써도, 내부에서 Immer가 새 객체를 만들어 반환. 직접 `{ ...state, ... }` spread 안 해도 됨.

### 3) 타입 박힌 훅
`useDispatch`와 `useSelector`를 매번 `<RootState>`/`<AppDispatch>` 제네릭으로 부르지 않도록 store 파일에서 한 번 wrap:

```ts
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

컴포넌트에선 `useAppSelector((s) => s.cart.amount)` 처럼 타입 추론이 자동.

---

## 액션 5종 설계

| 액션 | payload | 동작 |
|---|---|---|
| `increase` | `id: string` | 해당 아이템 `amount + 1` |
| `decrease` | `id: string` | `amount - 1`, **1 이하면 자동 제거** |
| `removeItem` | `id: string` | 해당 아이템 완전히 제거 |
| `clearCart` | — | 전체 삭제 + amount·total 0 |
| `calculateTotals` | — | amount/total 재계산 |

`calculateTotals`는 cartItems 변화 후 자동 호출되도록 `App.tsx`의 `useEffect(deps: [cartItems])`에서 dispatch.

---

## UI — Tailwind만 사용

- 색상 톤: violet 700(브랜드) + amber 400(뱃지) + gray scale(텍스트·테두리)
- 카드 그리드: `flex items-center gap-4 border-b py-5`
- 수량 컨트롤: 세로 ▲ ▼ + 숫자(`tabular-nums`)
- 합계 footer: `sticky bottom-0 bg-white border-t`
- Navbar 뱃지: `absolute -top-2 -right-3 rounded-full`

---

## 미션 체크리스트

### 1. 기본 세팅
- [x] `constants/cartItems.ts` 분리 + TS 타입 직접 정의
- [x] mock 데이터를 Redux 초기값으로 사용

### 2. UI / Tailwind
- [x] 전체 화면, 카드, 버튼 모두 Tailwind 클래스로
- [x] 수량 +/- · 전체 삭제 · 총 수량/금액 섹션

### 3. Redux Store
- [x] `configureStore` 로 store 생성
- [x] `cartSlice`를 reducer에 등록
- [x] `<Provider store={store}>` 로 App 감쌈 (main.tsx)

### 4. cartSlice 설계
- [x] 초기 상태: cartItems / amount / total
- [x] 초기 렌더링 시 amount·total 자동 계산
- [x] increase / decrease / removeItem / clearCart / calculateTotals 모두 구현
- [x] decrease가 1 이하로 가면 자동 제거

### 5. 컴포넌트 연결
- [x] `useAppSelector` 로 cartItems / amount / total 표시
- [x] `useAppDispatch` 로 5개 액션 호출
- [x] cartItems 변화 시 `calculateTotals` 자동 dispatch (`useEffect`)

### 6. 동작 점검
- [x] mock 12개 정상 표시
- [x] + 클릭 시 해당 amount 증가, 합계 즉시 반영
- [x] - 클릭 시 감소, 1 아래로 가면 자동 삭제
- [x] 전체 삭제 시 리스트 비고 합계 0

---

## 실행

```bash
npm install
npm run dev   # localhost:5173
```
