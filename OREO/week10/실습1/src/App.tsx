import { useCallback, useState } from 'react'
import ExpensiveChild from './ExpensiveChild'

// useCallback + memo 데모.
//
// 시나리오:
//   - 부모에 count·text 상태가 있음 (자식과 무관한 상태)
//   - 자식 ExpensiveChild는 memo로 감싸져 있음
//   - 자식에 onClick 콜백을 내려줌
//
// (a) useCallback 없이 onClick={() => alert(...)} 식으로 내리면,
//     부모가 리렌더될 때마다 새 함수 참조가 생겨서 memo가 의미 없어짐.
// (b) useCallback(() => alert(...), [deps])로 감싸면 같은 참조가 유지되어
//     자식의 props가 진짜 같아지고 memo의 리렌더 스킵이 작동.

export default function App() {
  const [count, setCount] = useState(0)
  const [, setText] = useState('')

  // ✅ 참조 고정 — 부모가 몇 번 리렌더되든 동일한 함수 reference
  const handleClickStable = useCallback(() => {
    alert('clicked (stable)')
  }, [])

  // ❌ 매 렌더마다 새 함수 생성 — memo 무력화 확인용
  const handleClickUnstable = () => {
    alert('clicked (unstable)')
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui' }}>
      <header style={{ marginBottom: 24 }}>
        <h1>UMC 10주차 실습 1 — useCallback + memo</h1>
        <p style={{ color: '#6b7280' }}>
          콘솔을 열고 + 버튼이나 input을 만져보세요. 자식의 [render] 로그가
          stable 쪽은 안 찍히고 unstable 쪽만 매번 찍힙니다.
        </p>
      </header>

      <section style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setCount((c) => c + 1)}>
          count: {count}
        </button>
        <input
          type="text"
          placeholder="아무거나 타이핑 (자식과 무관)"
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 6, flex: 1 }}
        />
      </section>

      <ExpensiveChild label="✅ stable (useCallback)" onClick={handleClickStable} />
      <ExpensiveChild label="❌ unstable (인라인 화살표)" onClick={handleClickUnstable} />

      <p style={{ marginTop: 16, color: '#6b7280', fontSize: 13 }}>
        ※ 두 자식 모두 <code>memo</code>로 감쌌지만, onClick props 참조가
        매 렌더마다 새로 생기는 ❌ 쪽은 부모가 리렌더될 때마다 자식도 리렌더됩니다.
      </p>
    </main>
  )
}
