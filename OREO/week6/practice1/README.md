# 실습 1 — useCustomFetch 훅 직접 만들기

영상「React Query 알고 쓰기」(개발자 매튜) / 블로그 [yolog.co.kr/post/react-query](https://www.yolog.co.kr/post/react-query)의 흐름을 따라 React Query의 핵심 옵션을 **직접 구현**해 보고, 마지막에 TanStack Query와 비교하는 실습.

## 단계별 진화

| 단계 | 추가 기능 | 코드 위치 |
|---|---|---|
| ① | fetch → setData (가장 단순) | (펼쳐서 한 줄짜리) |
| ② | isPending (로딩 상태) | `useCustomFetch.js` |
| ③ | isError (에러 상태) | 〃 |
| ④ | localStorage 캐싱 + staleTime | 〃 |
| ⑤ | AbortController (요청 취소) | 〃 |
| ⑥ | 자동 재시도 (지수 백오프 1s → 2s → 4s) | 〃 |
| ⑦ | TanStack Query로 대체 (~15줄로 축약) | `useCustomFetchTanstack.js` |

## 실행

```bash
cd week6/practice1
npm install
npm run dev   # localhost:5175
```

## 동작 확인

1. URL 버튼(`users/1`, `users/2`, `users/3`)을 눌러 데이터를 처음 가져온 뒤,
2. 다른 url 갔다가 다시 돌아오면 → **localStorage 캐시 hit**으로 즉시 표시 (Network 탭 비어있음).
3. "캐시 비우기" 누르고 다시 들어가면 → 다시 fetch.
4. 두 패널(직접 만든 훅 vs TanStack Query)이 **같은 url에 대해 같은 결과**를 보여주는지 비교.
5. DevTools Network 탭으로 요청 횟수 차이를 관찰 (TanStack Query는 메모리 캐시라 새로고침 시 다시 부르고, 직접 만든 훅은 localStorage라 새로고침해도 캐시 유지).

## 키 학습 포인트

- **staleTime의 의미**: 일정 시간 안의 같은 요청은 fetch 자체를 안 해요.
- **AbortController**: 컴포넌트 언마운트나 url 변경 시 진행 중인 요청을 cancel → race condition / 메모리 누수 방지.
- **지수 백오프**: 즉시 재시도(고정 1초)보다 점점 길게 띄워야 서버 부담을 줄임.
- **isPending vs isError**: 로딩과 에러를 분리해 UI 분기를 일관되게 표준화.
- 결국 위 코드 ~110줄이 TanStack Query 옵션 6개 (`queryKey, queryFn, retry, retryDelay, staleTime, gcTime`)로 축약 → "왜 라이브러리를 쓰는가?"의 답.
