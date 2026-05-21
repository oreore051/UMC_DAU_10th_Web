# Week 9 — 실습 1: useReducer

UMC 10th DAU Web · 9주차 실습 — **useReducer 두 가지 대표 패턴(Counter / Form)을 TypeScript로 직접 구현**

---

## 1. useReducer 란?

> 상태 업데이트 로직을 reducer 함수 한 곳에 모아 깔끔하게 관리할 수 있게 도와주는 React 훅.

`useState`로도 상태를 만들 수 있지만, **액션이 여러 가지**거나 **상태가 객체 형태로 복잡**해질 때 `useReducer`가 더 적합합니다.

### 왜?
| 상황 | useState | useReducer |
|---|---|---|
| 단순 boolean·숫자 | 👍 | 과함 |
| 액션이 여러 개 (증가/감소/리셋) | if/else 난무 | switch로 명확 |
| 객체 상태 + 여러 필드 | 매번 spread 반복 | reducer 한 곳에서 처리 |
| 컴포넌트 외부 테스트 | 어려움 | reducer 순수 함수라 쉬움 |
| props drilling | state 전달 필요 | dispatch만 내리면 됨 |

---

## 2. 기본 문법

```ts
const [state, dispatch] = useReducer(reducer, initialState)
```
- **state** — 현재 상태
- **dispatch** — 액션을 보내는 함수
- **reducer** — `(state, action) => newState` 형태의 순수 함수
- **initialState** — 초기 상태

TS에서는 액션을 **discriminated union**으로 묶어 타입 안전성을 확보:
```ts
type Action =
  | { type: 'increment' }
  | { type: 'setName'; payload: string }
```

---

## 3. 구현한 두 가지 예제

### (a) `Counter.tsx` — 단순 숫자 상태
- 액션 3종: `increment` / `decrement` / `reset`
- 같은 패턴을 `useState`로 짜면 함수 3개가 컴포넌트 안에 흩어지는데, reducer 한 군데로 묶어서 응집도 ↑

### (b) `Form.tsx` — 객체 상태
- `{ name: string; age: number }` 객체
- 액션 payload에 따라 특정 필드만 갱신 (`...state` spread로 immutable 업데이트)
- `reset`은 `initialForm`을 반환만 하면 끝 → 필드가 늘어도 `reset` 로직은 그대로

---

## 4. 학습 회고

### ✅ 이해한 점
- **reducer는 순수 함수** — 입력(state, action)이 같으면 출력(newState)도 같다. 그래서 컴포넌트 바깥에 두고 단위 테스트 가능. (`expect(reducer({count:0}, {type:'increment'})).toEqual({count:1})` 같은 식)
- **discriminated union 패턴** — `Action`을 `| { type: 'A' } | { type: 'B'; payload: X }`로 정의하면, switch 안에서 `action.type === 'B'` 일 때만 `action.payload`가 자동 추론됨
- **dispatch만 props로 전달** — 자식 컴포넌트에 state 전체를 내릴 필요 없이 dispatch 하나로 모든 액션 호출 가능. props drilling 감소

### 🧩 어려운 점 & 개선 방법
- **TS 액션 타입을 처음 작성할 때 헷갈림** — `{ type: 'setName' } | { type: 'setName'; payload: string }`처럼 같은 type이 중복 정의되면 안 됨. **개선**: 액션 type 별로 payload 유무를 명확히 분리해서 한 번씩만 정의
- **객체 상태에서 매번 `...state`를 빠뜨릴 위험** — `return { name: action.payload }` 처럼 spread를 깜박하면 나머지 필드가 사라짐. **개선**: ESLint에 `no-implicit-coercion` 같은 룰을 더 두거나, Immer 같은 라이브러리를 함께 쓰는 방법도 있음 (Redux Toolkit이 내부에서 쓰는 패턴)
- **default 케이스 처리** — switch에서 default를 빼먹으면 type narrowing은 되지만, 알 수 없는 action.type 들어왔을 때 state가 undefined 될 위험. **개선**: 항상 `return state`로 fallback

### 🔄 회고
- 단순 카운터에서는 useState 두 줄로 끝나는데 useReducer는 boilerplate가 더 큼. 그래서 **언제 어떤 걸 쓸지 판단이 중요**
- 다음 미션(Redux Toolkit)에서는 `createSlice`가 reducer + action을 자동 생성해줘서 boilerplate를 줄여준다는 것을 알게 됨. useReducer를 먼저 손으로 짜본 게 Redux Toolkit이 무엇을 자동화하는지 이해하는 데 도움이 됨

---

## 참고 자료
- [React 공식 문서 — useReducer](https://react.dev/reference/react/useReducer)
- 강의 영상 (워크북 링크)

---

## 실행
```bash
npm install
npm run dev
```
