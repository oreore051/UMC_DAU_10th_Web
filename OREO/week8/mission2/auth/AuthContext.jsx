import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { tokenStorage } from './tokenStorage.js'
import * as authApi from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(
    tokenStorage.hasAccess() ? 'loading' : 'unauthenticated',
  )
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false
    authApi
      .fetchMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        tokenStorage.clear()
        setUser(null)
        setStatus('unauthenticated')
      })
    return () => {
      cancelled = true
    }
  }, [status])

  useEffect(() => {
    const onLogout = () => {
      setUser(null)
      setStatus('unauthenticated')
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const me = await authApi.login({ email, password })
    setUser(me)
    setStatus('authenticated')
    return me
  }, [])

  const signup = useCallback(async ({ email, password, name }) => {
    const me = await authApi.signup({ email, password, name })
    setUser(me)
    setStatus('authenticated')
    return me
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  // 탈퇴 후 동기 정리 (API 호출 없이 상태만 비움)
  const clearAuth = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  // PATCH /users/me 성공/낙관적 업데이트 시 컨텍스트의 user 갱신.
  // updater는 함수형(prev=>next) 또는 객체 둘 다 받음.
  const patchUser = useCallback((updater) => {
    setUser((prev) => {
      if (!prev) return prev
      return typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ status, user, login, signup, logout, clearAuth, patchUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
