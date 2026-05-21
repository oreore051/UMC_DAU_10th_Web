import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateComment, deleteComment } from '../api/webtoons.js'
import { qk } from '../lib/queryKeys.js'
import ConfirmModal from './ConfirmModal.jsx'

// 댓글 한 개 + 본인 댓글이면 ... 메뉴 (수정 / 삭제)
export default function CommentItem({ comment, isMine, webtoonId }) {
  const qc = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.content)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef(null)

  // ... 메뉴 바깥 클릭 닫기
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const updateMut = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      // 같은 글의 모든 정렬·페이지 댓글 캐시 무효화
      qc.invalidateQueries({ queryKey: qk.webtoons.comments(webtoonId) })
      setEditing(false)
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.webtoons.comments(webtoonId) })
      setConfirmDelete(false)
    },
  })

  return (
    <li className="comment">
      <div className="comment-meta">
        <strong>{comment.author}</strong>
        <span className="muted small">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
        {isMine && !editing && (
          <div className="comment-menu" ref={menuRef}>
            <button
              type="button"
              className="comment-menu-trigger"
              aria-label="댓글 메뉴"
              onClick={() => setMenuOpen((v) => !v)}
            >
              …
            </button>
            {menuOpen && (
              <div className="comment-menu-pop" role="menu">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setEditing(true)
                    setDraft(comment.content)
                  }}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    setMenuOpen(false)
                    setConfirmDelete(true)
                  }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {editing ? (
        <form
          className="comment-edit-form"
          onSubmit={(e) => {
            e.preventDefault()
            const trimmed = draft.trim()
            if (!trimmed || trimmed === comment.content) {
              setEditing(false)
              return
            }
            updateMut.mutate({ id: comment.id, content: trimmed })
          }}
        >
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="comment-edit-actions">
            <button
              type="button"
              className="btn ghost small"
              onClick={() => setEditing(false)}
              disabled={updateMut.isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn small primary"
              disabled={!draft.trim() || updateMut.isPending}
            >
              {updateMut.isPending ? '저장 중…' : '저장'}
            </button>
          </div>
          {updateMut.isError && (
            <p className="error small">
              ⚠ {updateMut.error.response?.data?.message ?? updateMut.error.message}
            </p>
          )}
        </form>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}

      <ConfirmModal
        open={confirmDelete}
        onClose={() => !deleteMut.isPending && setConfirmDelete(false)}
        onConfirm={() => deleteMut.mutate({ id: comment.id })}
        title="댓글을 삭제할까요?"
        message="삭제하면 되돌릴 수 없어요."
        confirmText="삭제"
        confirmDanger
        pending={deleteMut.isPending}
      />
    </li>
  )
}
