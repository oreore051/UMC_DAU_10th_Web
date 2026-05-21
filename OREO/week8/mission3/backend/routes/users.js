import express from 'express'
import { requireAuth } from '../middleware.js'
import { updateUser, deleteUser } from '../store.js'

const router = express.Router()

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

router.get('/me', requireAuth, (req, res) => {
  const { id, email, name, provider, bio, avatar } = req.user
  return res.json({ id, email, name, provider, bio, avatar })
})

// 닉네임/bio/avatar 수정 (낙관적 업데이트 미션 2의 핵심 endpoint)
router.patch('/me', requireAuth, async (req, res) => {
  await delay(800) // 낙관적 업데이트 차이를 시각적으로 보기 위해 약간 지연
  const { name, bio, avatar } = req.body ?? {}
  const patch = {}
  if (name != null) patch.name = String(name).trim()
  if (bio != null) patch.bio = String(bio)
  if (avatar != null) patch.avatar = String(avatar)
  const updated = updateUser(req.user.id, patch)
  if (!updated) return res.status(404).json({ message: 'User not found' })
  const { id, email, name: n, provider, bio: b, avatar: a } = updated
  res.json({ id, email, name: n, provider, bio: b, avatar: a })
})

// 회원 탈퇴
router.delete('/me', requireAuth, async (req, res) => {
  await delay(400)
  const ok = deleteUser(req.user.id)
  if (!ok) return res.status(404).json({ message: 'User not found' })
  res.status(204).end()
})

export default router
