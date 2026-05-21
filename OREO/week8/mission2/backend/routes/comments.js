import { Router } from 'express'
import { requireAuth } from '../middleware.js'
import { updateComment, deleteComment } from '../store.js'

const router = Router()

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 댓글 수정 (본인 댓글만)
router.patch('/:id', requireAuth, async (req, res) => {
  await delay(400)
  const { content } = req.body ?? {}
  if (!content || !content.trim()) {
    return res.status(400).json({ message: '내용을 입력해주세요.' })
  }
  const result = updateComment(req.params.id, content.trim(), req.user.id)
  if (result.error === 'NOT_FOUND') return res.status(404).json({ message: 'Comment not found' })
  if (result.error === 'FORBIDDEN') return res.status(403).json({ message: '본인 댓글만 수정할 수 있어요.' })
  res.json(result.data)
})

// 댓글 삭제 (본인 댓글만)
router.delete('/:id', requireAuth, async (req, res) => {
  await delay(400)
  const result = deleteComment(req.params.id, req.user.id)
  if (result.error === 'NOT_FOUND') return res.status(404).json({ message: 'Comment not found' })
  if (result.error === 'FORBIDDEN') return res.status(403).json({ message: '본인 댓글만 삭제할 수 있어요.' })
  res.json(result.data)
})

export default router
