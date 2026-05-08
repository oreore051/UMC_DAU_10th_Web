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
