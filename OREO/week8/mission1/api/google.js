import { API_BASE } from './axios.js'

export function redirectToGoogleLogin() {
  window.location.href = `${API_BASE}/auth/google/login`
}
