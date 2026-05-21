import express from 'express'
import axios from 'axios'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../jwt.js'
import {
  findUserByEmail,
  findUserById,
  createUser,
  upsertGoogleUser,
  registerRefreshToken,
  isRefreshTokenActive,
  revokeRefreshToken,
} from '../store.js'

const router = express.Router()

function issueTokensFor(user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  registerRefreshToken(refreshToken)
  return { accessToken, refreshToken }
}

router.post('/signup', (req, res) => {
  const { email, password, name } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email & password are required' })
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ message: 'Email already exists' })
  }
  const user = createUser({ email, password, name: name ?? email.split('@')[0] })
  const tokens = issueTokensFor(user)
  return res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    ...tokens,
  })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const user = findUserByEmail(email)
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  const tokens = issueTokensFor(user)
  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
    ...tokens,
  })
})

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body ?? {}
  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken is required' })
  }
  if (!isRefreshTokenActive(refreshToken)) {
    return res.status(401).json({ message: 'Refresh token is revoked or unknown' })
  }
  try {
    const payload = verifyRefreshToken(refreshToken)
    const user = findUserById(payload.sub)
    if (!user) return res.status(401).json({ message: 'User not found' })

    revokeRefreshToken(refreshToken)
    const tokens = issueTokensFor(user)
    return res.json(tokens)
  } catch {
    revokeRefreshToken(refreshToken)
    return res.status(401).json({ message: 'Refresh token invalid or expired' })
  }
})

router.post('/logout', (req, res) => {
  const { refreshToken } = req.body ?? {}
  if (refreshToken) revokeRefreshToken(refreshToken)
  return res.status(204).end()
})

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

router.get('/google/login', (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env
  if (!GOOGLE_CLIENT_ID) {
    return res
      .status(503)
      .send(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID / SECRET in backend/.env',
      )
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })
  return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
})

router.get('/google/callback', async (req, res) => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    FRONTEND_ORIGIN = 'http://localhost:5173',
  } = process.env
  const { code } = req.query

  if (!code) {
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=missing_code`)
  }
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=google_not_configured`)
  }

  try {
    const tokenRes = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_CALLBACK_URL,
    })
    const googleAccessToken = tokenRes.data.access_token

    const profileRes = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    })
    const { email, name } = profileRes.data

    const user = upsertGoogleUser({ email, name })
    const { accessToken, refreshToken } = issueTokensFor(user)

    const params = new URLSearchParams({
      accessToken,
      refreshToken,
      userId: String(user.id),
      name: user.name ?? '',
    })
    return res.redirect(
      `${FRONTEND_ORIGIN}/auth/google/callback?${params.toString()}`,
    )
  } catch (err) {
    console.error('[google/callback] error:', err.response?.data || err.message)
    return res.redirect(`${FRONTEND_ORIGIN}/login?error=google_oauth_failed`)
  }
})

export default router
