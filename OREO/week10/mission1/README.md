# Week 10 — Mission 1: TMDB 영화 검색 + 렌더링 최적화

UMC 10th DAU Web · 10주차 미션 1 — **TMDB API로 영화 검색 기능을 만들고, React DevTools Profiler로 병목을 찾아 `useCallback` / `useMemo` / `memo` 로 최적화**

---

## 폴더 구조

```
src/
  api/
    tmdb.ts                ← axios 인스턴스, 타입, search/detail 함수
  hooks/
    useDebounce.ts         ← 8주차 미션1 패턴 TS화
  components/
    SearchForm.tsx         ← 검색 폼 (memo)
    MovieCard.tsx          ← 카드 한 장 (memo)
    MovieList.tsx          ← 카드 그리드 (memo)
    MovieModal.tsx         ← 상세 모달 + useQuery + ESC/scroll lock
  App.tsx
  main.tsx                 ← QueryClientProvider
```

---

## 환경변수

`.env.example` 참고:

```env
VITE_TMDB_TOKEN=
```

- TMDB v4 Read Access Token (Bearer JWT) — https://www.themoviedb.org/settings/api 에서 발급
- `.env`는 `.gitignore`에 포함됨. 절대 커밋하지 말 것
- 코드에서 `import.meta.env.VITE_TMDB_TOKEN` 으로 읽고 axios 헤더에 `Authorization: Bearer ${...}` 로 박음

---

## 영화 검색 기능

### 입력 3종
| 항목 | UI | API 파라미터 |
|---|---|---|
| 영화 제목 | `<input type="text">` | `query` |
| 성인 콘텐츠 포함 | `<input type="checkbox">` | `include_adult=true/false` |
| 언어 | `<select>` (ko-KR / en-US / ja-JP) | `language` |

- `<form>` 으로 감싸 Enter 입력으로도 검색 가능
- 입력값은 모두 React state로 관리

### 검색 흐름
1. 사용자가 input에 타이핑 → `query` 즉시 변경
2. `useDebounce(query, 300)` 가 입력이 멈춘 뒤 300ms 후 `debouncedQuery` 갱신
3. `useQuery({ queryKey: ['movies', 'search', { q, language, includeAdult }] })` 가 자동 발화
4. 빈 검색어일 땐 `enabled: false` 로 요청 차단

---

## 영화 상세 모달

- 카드 클릭 → `selectedId` state 변경 → `<MovieModal />` 마운트
- `useQuery(['movie', id, language])` 로 상세 fetch (`/movie/{id}`)
- 표시: 백드롭 이미지, 포스터, 제목, 평점, 개봉일, 러닝타임, 장르, 줄거리
- **"IMDb에서 검색하기"** → `https://www.imdb.com/find?q=${title}` 새 탭으로
- **닫기**: ✕ 버튼 / 백드롭 클릭 / **ESC 키**
- 열렸을 때 **body scroll lock** (8주차 미션3의 useSidebar 패턴 응용)

---

## ⚙️ 성능 최적화

### 1) `useDebounce` — API 호출 빈도 제한
```ts
const debouncedQuery = useDebounce(query, 300)
```
검색어가 빠르게 바뀌어도 `useQuery`는 debounced 값에만 반응. **8주차 미션 1**에서 만든 패턴 그대로 재활용.

### 2) `useCallback` — 콜백 참조 고정
```ts
const handleQueryChange = useCallback((v: string) => setQuery(v), [])
const handleCardClick   = useCallback((id: number) => setSelectedId(id), [])
// ... 6개 핸들러 모두
```

- 부모(App)의 다른 state(`selectedId`, `language` 등)가 바뀌어도 자식 컴포넌트들의 `onXxx` props 참조가 동일하게 유지됨
- 자식들의 `memo`가 비로소 효과를 발휘

### 3) `useMemo` — 파생 배열 캐싱
```ts
const movies = useMemo(() => {
  if (!data) return []
  return [...data.results]
    .filter((m) => m.vote_average >= MIN_VOTE_FOR_LIST)
    .sort((a, b) => b.vote_average - a.vote_average)
}, [data])
```

- `data`가 같으면(같은 검색 결과를 보고 있으면) `movies` 배열의 **참조도 그대로**
- `MovieList`가 받는 `movies` props 참조가 안정 → `memo` 가 작동

