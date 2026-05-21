# Week 10 — 실습 1: useCallback + memo

UMC 10th DAU Web · 10주차 실습 1 — **함수(콜백) 메모이제이션과 컴포넌트 메모이제이션을 직접 코드로 확인**

---

## 1. `useCallback` 이란?

> 함수(콜백)를 메모이제이션해서, 의존성이 바뀌지 않는 한 **같은 함수 참조**를 유지하게 해주는 React 훅.

```ts
const memoized = useCallback(() => {
  // ...
}, [deps])
```

- 컴포넌트가 리렌더돼도 `memoized`의 reference가 그대로 유지됨
- `deps` 배열의 값이 바뀔 때만 새 함수가 만들어짐

### 함수 "메모이제이션" 이 무슨 뜻?
- React는 매 렌더마다 컴포넌트 함수 본문을 다시 실행함 → 그 안에서 만들어지는 모든 인라인 함수(`() => {}`)도 매번 새 객체
- `useCallback`은 "deps가 같으면 직전 렌더에서 만든 함수를 그대로 반환" 한다 → 새 함수를 만들지 않고 재사용

### 언제 새 함수를 만들고, 언제 재사용?
- **재사용**: deps 배열의 모든 값이 직전 렌더와 같을 때
- **새로 만듦**: deps의 값 중 하나라도 바뀌었을 때 (또는 처음 렌더)

---

## 2. 왜 `useCallback` 을 사용하는가

### 불필요한 리렌더링 방지와의 관계
- 자식이 `memo`로 감싸져 있을 때, 부모가 콜백을 props로 내려준다고 가정
- 콜백이 인라인 화살표면 매 렌더마다 새 참조 → `memo`의 얕은 비교가 항상 false → **자식이 매번 리렌더됨**
- `useCallback`으로 참조를 고정하면 → `memo`의 비교가 true → **자식 리렌더 스킵**

### 이득 vs 오버헤드
- **이득**: 자식이 무거운 컴포넌트(큰 리스트·복잡한 폼)일 때 리렌더 비용을 절약
- **오버헤드**: useCallback 자체도 deps 비교 + 클로저 보관 비용. 자식이 가벼우면 오히려 손해
- **결론**: `memo`로 감싼 자식에게 props로 내려가는 콜백, 그리고 `useEffect`의 deps로 들어가는 콜백에만 쓰는 게 안전

---

## 3. 기본 사용법

```tsx
import { useCallback, useState } from 'react'

export default function Parent() {
  const [count, setCount] = useState(0)

  // 1) deps 빈 배열 — 컴포넌트 라이프타임 내내 동일 참조
  const handleAlert = useCallback(() => {
    alert('hi')
  }, [])

  // 2) deps에 외부 값 — 그 값이 바뀔 때만 새 함수
  const handleAddBy = useCallback(
    (n: number) => setCount((c) => c + n),
    [], // setCount는 항상 stable이라 deps 비워도 OK
  )

  return <Child onClick={handleAlert} />
}
```

### `deps` 배열에 무엇을 넣어야 하나
- 콜백 함수 안에서 **참조하는 모든 reactive 값** (state, props, 또 다른 useState/useReducer로 만든 변수)
- 빠뜨리면 → **stale closure**(낡은 값 캡처) 발생
- 정적으로 정해진 값(상수, set 함수 자체)은 deps에 넣지 않아도 됨

### 의존성이 바뀌면?
- 새 클로저로 함수가 다시 만들어지면서 그 시점의 deps 값을 캡처
- 이전 함수 참조는 버려짐 → 자식이 memo로 감싸져 있다면 그 자식도 리렌더 발화

---

## 4. 중요한 개념

### 참조 동일성 (reference equality)
- JS에서 함수·객체는 `===`로 비교할 때 **메모리 주소가 같아야** true
- `() => 1` 두 개를 만들면 내용은 같아도 `===` 비교는 false
- React 최적화(memo, useMemo, useEffect deps)의 모든 비교는 얕은 동등성(`Object.is`) — 결국 참조 동일성에 의존

### 클로저와 상태
- `useCallback` 안에서 state·props를 직접 참조하면 그 함수는 **그 렌더 시점의 값**을 클로저로 잡음
- deps에 포함하면 변경 시 새 함수 → 최신 값 캡처
- 안 포함하면 → **stale closure** (낡은 값을 영원히 들고 있음)

### stale closure 회피 패턴
```tsx
// ❌ count를 deps에 안 넣으면 stale
const onClick = useCallback(() => {
  console.log(count)
}, [])

// ✅ deps에 넣어서 최신 캡처
const onClick = useCallback(() => {
  console.log(count)
}, [count])

// ✅ updater 형태로 setState만 쓰면 count 참조 자체 회피
const onClick = useCallback(() => {
  setCount((prev) => prev + 1)
}, [])
```

