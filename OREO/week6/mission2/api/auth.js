import axios from 'axios'
import { api, API_BASE } from './axios.js'
import { tokenStorage } from '../auth/tokenStorage.js'

const rawAxios = axios.create({ baseURL: API_BASE, timeout: 8000 })

export async function login({ email, password }) {
  const { data } = await rawAxios.post('/auth/login', { email, password })
  tokenStorage.set({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  })
  return data.user
}

export async function signup({ email, password, name }) {
  const { data } = await rawAxios.post('/auth/signup', { email, password, name })
  tokenStorage.set({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  })
  return data.user
}

export async function logout() {
  const refreshToken = tokenStorage.getRefresh()
  try {
    if (refreshToken) {
      await rawAxios.post('/auth/logout', { refreshToken })
    }
  } catch {
    /* ignore */
  }
  tokenStorage.clear()
}

export async function fetchMe() {
  const { data } = await api.get('/users/me')
  return data
}
