// In-memory store for users / webtoons (LP) / comments / likes.
// 서버 재시작 시 초기화. 데모 유저 2명 자동 시드.

const users = new Map() // email -> user
const refreshTokens = new Set()

let nextUserId = 1

export function findUserByEmail(email) {
  return users.get(email) ?? null
}

export function findUserById(id) {
  for (const u of users.values()) {
    if (u.id === id) return u
  }
  return null
}

export function createUser({ email, password, name, provider = 'local' }) {
  const user = {
    id: nextUserId++,
    email,
    password,
    name,
    provider,
    bio: '',
    avatar: '',
  }
  users.set(email, user)
  return user
}

export function upsertGoogleUser({ email, name }) {
  const existing = users.get(email)
  if (existing) return existing
  return createUser({ email, password: null, name, provider: 'google' })
}

export function updateUser(id, patch) {
  const user = findUserById(id)
  if (!user) return null
  if (patch.name != null) user.name = patch.name
  if (patch.bio != null) user.bio = patch.bio
  if (patch.avatar != null) user.avatar = patch.avatar
  return user
}

export function deleteUser(id) {
  const user = findUserById(id)
  if (!user) return false
  users.delete(user.email)
  return true
}

export function registerRefreshToken(token) {
  refreshTokens.add(token)
}
export function isRefreshTokenActive(token) {
  return refreshTokens.has(token)
}
export function revokeRefreshToken(token) {
  refreshTokens.delete(token)
}

createUser({
  email: 'umc@umc.com',
  password: '1234',
  name: '오레오',
})
// 본인이 아닌 작성자 데모용
createUser({
  email: 'guest@umc.com',
  password: '1234',
  name: '게스트',
})

const TITLES = [
  '나 혼자만 레벨업', '신의 탑', '외모지상주의', '여신강림', '연애혁명',
  '귀멸의 칼날', '원피스', '진격의 거인', '주술회전', '체인소맨',
  '도쿄 리벤저스', '나루토', '블리치', '데스노트', '강철의 연금술사',
  '하이큐', '베르세르크', '몬스터', '20세기 소년', '바다보다 깊은',
  '은혼', '너에게 닿기를', '4월은 너의 거짓말', '오란고교 호스트부', '카드캡터 사쿠라',
]
const AUTHORS = [
  '추공', 'SIU', '박태준', '야옹이', '232',
  '고타게 코요하루', '오다 에이치로', '이사야마 하지메', '아쿠타미 게게', '후지모토 타츠키',
]
const TAG_POOL = [
  ['액션', '판타지'],
  ['로맨스', '드라마'],
  ['일상', '학원'],
  ['스릴러', '미스터리'],
  ['SF', '미래'],
]

let nextWebtoonId = 1
const webtoons = []
for (let i = 1; i <= 50; i++) {
  const title = TITLES[(i - 1) % TITLES.length]
  const seasonSuffix = i > TITLES.length ? ` 시즌${Math.ceil(i / TITLES.length)}` : ''
  // 짝수 id → demo user(1) 소유 (수정/삭제 데모). 나머지는 게스트(2).
  const authorId = i % 2 === 0 ? 1 : 2
  const author = findUserById(authorId)
  webtoons.push({
    id: nextWebtoonId++,
    title: `${title}${seasonSuffix}`,
    author: author?.name ?? AUTHORS[(i - 1) % AUTHORS.length],
    authorId,
    thumbnail: `https://picsum.photos/seed/webtoon-${i}/400/560`,
    likes: ((i * 137) % 9000) + 100,
    likedBy: new Set(),
    description: `${title}의 매력을 담은 작품. 회차 ${i}권 진행중. 압도적인 연출과 캐릭터로 사랑받는 작품입니다.`,
    body: '본문이 길게 이어집니다. '.repeat(30),
    tags: TAG_POOL[(i - 1) % TAG_POOL.length],
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
  })
}

// likedBy(Set)는 viewer별 liked 불리언으로 직렬화.
function publicWebtoon(w, viewerId = null) {
  const { likedBy, ...rest } = w
  return {
    ...rest,
    liked: viewerId != null ? likedBy.has(viewerId) : false,
  }
}

export function listWebtoons({ sort = 'newest', page = 1, size = 12, viewerId = null }) {
  const sorted = [...webtoons].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return sort === 'oldest' ? ta - tb : tb - ta
  })
  const start = (page - 1) * size
  const items = sorted.slice(start, start + size).map((w) => publicWebtoon(w, viewerId))
  return {
    items,
    page,
    size,
    total: sorted.length,
    hasNext: start + size < sorted.length,
  }
}

// Cursor 기반 검색 — useInfiniteQuery용 (미션1).
// q: 검색어. title·author·tags 중 어디든 부분 일치.
// cursor: 마지막으로 본 webtoon id. null이면 첫 페이지.
// 페이지 크기는 size로 고정, 응답에 nextCursor 포함.
export function searchWebtoons({ q = '', cursor = null, size = 12, viewerId = null }) {
  const query = String(q).trim().toLowerCase()
  const filtered = query
    ? webtoons.filter((w) => {
        const hay = `${w.title} ${w.author} ${(w.tags ?? []).join(' ')}`.toLowerCase()
        return hay.includes(query)
      })
    : []
  // id 오름차순으로 안정 정렬 (cursor 기반 페이징의 단조성 보장)
  const sorted = filtered.sort((a, b) => a.id - b.id)
  let startIdx = 0
  if (cursor != null) {
    const idx = sorted.findIndex((w) => w.id === Number(cursor))
    startIdx = idx >= 0 ? idx + 1 : 0
  }
  const slice = sorted.slice(startIdx, startIdx + size)
  const items = slice.map((w) => publicWebtoon(w, viewerId))
  const last = slice[slice.length - 1]
  return {
    items,
    nextCursor: slice.length === size && last ? last.id : null,
    total: sorted.length,
    query,
  }
}