---

## 5. 콜백 메모이제이션 예시 (코드 확인)

이 프로젝트의 `App.tsx`에서 두 가지를 나란히 비교:

```tsx
const handleStable = useCallback(() => alert('stable'), [])
const handleUnstable = () => alert('unstable')   // 인라인

<ExpensiveChild label="✅ stable"   onClick={handleStable} />
<ExpensiveChild label="❌ unstable" onClick={handleUnstable} />
```

`ExpensiveChild`는 `memo`로 감싸져 있고 렌더 시점에 콘솔 로그를 찍습니다.

- 부모의 `count` 버튼을 누르면 → ❌ unstable 쪽만 매번 `[render]` 로그 발생
- ✅ stable 쪽은 props 참조가 그대로라 리렌더 안 됨

---

## 6. 이벤트 핸들러 / 비동기 로직 예시

```tsx
// 버튼 클릭 시 API 호출 — useCallback으로 핸들러 참조 고정
const handleSearch = useCallback(async () => {
  const res = await api.get('/movies', { params: { query } })
  setResults(res.data)
}, [query])

// useEffect의 deps로 콜백을 넣을 때
useEffect(() => {
  handleSearch()
}, [handleSearch])

// 디바운스/스로틀 함수와 함께 — 8주차 미션 1/2와 같은 패턴
const debouncedQuery = useDebounce(query, 300)
```

---

## 7. `memo` 정리

### 무엇인가
> 함수형 컴포넌트를 감싸서, **props가 얕은 비교상 같으면 리렌더를 스킵**하게 만드는 HOC.

```tsx
const Child = memo(function Child({ name }: Props) {
  return <p>{name}</p>
})
```

### 왜 사용하나
- 부모가 자식과 무관한 이유로 자주 리렌더되는 경우, 자식의 리렌더 비용을 절약
- 자식이 무겁거나(큰 리스트·복잡한 차트) 자주 그려지는 경우 효과적

### 기본 사용법
- 컴포넌트를 `memo()`로 감싸기 → props 비교는 기본적으로 얕은 비교
- 커스텀 비교 함수도 두 번째 인자로 전달 가능: `memo(Comp, (prev, next) => ...)`

### 언제 쓰면 좋은가 / 안 좋은가
| 좋은 케이스 | 안 좋은 케이스 |
|---|---|
| 부모가 자주 리렌더되는데 자식 props는 거의 안 바뀜 | props가 매번 바뀌는 자식 |
| 자식이 무거운 렌더(큰 리스트·차트) | 자식이 매우 단순한 컴포넌트 |
| props로 받는 객체·함수의 참조를 안정시킬 수 있음 (`useCallback`/`useMemo` 동반) | 매번 새 객체·인라인 함수가 props로 들어옴 (memo 무력화) |

### memo + useCallback 의 짝
이 둘은 항상 같이 등장. `memo`로 감싼 자식에게 인라인 화살표 함수를 props로 내려주면 memo가 깨짐 → `useCallback`으로 참조 고정 필요.

---

## 8. 학습 회고

### ✅ 이해한 점
- `useCallback`의 본질은 **참조 동일성 유지** — `===` 비교가 성공하도록 같은 함수 객체를 재사용
- `memo`는 **props 얕은 비교 기반 리렌더 스킵** — 객체·함수가 props에 들어가면 참조가 같아야 효과
- 둘은 항상 짝으로 등장. memo만 쓰면 효과 없는 케이스가 흔함

### 🧩 어려운 점 & 개선
- **stale closure** — deps에 빼먹은 state·props가 안에서 사용되는데 IDE 경고가 없으면 놓치기 쉬움. **개선**: eslint-plugin-react-hooks의 `exhaustive-deps` 룰 활성화
- **언제 memo를 쓸지 판단** — 모든 컴포넌트에 memo 두르는 건 오히려 비교 비용 누적. **개선**: React DevTools Profiler로 실제 리렌더 빈도를 먼저 확인하고 병목부터 적용

### 🔄 회고
- 8주차 useThrottleCallback에서 `callbackRef` 패턴으로 stale closure를 우회했던 게 이번 학습과 같은 맥락이었음을 깨달음
- "성능 최적화 = 항상 좋은 것" 이 아님 — 작은 컴포넌트에 useCallback/memo를 남발하면 오히려 마이너스
- 미션 1 (영화 사이트)에서 직접 적용해 React DevTools Profiler로 효과를 확인할 예정

---

## 참고 자료
- [useCallback – React](https://react.dev/reference/react/useCallback)
- [memo – React](https://react.dev/reference/react/memo)
- 강의 영상 (워크북 링크)

---

## 실행
```bash
npm install
npm run dev
```
