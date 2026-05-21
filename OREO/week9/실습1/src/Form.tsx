import { useReducer } from 'react'

// useReducer의 진가는 객체 상태에서 드러난다.
// 폼 필드가 늘어나도 reducer 한 군데에서 모든 업데이트를 처리할 수 있고,
// 각 액션 타입에 payload 타입을 묶어두면 타입 안정성이 그대로 따라온다.

interface FormState {
  name: string
  age: number
}

type FormAction =
  | { type: 'setName'; payload: string }
  | { type: 'setAge'; payload: number }
  | { type: 'reset' }

const initialForm: FormState = { name: '', age: 0 }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'setName':
      return { ...state, name: action.payload }
    case 'setAge':
      return { ...state, age: action.payload }
    case 'reset':
      return initialForm
    default:
      return state
  }
}

export default function Form() {
  const [state, dispatch] = useReducer(formReducer, initialForm)

  return (
    <section style={{ padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h2>📝 Form (useReducer + 객체 상태)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
        <label>
          이름
          <input
            type="text"
            value={state.name}
            onChange={(e) => dispatch({ type: 'setName', payload: e.target.value })}
          />
        </label>
        <label>
          나이
          <input
            type="number"
            value={state.age}
            onChange={(e) => dispatch({ type: 'setAge', payload: Number(e.target.value) })}
          />
        </label>
        <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
        <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    </section>
  )
}
