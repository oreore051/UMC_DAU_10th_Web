# Week 8 — Mission 1: Debounce + useInfiniteQuery

UMC 10th DAU Web · 8주차 미션 1 — **검색 입력에 `useDebounce`를 적용해 불필요한 API 호출을 막고, `useInfiniteQuery`의 cursor 페이지네이션과 연계**

7주차 mission1(useMutation 표준화)을 베이스로, `/search` 페이지를 추가하고 **입력 → debounce → useInfiniteQuery → cursor 페이지네이션** 흐름을 새로 구현했습니다.

---

## 1. `useDebounce` 커스텀 훅 (`hooks/useDebounce.js`)

```js
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

내부 동작 — **"마지막 호출만 유효"**:
1. `value` 또는 `delay`가 바뀔 때마다 `setTimeout` 예약
2. **다음 변경이 들어오면 클린업이 `clearTimeout`으로 이전 예약 취소** → 결국 입력이 멈춰서 `delay`가 다 지나가야만 setter가 실행
3. 같은 클린업이 언마운트 시에도 돌아 **타이머 누수**를 막음
4. `delay` 변경 즉시 반영: `useEffect` deps에 `delay`를 포함했기 때문에, delay가 변하면 기존 타이머가 클린업되고 새 delay로 다시 예약됨

### 메모리 누수 관점에서의 클린업
- `setTimeout`이 살아있는 동안 콜백이 클로저로 `setDebounced`(컴포넌트 setter)를 잡고 있다.
- 컴포넌트가 언마운트됐는데도 타이머가 살아있으면, 콜백이 실행되며 unmounted 컴포넌트에 setState를 시도해 경고가 나거나 메모리에 남는다.
- `return () => clearTimeout(timer)` 한 줄이 이걸 모두 막는다.

---

## 2. 검색 페이지 (`pages/Search.jsx`)

| 항목 | 값 |
|---|---|
| 입력 상태 | `useState('')` |
| 지연된 값 | `useDebounce(query, 300)` |
| 빈 검색어 차단 | `enabled: debouncedQuery.trim().length > 0` |
| 쿼리 키 | `qk.webtoons.search(trimmed)` |
| 페이지 파라미터 | cursor (마지막으로 본 webtoon id) |
| `getNextPageParam` | `(lastPage) => lastPage.nextCursor ?? undefined` |
| `staleTime` | 5분 — 최근 검색어로 돌아오면 서버 안 부름 |
| `gcTime` | 10분 — 캐시 메모리 보관 기간 |

### `delay = 300ms` 선택 근거
- 200ms 이하: 한 글자 입력 사이의 간격을 종종 넘어서 매 키마다 요청이 나갈 위험
- 500ms 이상: 입력을 다 끝낸 뒤에도 결과가 늦게 떠서 "반응이 굼뜸" 인상
- 300ms는 권장 범위(200–500ms) 중간이고, 한국어 한 글자 조합 시간(자모 2~3개)과 자연스럽게 겹침

### 콘솔 로그로 debounce 시각화
```jsx
useEffect(() => console.log('[input]', JSON.stringify(query)), [query])
useEffect(() => console.log('[debounced]', JSON.stringify(debouncedQuery)), [debouncedQuery])
```
한글 자모를 빠르게 입력하면 `[input]`은 매 글자마다 찍히지만, `[debounced]`는 입력을 멈춘 뒤 한 번만 찍힌다 → 그 시점에만 `/v1/webtoons/search` 요청이 1회 나간다.

---

## 3. Cursor 기반 무한 스크롤

서버 응답 모양:
```json
{
  "items": [...],
  "nextCursor": 24,
  "total": 7,
  "query": "신의"
}
```

- 정렬: 검색 결과는 **id 오름차순**으로 안정 정렬 (cursor 페이지네이션의 단조성 보장)
- `cursor=null` → 첫 페이지, 응답의 `nextCursor` → 다음 페이지의 `pageParam`
- 더 가져올 게 없으면 `nextCursor: null` → `getNextPageParam`이 `undefined`를 반환 → `hasNextPage: false`
- `IntersectionObserver`로 sentinel 요소가 보이면 `fetchNextPage()` 호출

### 캐싱 전략으로 재요청 더 줄이기
- `staleTime: 5분`: 같은 검색어로 돌아왔을 때 5분 안이면 `fresh` 상태 → 자동 refetch 안 나감
- `gcTime: 10분`: 컴포넌트 unmount되어도 캐시는 10분 보관 → 사용자가 검색 페이지를 잠깐 벗어났다 돌아와도 재요청 없음
- `refetchOnWindowFocus: false` (main.jsx 글로벌 기본값): 탭 전환만으로는 refetch 안 함

---

## 4. 백엔드 변경 (`backend/`)

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/v1/webtoons/search?q=&cursor=&size=` | 검색 + cursor 페이지네이션. 응답 `{ items, nextCursor, total, query }` |

