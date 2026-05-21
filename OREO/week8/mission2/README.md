# Week 8 — Mission 2: Throttle로 불필요한 호출 막기

UMC 10th DAU Web · 8주차 미션 2 — **`useThrottle` 커스텀 훅을 만들고 빈번한 이벤트 호출을 주기적으로 제한**

미션1 베이스에 `hooks/useThrottle.js`를 추가하고, `WebtoonList`(무한 스크롤 페이지)에 **두 가지 형태**로 적용했습니다.

---

## 1. `useThrottle` 커스텀 훅 (`hooks/useThrottle.js`)

한 파일에 **값형(default)** + **콜백형(named)** 두 가지를 export. 사용 상황이 다르기 때문에 둘 다 만들어 두는 게 가장 자연스러웠습니다.

### 값형 — `useThrottle(value, interval)`

```js
export default function useThrottle(value, interval = 300) {
  const [throttled, setThrottled] = useState(value)
  const lastUpdatedRef = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastUpdatedRef.current
    if (elapsed >= interval) {
      lastUpdatedRef.current = now
      setThrottled(value)
      return
    }
    const timer = setTimeout(() => {
      lastUpdatedRef.current = Date.now()
      setThrottled(value)
    }, interval - elapsed)
    return () => clearTimeout(timer)
  }, [value, interval])

  return throttled
}
```

- `lastUpdatedRef` — 마지막으로 throttled 값을 갱신한 시각
- **Leading edge**: 마지막 갱신으로부터 `interval` 이상 지났으면 즉시 반영
- **Trailing edge**: 아니면 남은 시간만큼 `setTimeout` 예약 → 입력이 거기서 멈추더라도 마지막 값이 한 번은 반영됨
- 클린업으로 trailing timer를 정리해 **언마운트 / interval 변경 / 새 value** 시 누수 방지

### 콜백형 — `useThrottleCallback(callback, interval)`

스크롤·리사이즈 같은 이벤트 핸들러에 직접 끼우는 용도. 값형으로는 처리 못 함 (값 변화가 아니라 함수 호출 빈도를 제한해야 하니까).

```js
export function useThrottleCallback(callback, interval = 300) {
  const lastCallRef = useRef(0)
  const timerRef = useRef(null)
  const callbackRef = useRef(callback)

  useEffect(() => { callbackRef.current = callback }, [callback])
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return useCallback((...args) => {
    const now = Date.now()
    const elapsed = now - lastCallRef.current
    if (elapsed >= interval) {
      lastCallRef.current = now
      callbackRef.current(...args)
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      lastCallRef.current = Date.now()
      callbackRef.current(...args)
    }, interval - elapsed)
  }, [interval])
}
```

- `callbackRef` 패턴 — 매 렌더마다 콜백 참조가 바뀌어도 `useCallback`의 deps에 callback이 들어가지 않으니, 반환되는 throttled 함수의 reference가 안정적
- 그 덕에 `useEffect`의 deps에 `throttledFetch`를 넣어도 매 렌더마다 옵저버가 재생성되지 않음

---

## 2. 무한스크롤 페이지에 적용 (`pages/WebtoonList.jsx`)

### (a) 값형 — 스크롤 위치 throttle (raw vs throttled 비교)

```js
const [scrollY, setScrollY] = useState(0)
const throttledScrollY = useThrottle(scrollY, 200)

useEffect(() => {
  const onScroll = () => setScrollY(Math.round(window.scrollY))
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])

useEffect(() => console.log('[scroll raw]', scrollY), [scrollY])
useEffect(() => console.log('[scroll throttled]', throttledScrollY), [throttledScrollY])
```

- 화면 상단 `.scroll-meter` 패널에 raw / throttled 두 값을 같이 표시
- 빠르게 스크롤하면 raw는 폭포처럼 바뀌고 throttled는 200ms 간격으로만 갱신

### (b) 콜백형 — `fetchNextPage` 호출 빈도 제한

