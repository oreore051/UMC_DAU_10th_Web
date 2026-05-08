# Week 6 — Mission 1: useQuery로 목록·상세 화면

UMC 10th DAU Web · 6주차 미션 1 — **TanStack Query 도입 + useQuery로 조회 표준화**

> 본래 워크북은 LP(`/v1/lps`)를 예시로 사용하지만, 우리는 5주차에서 만든 webtoon 도메인을 그대로 가져와서 `/v1/webtoons`로 매핑했습니다. 동작은 동일합니다.

## 무엇을 했나

- `QueryClient` + `QueryClientProvider` + `ReactQueryDevtools` 세팅
- 목록 페이지: `useQuery({ queryKey: ['webtoons', { sort }], queryFn })` — 정렬 토글 시 자동 리페치
- 상세 페이지: `useQuery({ queryKey: ['webtoon', id] })` — `enabled`로 id가 있을 때만 요청
- `staleTime` / `gcTime` / `placeholderData` / `retry` / `refetchOnWindowFocus` 옵션 적용
- 헤더 / 사이드바 / 메인 / 플로팅 버튼 레이아웃 구성 + 반응형 (모바일 햄버거 + 바깥클릭 닫힘)
- `ProtectedRoute`에 모달 추가 — 비로그인 시 "로그인하러 가기" 모달

## 실행

백엔드와 프론트 따로 띄워야 해요.

```bash
# 1) 백엔드 (8000)
cd backend
npm install
npm run dev

# 2) 프론트 (5173) — 다른 터미널
cd ..
npm install
npm run dev
```

데모 계정: `umc@umc.com` / `1234`

## 폴더 구조

```
mission1/
├── api/
│   ├── axios.js          (auth interceptor 그대로)
│   ├── auth.js
│   ├── google.js
│   └── webtoons.js       ← list/detail/comments fetcher
├── auth/                 (5주차 그대로)
├── components/           (예약)
├── layout/
│   └── AppLayout.jsx     ← 헤더+사이드바+플로팅+반응형
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── GoogleCallback.jsx
│   ├── PremiumWebtoon.jsx
│   ├── WebtoonList.jsx   ← useQuery (정렬 + 카드 그리드)
│   └── WebtoonDetail.jsx ← useQuery (썸네일 + 본문 + 액션)
├── App.css, App.jsx, ProtectedRoute.jsx, index.css, main.jsx
└── backend/
    ├── routes/
    │   ├── auth.js
    │   ├── users.js
    │   └── webtoons.js   ← /v1/webtoons (list, detail, comments)
    ├── store.js          ← 50개 시드 + 댓글 시드 + cursor 페이지네이션 함수
    └── server.js
```

## TanStack Query 핵심 결정

| 항목 | 값 | 이유 |
|---|---|---|
| `defaultOptions.staleTime` | 5분 | 글로벌 기본값. 자주 안 변하는 데이터는 5분 신선. |
| `defaultOptions.gcTime` | 10분 | 사용 안 되는 캐시 10분 보관 후 GC. |
| `refetchOnWindowFocus` | false | 데모용 stub이라 윈도우 포커스마다 리페치는 과함. |
| `retry` | 1 | 일시적 네트워크 실패만 1회 재시도. |
| 목록 `staleTime` | 1분 | 정렬 토글이 잦을 수 있어 짧게. |
| 목록 `placeholderData: prev` | ✓ | 정렬 토글 깜빡임 방지. |
| 상세 `staleTime` | 5분 | 변동 거의 없음. |

## 미션 체크리스트

### 레이아웃
- [x] 헤더/사이드바/메인 동시 노출
- [x] 우측 하단 플로팅 (+) 버튼 → `/webtoons/new` 라우팅
- [x] 비로그인: "로그인/회원가입" 헤더 노출
- [x] 로그인: "(닉네임)님 반갑습니다." 표시

### 반응형 사이드바
- [x] 768px 이하 기본 숨김
- [x] 햄버거 SVG 버튼 클릭 시 열림
- [x] 외부 클릭 시 닫힘 (`document.mousedown` 리스너)

### 목록 (useQuery + 정렬)
- [x] `useQuery({ queryKey: ['webtoons', { sort }] })`
- [x] sort 변경 시 자동 리페치
- [x] `staleTime` / `gcTime` 설정
- [x] 로딩(spinner) / 에러(메시지+재시도) UI

### 카드 인터랙션
- [x] hover 시 확대 + 그라디언트 오버레이 + 메타(제목/날짜/❤️)
- [x] 카드 클릭 → `/webtoons/:id`

### 상세
- [x] `useQuery({ queryKey: ['webtoon', id] })`
- [x] 썸네일/제목/작가/날짜/좋아요/본문 섹션
- [x] 좋아요/수정/삭제 버튼 UI
- [x] 동일 로딩/에러 패턴

### 보호 라우트
- [x] 비로그인 시 모달 → 확인 시 `/login`으로 이동
- [x] 로그인 후 `state.from`으로 복귀
