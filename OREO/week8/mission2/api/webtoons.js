import { api } from './axios.js'

export async function fetchWebtoons({ sort = 'newest', page = 1, size = 12 }) {
  const { data } = await api.get('/webtoons', {
    params: { sort, page, size },
  })
  return data
}

export async function fetchWebtoon(id) {
  const { data } = await api.get(`/webtoons/${id}`)
  return data
}

// 검색 + 무한 스크롤 (미션1).
// q: 검색어, cursor: 마지막으로 받은 nextCursor.
// 응답 모양: { items, nextCursor, total, query }
export async function searchWebtoons({ q, cursor, size = 12 }) {
  const { data } = await api.get('/webtoons/search', {
    params: {
      q,
      cursor: cursor ?? undefined,
      size,
    },
  })
  return data
}

export async function fetchWebtoonComments({ webtoonId, cursor, size = 10, order = 'newest' }) {
  const { data } = await api.get(`/webtoons/${webtoonId}/comments`, {
    params: {
      cursor: cursor ?? undefined,
      size,
      order,
    },
  })
  return data
}

// ---------- LP Mutations ----------

export async function createWebtoon({ title, content, thumbnail, tags }) {
  const { data } = await api.post('/webtoons', { title, content, thumbnail, tags })
  return data
}

export async function updateWebtoon(id, patch) {
  const { data } = await api.patch(`/webtoons/${id}`, patch)
  return data
}

export async function deleteWebtoon(id) {
  const { data } = await api.delete(`/webtoons/${id}`)
  return data
}

export async function toggleWebtoonLike(id) {
  const { data } = await api.post(`/webtoons/${id}/likes`)
  return data // { liked, likes }
}

// ---------- Comment Mutations ----------

export async function createComment({ webtoonId, content }) {
  const { data } = await api.post(`/webtoons/${webtoonId}/comments`, { content })
  return data
}

export async function updateComment({ id, content }) {
  const { data } = await api.patch(`/comments/${id}`, { content })
  return data
}

export async function deleteComment({ id }) {
  const { data } = await api.delete(`/comments/${id}`)
  return data
}
