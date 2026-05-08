import { verifyAccessToken } from './jwt.js'
import { findUserById } from './store.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' })
  }

  try {
    const payload = verifyAccessToken(token)
    const user = findUserById(payload.sub)
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ message: 'Invalid access token' })
  }
}
