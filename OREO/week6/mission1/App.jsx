import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import AppLayout from './layout/AppLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import GoogleCallback from './pages/GoogleCallback.jsx'
import PremiumWebtoon from './pages/PremiumWebtoon.jsx'
import WebtoonList from './pages/WebtoonList.jsx'
import WebtoonDetail from './pages/WebtoonDetail.jsx'
import './App.css'

function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <p>페이지를 찾을 수 없어요.</p>
      <Link to="/">홈으로</Link>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/webtoons" element={<WebtoonList />} />
            <Route path="/webtoons/:id" element={<WebtoonDetail />} />
            <Route
              path="/premium/webtoon/:id"
              element={
                <ProtectedRoute>
                  <PremiumWebtoon />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
