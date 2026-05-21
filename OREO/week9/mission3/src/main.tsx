import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Zustand 는 Provider가 필요 없다. store는 import 시점에 한 번 만들어지고
// 모든 컴포넌트가 같은 인스턴스를 공유한다 (모듈 싱글톤).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
