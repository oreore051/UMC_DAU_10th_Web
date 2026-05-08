import { Router } from 'express'
import { listWebtoons, getWebtoon, listComments } from '../store.js'

const router = Router()

// 의도적인 네트워크 지연 (스켈레톤·로딩 UX 확인용)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

router.get('/', async (req, res) => {
  await delay(600)
  const sort = req.query.sort === 'oldest' ? 'oldest' : 'newest'
  const page = Math.max(1, Number(req.query.page) || 1)
  const size = Math.min(50, Math.max(1, Number(req.query.size) || 12))
  const data = listWebtoons({ sort, page, size })
  res.json(data)
})

router.get('/:id', async (req, res) => {
  await delay(500)
  const found = getWebtoon(req.params.id)
  if (!found) return res.status(404).json({ message: 'Webtoon not found' })
  res.json(found)
})

router.get('/:id/comments', async (req, res) => {
  await delay(500)
  const order = req.query.order === 'oldest' ? 'oldest' : 'newest'
  const cursor = req.query.cursor != null ? Number(req.query.cursor) : null
  const size = Math.min(30, Math.max(1, Number(req.query.size) || 10))
  const data = listComments({
    webtoonId: req.params.id,
    cursor,
    size,
    order,
  })
  res.json(data)
})

export default router
