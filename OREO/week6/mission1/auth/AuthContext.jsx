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

  return (
    <AuthContext.Provider value={{ status, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