- `store.js`에 `searchWebtoons({ q, cursor, size, viewerId })` 추가
- title / author / tags 중 어디든 부분 일치(case-insensitive)
- 라우트에서 요청 시각과 `q`를 콘솔에 찍어 **타이핑 vs 실제 요청 타이밍 비교** 가능

---

## 5. 검증 방법 (Network 탭)

1. `cd backend && npm install && npm run dev` (localhost:8000)
2. 새 터미널에서 루트로 `npm install && npm run dev` (localhost:5173)
3. 브라우저 → `/search` → **DevTools → Network → Fetch/XHR**
4. 검색창에 `타입스크립트` 한 글자씩 천천히 입력
5. **자모 입력 중에는 요청이 나가지 않고**, 입력을 멈춘 뒤 약 300ms 후에 `/v1/webtoons/search?q=…` 1회만 나가는 것을 확인
6. 스크롤 → 자동으로 `cursor=` 붙은 다음 페이지 요청
7. 같은 검색어로 다시 검색 → 5분 안이면 **요청이 안 나감** (staleTime 효과)

---

## 미션 체크리스트

### 1) `useDebounce` 구현
- [x] `useDebounce(value, delay)` 값 지연형으로 직접 구현
- [x] 언마운트 / 의존성 변경 시 `clearTimeout`으로 타이머 정리
- [x] `delay` 변경 즉시 반영 (useEffect deps에 `delay` 포함)

### 2) `useDebounce` 실제 적용
- [x] 검색 입력값을 `useDebounce`로 `debouncedQuery`로 변환
- [x] 빈 문자열 / 공백만 입력일 때 `enabled: false`로 요청 차단
- [x] 지연 시간 **300ms** (권장 범위 200–500ms)
- [x] `queryKey: qk.webtoons.search(trimmed)` — 지연된 값을 키에 포함
- [x] `enabled`로 빈 검색어 차단
- [x] `getNextPageParam`으로 cursor / nextCursor 기반 페이지네이션
- [x] `staleTime: 5분` / `gcTime: 10분`으로 재요청 최소화

### 3) `useDebounce` 검증
- [x] Network 탭에서 입력 중 요청이 나가지 않는 것을 확인할 수 있도록 콘솔 로그(`[input]` / `[debounced]`)와 서버 로그 모두 박아둠

---

## 학습 포인트 정리

| 패턴 | 어디서 배웠는지 | 8주차에서의 역할 |
|---|---|---|
| 커스텀 훅 + `useEffect` 클린업 | 3·4주차 | `useDebounce`의 타이머 누수 방지 |
| Query Key Factory | 7주차 | `qk.webtoons.search(q)`로 검색어별 캐시 분리 |
| `useInfiniteQuery` + IntersectionObserver | 6주차 | cursor 기반 페이지네이션 |
| `staleTime` / `gcTime` | 5·6주차 | 캐싱 전략으로 재요청 최소화 |

## 실행

```bash
cd backend
cp .env.example .env
npm install
npm run dev   # localhost:8000

cd ..
npm install
npm run dev   # localhost:5173
```
