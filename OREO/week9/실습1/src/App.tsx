import Counter from './Counter'
import Form from './Form'
import './App.css'

export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1>UMC 9주차 실습 1 — useReducer</h1>
        <p style={{ color: '#6b7280' }}>
          React 공식 문서와 강의 영상을 보고 useReducer의 두 가지 대표 패턴(단순 카운터 / 객체 폼)을 직접 구현한 실습입니다.
        </p>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Counter />
        <Form />
      </div>
    </main>
  )
}
