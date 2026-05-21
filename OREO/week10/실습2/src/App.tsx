import { useMemo, useState } from 'react'

// 의도적으로 무거운 동기 계산.
// useMemo로 감싸지 않으면 매 렌더마다 다시 돈다.
function heavyCompute(n: number): number {
  let sum = 0
  for (let i = 0; i < 5_000_000; i++) {
    sum += Math.sqrt(i + n)
  }
  return Math.round(sum)
}

export default function App() {
  const [n, setN] = useState(1)
  const [text, setText] = useState('')

  // ✅ n이 바뀔 때만 다시 계산. text가 바뀌어도 캐시된 값 사용.
  const result = useMemo(() => {
    console.log(`[heavyCompute] n=${n} 실행`)
    return heavyCompute(n)
  }, [n])

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui' }}>
      <header style={{ marginBottom: 24 }}>
        <h1>UMC 10주차 실습 2 — useMemo</h1>
        <p style={{ color: '#6b7280' }}>
          콘솔을 열고 input을 타이핑해보세요. useMemo로 감싼 덕에 n이 안 바뀌면
          heavyCompute가 다시 돌지 않습니다.
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          n (계산에 사용):
          <input
            type="number"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            style={{ marginLeft: 8, padding: 6 }}
          />
        </label>
        <label>
          무관한 입력 (text):
          <input
            type="text"
            value={text}
            placeholder="아무거나 타이핑"
            onChange={(e) => setText(e.target.value)}
            style={{ marginLeft: 8, padding: 6 }}
          />
        </label>

        <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 8 }}>
          <strong>heavyCompute({n})</strong> = <code>{result}</code>
        </div>

        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
          ※ text input을 타이핑해도 콘솔에 <code>[heavyCompute] 실행</code> 로그가
          나오지 않는다면 useMemo가 캐시를 잘 살리고 있다는 뜻이에요.
        </p>
      </section>
    </main>
  )
}
