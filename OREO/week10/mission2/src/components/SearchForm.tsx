import { memo } from 'react'

// 검색 폼 — 영화 제목 / 성인 콘텐츠 / 언어 세 가지 입력.
// memo로 감싸서, App에서 query 같은 다른 state가 바뀌어도 props가 같으면 리렌더 스킵.

export type Language = 'ko-KR' | 'en-US' | 'ja-JP'

interface Props {
  query: string
  includeAdult: boolean
  language: Language
  onQueryChange: (v: string) => void
  onAdultChange: (v: boolean) => void
  onLanguageChange: (v: Language) => void
  onSubmit: () => void
}

function SearchForm({
  query,
  includeAdult,
  language,
  onQueryChange,
  onAdultChange,
  onLanguageChange,
  onSubmit,
}: Props) {
  console.log('[render] <SearchForm />')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <label className="flex-1 min-w-60">
        <span className="block mb-1 text-xs font-medium text-gray-500">영화 제목</span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="영화 제목을 입력하세요"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </label>

      <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={includeAdult}
          onChange={(e) => onAdultChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        성인 콘텐츠 포함
      </label>

      <label>
        <span className="block mb-1 text-xs font-medium text-gray-500">언어</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="ko-KR">한국어 (ko-KR)</option>
          <option value="en-US">영어 (en-US)</option>
          <option value="ja-JP">일본어 (ja-JP)</option>
        </select>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        검색
      </button>
    </form>
  )
}

// SearchForm은 props가 모두 primitive(string, boolean) + 함수 reference.
// 부모에서 콜백들을 useCallback으로 감싸주면 memo가 효과를 발휘한다.
export default memo(SearchForm)
