import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import webtoonsRouter from './routes/webtoons.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8000)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
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
  console.log(`  Allowed CORS origin: ${FRONTEND_ORIGIN}`)
  console.log(`  JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`)
  console.log(`  Demo account: umc@umc.com / 1234`)
  console.log(`  Endpoints: /v1/auth, /v1/users, /v1/webtoons`)
})
