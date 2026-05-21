# Week 10 — 실습 2: useMemo

UMC 10th DAU Web · 10주차 실습 2 — **무거운 계산 결과를 메모이제이션해서 매 렌더마다 다시 돌지 않도록**

---

## 1. `useMemo` 란?

> 어떤 **값(계산 결과)** 을 메모이제이션해서, 의존성이 바뀌지 않는 한 직전 렌더에서 만든 값을 그대로 반환하게 해주는 React 훅.

```ts
const memo = useMemo(() => heavyCompute(n), [n])
```

- 두 번째 인자(`deps`)의 모든 값이 동일하면 → 캐시된 값 반환 (계산 안 함)
- 하나라도 바뀌면 → 콜백 다시 실행해 새 값 계산 + 캐시 갱신

---

## 2. useCallback vs useMemo

| | useCallback | useMemo |
|---|---|---|
| 메모이제이션 대상 | **함수 그 자체** | **함수의 반환값** |
| 반환 | 함수 reference | 계산된 값 |
| 동등 표현 | `useMemo(() => fn, deps)` 와 같음 | — |

> `useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)` 라는 관계.

---

## 3. 언제 쓰는가

### ✅ 좋은 케이스
- **계산 비용이 정말 큰 함수** (정렬, 필터, 변환, 무거운 수학 계산)
- 컴포넌트가 다른 상태 때문에 자주 리렌더되는데 **계산 input은 거의 안 바뀜**
- **자식 컴포넌트의 props로 객체/배열**을 내리는데 그 자식이 `memo`로 감싸져 있음 — 객체 reference를 안정시켜 memo가 작동하도록 도움

### ❌ 안 좋은 케이스
- 계산이 가벼움 (`a + b`, `arr.length` 등)
- 매번 deps가 바뀜 → 캐시 의미 없음
- "혹시 모르니" 모든 값을 useMemo로 — 비교 비용·메모리 비용이 누적됨

> React 공식 문서: "useMemo는 성능 최적화로만 사용하세요. 동작이 useMemo 없이 안 되면 그건 버그입니다."

---

## 4. 이 프로젝트에서 확인

```tsx
const result = useMemo(() => heavyCompute(n), [n])
```

- `heavyCompute`는 500만 번 루프를 돌리는 의도적인 무거운 함수
- input 두 개:
  - `n` — deps에 들어있음 → 바뀌면 다시 계산
  - `text` — deps에 없음 → 바뀌어도 캐시된 결과 사용

콘솔을 열고:
- `text` input 타이핑 → `[heavyCompute] 실행` 로그 **안 찍힘** (캐시 hit)
- `n` input 변경 → 로그 찍힘 (캐시 miss, 재계산)

useMemo가 없으면 text 타이핑 시에도 매번 500만 루프가 돌아 UI가 끊김.

---

## 5. 학습 회고

### ✅ 이해한 점
- useMemo는 **계산 결과를 캐시**, useCallback은 **함수 자체를 캐시**. 본질적으로 같은 메모이제이션이고 useCallback은 useMemo의 syntactic sugar
- deps 배열의 **얕은 비교**가 핵심 — `[obj]`처럼 매번 새 객체가 들어가면 캐시 무효
- 비싼 계산이 아니면 **useMemo 비용(deps 비교 + 캐시 보관)** 이 절약하는 비용보다 클 수 있음

### 🧩 어려운 점 & 개선
- **"비싼 계산"의 기준이 모호** → React DevTools Profiler로 실제 시간을 재고 100ms 넘는 작업부터 우선 적용
- **객체 reference 안정화 용도로 쓸 때** → 자식이 memo가 아니면 효과 없음. 한 쌍으로 같이 가져가야

### 🔄 회고
- 8주차에서 만든 `useDebounce`/`useThrottle`은 "이벤트 발생 빈도 제한"이었다면, useMemo는 "**계산 결과 재사용**"이라는 다른 결의 최적화
- 미션1 영화 사이트에서 결과 리스트 정렬·필터링·평점 평균 같은 파생 값에 직접 적용 예정

---

## 참고 자료
- [useMemo – React](https://react.dev/reference/react/useMemo)
- 강의 영상 (워크북 링크)

---

## 실행
```bash
npm install
npm run dev
```
