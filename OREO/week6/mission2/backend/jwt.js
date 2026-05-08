import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

const {
  JWT_SECRET,
  JWT_EXPIRES_IN = '30s',
  REFRESH_JWT_SECRET,
  REFRESH_JWT_EXPIRES_IN = '7d',
} = process.env

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, jti: randomUUID() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, jti: randomUUID() }, REFRESH_JWT_SECRET, {
    expiresIn: REFRESH_JWT_EXPIRES_IN,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_JWT_SECRET)
}
