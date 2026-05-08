import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import webtoonsRouter from './routes/webtoons.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8000)

// 테스트 편의를 위해 localhost의 어느 포트에서든 접근 허용.
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (/^https?:\/\/localhost:\d+$/.test(origin)) return cb(null, true)
      if (/^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)) return cb(null, true)
      cb(new Error('Not allowed by CORS: ' + origin))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/v1/auth', authRouter)
app.use('/v1/users', usersRouter)
app.use('/v1/webtoons', webtoonsRouter)

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ message: 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`✓ UMC week6 stub backend listening on http://localhost:${PORT}`)
  console.log(`  Allowed CORS origin: any localhost:*`)
  console.log(`  JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`)
  console.log(`  Demo account: umc@umc.com / 1234`)
  console.log(`  Endpoints: /v1/auth, /v1/users, /v1/webtoons`)
})
