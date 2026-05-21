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

// 토큰이 없거나 invalid해도 통과시키고, 가능하면 req.user를 채움.
// liked 상태처럼 viewer-aware한 응답에 사용.
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return next()
  try {
    const payload = verifyAccessToken(token)
    const user = findUserById(payload.sub)
    if (user) req.user = user
  } catch {
    /* token invalid → 익명으로 통과 */
  }
  next()
}
