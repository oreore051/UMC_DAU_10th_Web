import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWebtoon, updateWebtoon } from '../api/webtoons.js'
import { qk } from '../lib/queryKeys.js'
import Modal from './Modal.jsx'

// 파일을 dataURL로 변환 — 백엔드가 storage가 없으니 브라우저에서 임시 저장.
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 글 작성 / 수정 공용 모달.
// mode='create' | 'edit'  initial=수정 시 기존 webtoon (객체)
export default function LpWriteModal({ open, onClose, mode = 'create', initial, onSuccess }) {
  const qc = useQueryClient()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  // open될 때마다 초기 상태 설정 (수정 시 기존 값 채우기)
  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setContent(initial?.body ?? initial?.description ?? '')
    setThumbnail(initial?.thumbnail ?? '')
    setTags(initial?.tags ?? [])
    setTagInput('')
  }, [open, initial])

  const createMut = useMutation({
    mutationFn: createWebtoon,
    onSuccess: (created) => {
      // 목록 무효화 → 새로고침. 단건 캐시도 미리 넣어둠 (상세 진입 즉시 반영).
      qc.invalidateQueries({ queryKey: qk.webtoons.lists() })
      qc.setQueryData(qk.webtoons.detail(created.id), created)
      onSuccess?.(created)
      onClose?.()
    },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, patch }) => updateWebtoon(id, patch),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: qk.webtoons.lists() })
      qc.setQueryData(qk.webtoons.detail(updated.id), updated)
      onSuccess?.(updated)
      onClose?.()
    },
  })

  const isPending = createMut.isPending || updateMut.isPending
  const error = createMut.error || updateMut.error

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (!t || tags.includes(t) || tags.length >= 10) {
      setTagInput('')
      return
    }
    setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const removeTag = (t) => {
    setTags((prev) => prev.filter((x) => x !== t))
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 올릴 수 있어요.')
      return
    }
    if (file.size > 1024 * 1024 * 3) {
      alert('3MB 이하 이미지만 올릴 수 있어요.')
      return
    }
    const url = await fileToDataUrl(file)
    setThumbnail(url)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = { title: title.trim(), content, tags, thumbnail }
    if (mode === 'edit' && initial?.id != null) {
      updateMut.mutate({ id: initial.id, patch: payload })
    } else {
      createMut.mutate(payload)
    }
  }

  return (
    <Modal
      open={open}
      onClose={isPending ? undefined : onClose}
      title={mode === 'edit' ? 'LP 수정' : '새 LP 작성'}
      footer={
        <>
          <button type="button" className="btn ghost small" onClick={onClose} disabled={isPending}>
            취소
          </button>
          <button
            type="submit"
            form="lp-write-form"
            className="btn small primary"
            disabled={isPending || !title.trim()}
          >
            {isPending ? '저장 중…' : mode === 'edit' ? '저장' : 'Add LP'}
          </button>
        </>
      }
    >
      <form id="lp-write-form" className="form" onSubmit={handleSubmit}>
        {/* 썸네일 미리보기 + 파일 업로드 */}
        <div className="lp-thumb-uploader">
          {thumbnail ? (
            <img src={thumbnail} alt="썸네일 미리보기" className="lp-thumb-preview" />
          ) : (
            <button
              type="button"
              className="lp-thumb-empty"
              onClick={() => fileInputRef.current?.click()}
            >
              <span aria-hidden>＋</span>
              <span className="muted small">사진을 올려주세요</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          {thumbnail && (
            <div className="lp-thumb-actions">
              <button
                type="button"
                className="btn ghost small"
                onClick={() => fileInputRef.current?.click()}
              >
                사진 변경
              </button>
              <button
                type="button"
                className="btn ghost small danger"
                onClick={() => setThumbnail('')}
              >
                제거
              </button>
            </div>
          )}
        </div>

        <label>
          제목
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="LP 제목을 입력하세요"
            maxLength={80}
            required
          />
        </label>

        <label>
          내용
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이 LP를 소개해주세요"
            maxLength={1000}
          />
        </label>

        {/* 태그: 클라이언트 상태 관리 */}
        <div>
          <label htmlFor="tag-input">태그 (Enter 또는 추가)</label>
          <div className="tag-input-row">
            <input
              id="tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
                  setTags((prev) => prev.slice(0, -1))
                }
              }}
              placeholder="예: 액션, 일상…"
              maxLength={20}
            />
            <button
              type="button"
              className="btn small"
              onClick={addTag}
              disabled={!tagInput.trim() || tags.length >= 10}
            >
              추가
            </button>
          </div>
          {tags.length > 0 && (
            <ul className="tag-chip-list">
              {tags.map((t) => (
                <li key={t} className="tag-chip">
                  <span>#{t}</span>
                  <button
                    type="button"
                    className="tag-chip-x"
                    aria-label={`${t} 태그 삭제`}
                    onClick={() => removeTag(t)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small">{tags.length} / 10</p>
        </div>

        {error && (
          <p className="error">⚠ {error.response?.data?.message ?? error.message}</p>
        )}
      </form>
    </Modal>
  )
}
