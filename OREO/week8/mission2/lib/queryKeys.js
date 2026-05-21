// Query Key Factory.
// 학습 목표: 목록/단건/필터 조합 키를 일관되게 설계하고 부분 무효화 범위를 제어한다.
//
// invalidateQueries({ queryKey: qk.webtoons.all() }) → 모든 웹툰 관련 캐시 무효화
// invalidateQueries({ queryKey: qk.webtoons.lists() }) → 목록만
// invalidateQueries({ queryKey: qk.webtoons.detail(id) }) → 특정 단건만
// invalidateQueries({ queryKey: qk.webtoons.comments(id) }) → 해당 글의 댓글 목록만
//
// 키 prefix를 트리 형태로 만들어두면, TanStack Query가 prefix matching으로
// 한 번에 여러 캐시를 무효화할 수 있다.

export const qk = {
  webtoons: {
    all: () => ['webtoons'],
    lists: () => [...qk.webtoons.all(), 'list'],
    list: (params) => [...qk.webtoons.lists(), params],
    details: () => [...qk.webtoons.all(), 'detail'],
    detail: (id) => [...qk.webtoons.details(), Number(id)],
    comments: (webtoonId) => [...qk.webtoons.detail(webtoonId), 'comments'],
    commentList: (webtoonId, params) => [...qk.webtoons.comments(webtoonId), params],
    search: (q) => [...qk.webtoons.all(), 'search', q],
  },
  users: {
    me: () => ['users', 'me'],
  },
}