```js
const throttledFetch = useThrottleCallback(() => {
  if (hasNextPage && !isFetchingNextPage) {
    console.log('[fetchNextPage] fired', Date.now())
    fetchNextPage()
  }
}, 1000)

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) throttledFetch()
  }, { rootMargin: '120px' })
  observer.observe(sentinelRef.current)
  return () => observer.disconnect()
}, [throttledFetch])
```

- 빠르게 위·아래로 흔들거나 IntersectionObserver가 짧은 간격으로 여러 번 트리거돼도 **실제 페이지 요청은 1초에 한 번**
- 강의 영상은 3초 / 권장은 1초 → 1초로 설정

---

## 3. 메모리 누수 관점에서의 클린업

| 위치 | 정리 대상 | 왜 필요한가 |
|---|---|---|
| `useThrottle`의 `useEffect` 리턴 | trailing `setTimeout` | 입력이 빠르게 이어지면 이전 trailing 타이머는 더 이상 필요 없음. 안 정리하면 trailing 콜백이 stale 값으로 한 번 더 실행 |
| `useThrottleCallback`의 두 번째 `useEffect` 리턴 | `timerRef.current` | 언마운트 후에도 setState가 호출되어 React 경고 + 메모리 누수 |
| `WebtoonList`의 scroll listener cleanup | `removeEventListener` | 페이지 이탈 시 scroll 핸들러가 살아남으면 setState→리렌더→누수 |
| IntersectionObserver cleanup | `observer.disconnect()` | sentinel DOM이 사라져도 관찰이 계속되면 누수 |

---

## 4. Debounce vs Throttle — 언제 무엇을?

| | Debounce (미션 1) | Throttle (이번 미션) |
|---|---|---|
| 동작 | "마지막 호출만 유효" — 마지막 입력 이후 delay 동안 잠잠해야 발화 | "주기적 제한" — interval마다 한 번씩은 발화 |
| 적합 | 검색 자동완성, 폼 자동저장 — **완료 시점**이 중요한 입력 | 스크롤 / 리사이즈 / 마우스 무브 — **연속적으로 발생하는** 이벤트의 처리 빈도 제한 |
| 안 쓰면? | 매 키 입력마다 API 1번 → 서버 부하 | 매 스크롤 프레임마다 setState → 프레임 드랍 |

---

## 5. 검증 방법

### Network 탭
1. `backend/`에서 `npm install && npm run dev` (localhost:8000)
2. 루트에서 `npm install && npm run dev` (localhost:5173)
3. 브라우저 → `/webtoons` → DevTools → **Network → Fetch/XHR**
4. 빠르게 위아래로 스크롤 → `GET /v1/webtoons?page=2&size=12` 요청이 **1초에 한 번**만 나가는지 확인

### Performance 탭
1. **Performance** 패널 → Record → 스크롤 빠르게 위아래 → Stop
2. **Main** 트랙에서 scroll 이벤트 핸들러가 매 프레임 호출되더라도, **콘솔 로그 `[scroll throttled]` 발생 간격**은 200ms 이상으로 유지

### Console
- `[scroll raw]` — 매 프레임 (스크롤 빠르면 60+ FPS)
- `[scroll throttled]` — 200ms 간격으로만
- `[fetchNextPage] fired` — 1초에 1번 이상 절대 안 찍힘

---

## 미션 체크리스트

### 1) `useThrottle` 구현
- [x] `useThrottle(value, interval)` 값형 직접 구현
- [x] `useThrottleCallback(callback, interval)` 콜백형 추가 — 이벤트 핸들러용
- [x] 언마운트 / 의존성 변경 시 `clearTimeout`으로 타이머·플래그 정리
- [x] 콜백 ref 패턴으로 stale closure 회피

### 2) `useThrottle` 실제 적용
- [x] 스크롤 위치 추적에 값형 `useThrottle` 적용
- [x] 무한 스크롤 `fetchNextPage` 호출에 콜백형 적용 (1초 주기 보장)

### 3) `useThrottle` 검증
- [x] Network / Performance / Console 어디서든 적용 전후 차이가 보이도록 raw·throttled 값을 동시에 노출

---

## 실행

```bash
cd backend
cp .env.example .env
npm install
npm run dev   # localhost:8000

cd ..
npm install
npm run dev   # localhost:5173 → /webtoons
```
