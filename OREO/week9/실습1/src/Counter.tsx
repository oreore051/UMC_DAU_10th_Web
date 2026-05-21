import { useReducer } from 'react'

// useReducer 기본 사용 예제 — 증가/감소/리셋
// useState로도 가능하지만, 액션이 늘어나면 useReducer가 더 명확.

interface State {
  count: number
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }

const initialState: State = { count: 0 }

// reducer는 순수 함수: 같은 (state, action) 입력에 같은 결과를 반환.
// 이 덕분에 컴포넌트 바깥에 두고 독립적으로 테스트할 수 있다.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return { count: 0 }
    default:
      return state
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <section style={{ padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>🔢 Counter (useReducer)</h2>
      <p style={{ fontSize: 48, margin: '8px 0' }}>{state.count}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
        <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
        <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      </div>
    </section>
  )
}
