import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import MoviePage from './pages/MoviePage'

// 미션2 — react-router-dom으로 라우팅 분리.
// 새로고침 404 방지는 `vercel.json`의 rewrites가 담당 (모든 경로 → index.html).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/movies/:movieId" element={<MoviePage />} />
      </Routes>
    </BrowserRouter>
  )
}
