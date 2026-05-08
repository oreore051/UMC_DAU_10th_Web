import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PostList from './components/PostList.jsx'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="container">
        <h1>UMC 6주차 실습 1</h1>

        <Journey />
        <PostList />
      </main>
    </QueryClientProvider>
  )
}

function Journey() {
  const steps = [
    {
      title: '① 가장 단순한 fetch 훅',
      body: 'fetch → setData. URL이 바뀌면 그냥 다시 호출.',
    },
    {
      title: '② 로딩 상태 (isPending)',
      body: 'setIsPending(true) ↔ finally setIsPending(false). 빈 화면 → 로딩 UI 분기.',
    },
    {
      title: '③ 에러 상태 (isError)',
      body: 'try/catch에서 setIsError(true). 데이터/로딩/에러 3가지 분기 표준화.',
    },
    {
      title: '④ 캐싱 (staleTime)',
      body: 'localStorage에 { data, lastFetched } 저장. STALE_TIME 안이면 fetch 생략 → 즉시 표시.',
    },
    {
      title: '⑤ AbortController',
      body: 'unmount/URL 변경 시 진행 중인 요청을 abort. 메모리 누수와 race condition 방지.',
    },
    {
      title: '⑥ 자동 재시도 (지수 백오프)',
      body: '실패 시 1s → 2s → 4s 간격으로 최대 3회 재시도. 일시적 네트워크 문제에 견고.',
    },
    {
      title: '⑦ 결국 TanStack Query',
      body: '위 ~110줄이 useQuery({ queryKey, queryFn, retry, retryDelay, staleTime, gcTime }) 약 15줄로 축약. 거기에 gcTime · refetchOnWindowFocus · DevTools 등 보너스.',
    },
  ]
  return (
    <section className="journey">
      <h2>단계별 진화</h2>
      <ol>
        {steps.map((s) => (
          <li key={s.title}>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
