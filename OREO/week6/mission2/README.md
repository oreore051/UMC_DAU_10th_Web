# Week 6 — Mission 2: useInfiniteQuery + Skeleton UI

UMC 10th DAU Web · 6주차 미션 2 — **무한 스크롤 + 깜빡임 없는 로딩 경험**

mission1을 기반으로 목록·댓글에 `useInfiniteQuery`와 IntersectionObserver, Skeleton UI를 추가했습니다.

## 무엇을 했나

### 메인 (목록)
- `useQuery` → `useInfiniteQuery`로 전환
- `getNextPageParam`이 서버의 `hasNext`/`page`를 보고 다음 page 번호 계산
- `IntersectionObserver`가 sentinel을 관찰하다 화면 진입 시 `fetchNextPage()`
- 초기 로딩: 카드 그리드 전체에 Skeleton (12개)
- 추가 로딩: 하단에만 Skeleton (4개)

### 상세 (댓글)
- 댓글: `useInfiniteQuery({ queryKey: ['webtoonComments', id, order] })`
- **커서 기반** 페이지네이션 — 서버가 `nextCursor` (마지막 댓글 id) 반환
- 댓글 정렬(최신순/오래된순) 토글 시 첫 페이지부터 다시
- 초기 로딩: 상단에 Skeleton 4줄 / 추가 로딩: 하단에만 Skeleton 2줄
- 댓글 작성란은 디자인만 (등록은 다음 주차의 `useMutation` 영역)

### Skeleton UI
- `components/Skeleton.jsx` — `SkeletonCard`, `SkeletonGrid`, `SkeletonComment`, `SkeletonCommentList`
- `@keyframes shimmer` — 그라디언트 좌→우 슬라이딩 (1.4s)

## 실행

```bash
cd backend
npm install
npm run dev   # localhost:8000

cd ..
npm install
npm run dev   # localhost:5173
```

> 백엔드 라우트는 의도적으로 `delay(500~600ms)`를 줘서 Skeleton/로딩 UX가 잘 보이게 했어요.

## 페이지네이션 방식 정리

| | 오프셋 기반 | 커서 기반 |
|---|---|---|
| 사용 곳 | 목록 (`page=1,2,3…`) | 댓글 (`cursor=lastId`) |
| 장점 | 구현 단순, 랜덤 페이지 가능 | 데이터 추가/삭제에 안전, 깊은 페이지에서도 빠름 |
| 단점 | 페이지 사이 데이터 변동 시 누락/중복 | 랜덤 페이지 점프 어려움 |
| 적합 화면 | 페이지 번호 UI 필요한 곳 | 무한 스크롤 / 실시간 추가가 잦은 피드 |

## TanStack Query 옵션 요약

| 화면 | queryKey | staleTime | getNextPageParam |
|---|---|---|---|
| 웹툰 목록 | `['webtoons', { sort }]` | 1분 | `hasNext ? page+1 : undefined` |
| 댓글 | `['webtoonComments', id, order]` | 30초 | `nextCursor ?? undefined` |

## 미션 체크리스트

### 메인 페이지
- [x] `useInfiniteQuery` 적용
- [x] 정렬 시 첫 페이지부터 다시 (queryKey에 sort 포함)
- [x] IntersectionObserver로 자동 fetchNextPage
- [x] Skeleton: 초기 12개 / 추가 4개 (위치 분리)
- [x] 쉬머 애니메이션

### LP(웹툰) 상세 댓글
- [x] `useInfiniteQuery` + 커서 페이지네이션
- [x] 정렬(최신/오래된) 토글
- [x] 댓글 작성 폼 UI (디자인만)
- [x] Skeleton: 초기 4개 (상단) / 추가 2개 (하단)
- [x] 마지막 페이지 안내 문구

## 짧은 응답 방지 팁

- 응답이 매우 짧을 때 Skeleton이 깜빡거리는 걸 막으려면 데이터가 있을 때 Skeleton을 렌더하지 않는 분기 + 최소 노출 시간(예: 200ms 이상일 때만 노출)을 두면 좋아요. 본 미션에서는 stub이 의도적으로 500ms 이상 지연되므로 별도 디바운스를 두지 않았습니다.
