import express from 'express'
import { requireAuth } from '../middleware.js'

const router = express.Router()

router.get('/me', requireAuth, (req, res) => {
  const { id, email, name, provider } = req.user
  return res.json({ id, email, name, provider })
})

export default router