export function getWebtoon(id, viewerId = null) {
  const w = webtoons.find((x) => x.id === Number(id))
  return w ? publicWebtoon(w, viewerId) : null
}

function findWebtoonRaw(id) {
  return webtoons.find((x) => x.id === Number(id)) ?? null
}

export function createWebtoon({ title, content, thumbnail, tags, authorId }) {
  const author = findUserById(authorId)
  const w = {
    id: nextWebtoonId++,
    title: title?.trim() || '제목 없음',
    author: author?.name ?? '익명',
    authorId,
    thumbnail: thumbnail || `https://picsum.photos/seed/lp-${Date.now()}/400/560`,
    likes: 0,
    likedBy: new Set(),
    description: content?.slice(0, 100) ?? '',
    body: content ?? '',
    tags: Array.isArray(tags) ? tags.filter(Boolean).slice(0, 10) : [],
    createdAt: new Date().toISOString(),
  }
  webtoons.unshift(w)
  return publicWebtoon(w, authorId)
}

export function updateWebtoon(id, patch, requesterId) {
  const w = findWebtoonRaw(id)
  if (!w) return { error: 'NOT_FOUND' }
  if (w.authorId !== requesterId) return { error: 'FORBIDDEN' }
  if (patch.title != null) w.title = patch.title
  if (patch.content != null) {
    w.body = patch.content
    w.description = patch.content.slice(0, 100)
  }
  if (patch.thumbnail != null) w.thumbnail = patch.thumbnail
  if (Array.isArray(patch.tags)) w.tags = patch.tags.filter(Boolean).slice(0, 10)
  return { data: publicWebtoon(w, requesterId) }
}

export function deleteWebtoon(id, requesterId) {
  const idx = webtoons.findIndex((x) => x.id === Number(id))
  if (idx === -1) return { error: 'NOT_FOUND' }
  if (webtoons[idx].authorId !== requesterId) return { error: 'FORBIDDEN' }
  const removed = webtoons.splice(idx, 1)[0]
  for (let i = comments.length - 1; i >= 0; i--) {
    if (comments[i].webtoonId === removed.id) comments.splice(i, 1)
  }
  return { data: { ok: true, id: removed.id } }
}

export function toggleLike(id, userId) {
  const w = findWebtoonRaw(id)
  if (!w) return null
  if (w.likedBy.has(userId)) {
    w.likedBy.delete(userId)
    w.likes = Math.max(0, w.likes - 1)
  } else {
    w.likedBy.add(userId)
    w.likes += 1
  }
  return { liked: w.likedBy.has(userId), likes: w.likes }
}

// ---------- comments ----------
let nextCommentId = 1
const comments = []
for (let wid = 1; wid <= 50; wid++) {
  const count = 25 + ((wid * 7) % 10)
  for (let i = 0; i < count; i++) {
    // 1/4은 데모 유저(1) 소유 — 본인 댓글 메뉴 노출 데모
    const authorId = i % 4 === 0 ? 1 : 2
    const author = findUserById(authorId)
    comments.push({
      id: nextCommentId++,
      webtoonId: wid,
      author: author?.name ?? `독자${(i % 20) + 1}`,
      authorId,
      content: `${i + 1}번째 댓글이에요. 정말 재밌게 보고 있어요!`,
      createdAt: new Date(
        Date.now() - wid * 1000 * 60 * 60 - i * 1000 * 60 * 17,
      ).toISOString(),
    })
  }
}

export function listComments({ webtoonId, cursor, size = 10, order = 'newest' }) {
  const filtered = comments.filter((c) => c.webtoonId === Number(webtoonId))
  const sorted = filtered.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return order === 'oldest' ? ta - tb : tb - ta
  })
  let startIdx = 0
  if (cursor != null) {
    const idx = sorted.findIndex((c) => c.id === Number(cursor))
    startIdx = idx >= 0 ? idx + 1 : 0
  }
  const items = sorted.slice(startIdx, startIdx + size)
  const last = items[items.length - 1]
  return {
    items,
    nextCursor: items.length === size && last ? last.id : null,
    total: sorted.length,
  }
}

export function createComment({ webtoonId, content, authorId }) {
  const author = findUserById(authorId)
  const c = {
    id: nextCommentId++,
    webtoonId: Number(webtoonId),
    author: author?.name ?? '익명',
    authorId,
    content,
    createdAt: new Date().toISOString(),
  }
  comments.push(c)
  return c
}

export function updateComment(id, content, requesterId) {
  const c = comments.find((x) => x.id === Number(id))
  if (!c) return { error: 'NOT_FOUND' }
  if (c.authorId !== requesterId) return { error: 'FORBIDDEN' }
  c.content = content
  return { data: c }
}

export function deleteComment(id, requesterId) {
  const idx = comments.findIndex((x) => x.id === Number(id))
  if (idx === -1) return { error: 'NOT_FOUND' }
  if (comments[idx].authorId !== requesterId) return { error: 'FORBIDDEN' }
  const removed = comments.splice(idx, 1)[0]
  return { data: { ok: true, id: removed.id, webtoonId: removed.webtoonId } }
}