### 4) `memo` — 자식 컴포넌트 리렌더 스킵
- `SearchForm` — props가 7개지만 모두 primitive + useCallback으로 감싼 함수들. 부모의 다른 state(`selectedId`, `data` 등)가 바뀌어도 리렌더 안 됨
- `MovieList` — `movies` 배열 reference + `onCardClick` 가 같으면 스킵
- `MovieCard` — 같은 `movie` + `onClick` 이면 리렌더 안 됨. 검색 결과 한 페이지에 카드가 20개 있으면 효과가 큼

각 컴포넌트의 렌더 시점에 `console.log('[render] ...')` 로그가 박혀 있어, DevTools Profiler나 콘솔로 효과를 직접 확인 가능.

---

## 적용 전 / 후 정리 (React DevTools Profiler 기준)

> 직접 측정 후 영상·캡처에 첨부 예정. 아래는 예상 효과와 측정 방법.

| 동작 | 최적화 전 | 최적화 후 |
|---|---|---|
| 검색어 한 글자 입력 | App / SearchForm / MovieList / 모든 MovieCard 리렌더 | App 만 리렌더 (SearchForm 은 memo, MovieList·MovieCard 는 props 동일) |
| 카드 클릭 (모달 열기) | App 리렌더 → 자식 모두 리렌더 | App + Modal만 리렌더 |
| 언어 select 변경 | 모든 자식 리렌더 | SearchForm·App 만 |

### 측정 방법
1. Chrome DevTools → Components/Profiler 탭
2. Profiler 녹화 시작 → 검색어 입력·언어 변경·카드 클릭 한 번씩
3. Flame graph에서 회색(리렌더 스킵) vs 색깔(리렌더 발화) 비교
4. 콘솔의 `[render] <Component />` 로그가 안 찍히는 게 곧 스킵 성공

---

## LP 페이지 성능 개선 포인트 (8주차 mission2 기준)

> 미션 워크북에 "LP 사이트 최적화 3개 이상" 요청. 아래는 우리 8주차 mission2 `WebtoonList` 의 적용·제안 포인트.

1. **`useThrottle` (이미 적용)** — 스크롤 위치 추적과 fetchNextPage 호출 빈도 제한. 8주차 미션 2에서 적용 완료
2. **`useThrottleCallback` (이미 적용)** — IntersectionObserver 콜백이 짧게 여러 번 트리거돼도 fetchNextPage가 1초에 한 번
3. **`MovieCard` 같은 카드 컴포넌트를 `memo`로 감싸기** — 8주차 mission2 `WebtoonList`의 카드도 현재는 인라인이라 매번 리렌더. memo + useCallback 으로 개선 가능
4. **`useMemo` 로 `items = data?.pages.flatMap()` 캐싱** — 현재는 매 렌더마다 flatMap이 새 배열을 만들어 자식의 reference equality를 깬다. useMemo로 감싸면 자식 memo 효과 보장

---

## 미션 체크리스트

### 1. 영화 검색
- [x] 검색 영역 레이아웃 (`form`)
- [x] 영화 제목 입력 (`<input type="text">`, placeholder, state)
- [x] 성인 콘텐츠 체크박스 + state + API 반영
- [x] 언어 select (ko-KR / en-US / ja-JP) + state + API 반영
- [x] Enter 입력으로도 검색 (`<form>`)

### 2. 영화 상세 모달
- [x] 카드 클릭 시 모달
- [x] 포스터/제목/평점/개봉일/줄거리/장르/러닝타임
- [x] IMDb 검색 버튼 (새 탭)
- [x] 닫기 버튼 + 백드롭 클릭 + ESC

### 3. 성능 최적화
- [x] React DevTools 설치 가이드 README 명시
- [x] `memo` — 3개 컴포넌트 (SearchForm/MovieList/MovieCard)
- [x] `useCallback` — 6개 콜백
- [x] `useMemo` — `movies` 파생 배열
- [x] 콘솔 로그로 적용 전후 비교 가능
- [x] LP 페이지 개선 포인트 3개 이상 정리

---

## 실행

```bash
cp .env.example .env
# .env에 VITE_TMDB_TOKEN 채우기 (TMDB v4 Read Access Token)

npm install
npm run dev   # localhost:5173
```
