import { Router } from 'express'
import {
  listWebtoons,
  searchWebtoons,
  getWebtoon,
  listComments,
  createWebtoon,
  updateWebtoon,
  deleteWebtoon,
  toggleLike,
  createComment,
} from '../store.js'
import { requireAuth, optionalAuth } from '../middleware.js'

const router = Router()

// 의도적인 네트워크 지연 (낙관적 업데이트의 즉시 반영을 체감하려면 약간의 지연 필요)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

router.get('/', optionalAuth, async (req, res) => {
  await delay(600)
  const sort = req.query.sort === 'oldest' ? 'oldest' : 'newest'
  const page = Math.max(1, Number(req.query.page) || 1)
  const size = Math.min(50, Math.max(1, Number(req.query.size) || 12))
  const data = listWebtoons({ sort, page, size, viewerId: req.user?.id ?? null })
  res.json(data)
})

// 검색 + cursor 페이지네이션 (미션1).
// 콘솔에서 입력 타이밍과 비교하기 좋게 요청 시각·검색어를 로깅.
router.get('/search', optionalAuth, async (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const cursor = req.query.cursor != null && req.query.cursor !== '' ? Number(req.query.cursor) : null
  const size = Math.min(50, Math.max(1, Number(req.query.size) || 12))
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] /webtoons/search q=${JSON.stringify(q)} cursor=${cursor ?? '-'} size=${size}`)
  await delay(500)
  const data = searchWebtoons({ q, cursor, size, viewerId: req.user?.id ?? null })
  res.json(data)
})

router.get('/:id', optionalAuth, async (req, res) => {
  await delay(500)
  const found = getWebtoon(req.params.id, req.user?.id ?? null)
  if (!found) return res.status(404).json({ message: 'Webtoon not found' })
  res.json(found)
})

// 새 LP 생성
router.post('/', requireAuth, async (req, res) => {
  await delay(600)
  const { title, content, thumbnail, tags } = req.body ?? {}
  if (!title || !title.trim()) {
    return res.status(400).json({ message: '제목은 필수예요.' })
  }
  const created = createWebtoon({
    title,
    content: content ?? '',
    thumbnail,
    tags,
    authorId: req.user.id,
  })
  res.status(201).json(created)
})

// LP 수정 (작성자 본인만)
router.patch('/:id', requireAuth, async (req, res) => {
  await delay(500)
  const result = updateWebtoon(req.params.id, req.body ?? {}, req.user.id)
  if (result.error === 'NOT_FOUND') return res.status(404).json({ message: 'Webtoon not found' })
  if (result.error === 'FORBIDDEN') return res.status(403).json({ message: '본인 글만 수정할 수 있어요.' })
  res.json(result.data)
})

// LP 삭제 (작성자 본인만)
router.delete('/:id', requireAuth, async (req, res) => {
  await delay(500)
  const result = deleteWebtoon(req.params.id, req.user.id)
  if (result.error === 'NOT_FOUND') return res.status(404).json({ message: 'Webtoon not found' })
  if (result.error === 'FORBIDDEN') return res.status(403).json({ message: '본인 글만 삭제할 수 있어요.' })
  res.json(result.data)
})

// 좋아요 토글 (낙관적 업데이트의 핵심 미션 — 응답까지 약간의 지연 둠)
router.post('/:id/likes', requireAuth, async (req, res) => {
  await delay(700)
  const result = toggleLike(req.params.id, req.user.id)
  if (!result) return res.status(404).json({ message: 'Webtoon not found' })
  res.json(result)
})

// 댓글 목록 (cursor 기반 — 6주차에서 그대로)
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

// 댓글 생성
router.post('/:id/comments', requireAuth, async (req, res) => {
  await delay(500)
  const { content } = req.body ?? {}
  if (!content || !content.trim()) {
    return res.status(400).json({ message: '내용을 입력해주세요.' })
  }
  const created = createComment({
    webtoonId: req.params.id,
    content: content.trim(),
    authorId: req.user.id,
  })
  res.status(201).json(created)
})

export default router
