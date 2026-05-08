const users = new Map()
const refreshTokens = new Set()

let nextId = 1

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
  const user = { id: nextId++, email, password, name, provider }
  users.set(email, user)
  return user
}

export function upsertGoogleUser({ email, name }) {
  const existing = users.get(email)
  if (existing) return existing
  return createUser({ email, password: null, name, provider: 'google' })
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

const webtoons = []
for (let i = 1; i <= 50; i++) {
  const title = TITLES[(i - 1) % TITLES.length]
  const seasonSuffix = i > TITLES.length ? ` 시즌${Math.ceil(i / TITLES.length)}` : ''
  webtoons.push({
    id: i,
    title: `${title}${seasonSuffix}`,
    author: AUTHORS[(i - 1) % AUTHORS.length],
    thumbnail: `https://picsum.photos/seed/webtoon-${i}/400/560`,
    likes: ((i * 137) % 9000) + 100,
    description: `${title}의 매력을 담은 작품. 회차 ${i}권 진행중. 압도적인 연출과 캐릭터로 사랑받는 작품입니다.`,
    body: '본문이 길게 이어집니다. '.repeat(30),
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
  })
}

export function listWebtoons({ sort = 'newest', page = 1, size = 12 }) {
  const sorted = [...webtoons].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return sort === 'oldest' ? ta - tb : tb - ta
  })
  const start = (page - 1) * size
  const items = sorted.slice(start, start + size)
  return {
    items,
    page,
    size,
    total: sorted.length,
    hasNext: start + size < sorted.length,
  }
}

export function getWebtoon(id) {
  return webtoons.find((w) => w.id === Number(id)) ?? null
}

const comments = (() => {
  const arr = []
  let cid = 1
  for (let wid = 1; wid <= 50; wid++) {
    const count = 25 + ((wid * 7) % 10)
    for (let i = 0; i < count; i++) {
      arr.push({
        id: cid++,
        webtoonId: wid,
        author: `독자${(i % 20) + 1}`,
        content: `${i + 1}번째 댓글이에요. 정말 재밌게 보고 있어요!`,
        createdAt: new Date(
          Date.now() - wid * 1000 * 60 * 60 - i * 1000 * 60 * 17,
        ).toISOString(),
      })
    }
  }
  return arr
})()

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
