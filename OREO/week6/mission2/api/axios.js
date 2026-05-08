import axios from 'axios'
import { tokenStorage } from '../auth/tokenStorage.js'

export const API_BASE = 'http://localhost:8000/v1'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
})

const rawAxios = axios.create({ baseURL: API_BASE, timeout: 8000 })

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshPromise = null

async function performRefresh() {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) {
    throw new Error('NO_REFRESH_TOKEN')
  }
  const { data } = await rawAxios.post('/auth/refresh', { refreshToken })
  tokenStorage.set({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  })
  return data.accessToken
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }
    if (originalRequest.url?.includes('/auth/refresh')) {
      tokenStorage.clear()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = performRefresh().finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
      }
      const newAccessToken = await refreshPromise

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      tokenStorage.clear()
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(refreshError)
    }
  },
)
