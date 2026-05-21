import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { updateMe, deleteMe } from '../api/auth.js'
import { qk } from '../lib/queryKeys.js'
import { useAuth } from '../auth/AuthContext.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function MyPage() {
  const { user, patchUser, clearAuth } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? '')
  const [confirmDelete, setConfirmDelete] = useState(params.get('delete') === '1')
  const fileInputRef = useRef(null)

  // user가 외부 갱신되면 폼 동기화 (편집 중이 아닐 때만)
  useEffect(() => {
    if (editing) return
    setName(user?.name ?? '')
    setBio(user?.bio ?? '')
    setAvatar(user?.avatar ?? '')
  }, [user, editing])

  const updateMut = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      patchUser(updated)
      qc.setQueryData(qk.users.me(), updated)
      setEditing(false)
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      clearAuth()
      navigate('/login', { replace: true })
    },
  })

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 올릴 수 있어요.')
      return
    }
    if (file.size > 1024 * 1024 * 2) {
      alert('2MB 이하 이미지만 올릴 수 있어요.')
      return
    }
    const url = await fileToDataUrl(file)
    setAvatar(url)
  }

  if (!user) {
    return (
      <main className="page">
        <p>로그인 정보를 확인하는 중…</p>
      </main>
    )
  }

  return (
    <main className="page mypage">
      <header className="mypage-header">
        <h1>마이 페이지</h1>
        {!editing && (
          <button
            type="button"
            className="btn small ghost"
            onClick={() => setEditing(true)}
          >
            ⚙ 설정
          </button>
        )}
      </header>

      {editing ? (
        <form
          className="form mypage-form"
          onSubmit={(e) => {
            e.preventDefault()
            // 비어있어도 저장 가능 (bio/avatar는 옵션) — name만 필수
            if (!name.trim()) return
            updateMut.mutate({ name: name.trim(), bio, avatar })
          }}
        >
          <div className="mypage-avatar-row">
            <div className="mypage-avatar">
              {avatar ? <img src={avatar} alt="프로필" /> : <span>👤</span>}
            </div>
            <div>
              <button
                type="button"
                className="btn small ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                사진 변경
              </button>
              {avatar && (
                <button
                  type="button"
                  className="btn small ghost danger"
                  onClick={() => setAvatar('')}
                  style={{ marginLeft: 8 }}
                >
                  제거
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
            </div>
          </div>

          <label>
            닉네임
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              required
            />
          </label>
          <label>
            한 줄 소개 (선택)
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={140}
              placeholder="자신을 짧게 소개해보세요"
            />
          </label>

          {updateMut.isError && (
            <p className="error">
              ⚠ {updateMut.error.response?.data?.message ?? updateMut.error.message}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setEditing(false)
                setName(user.name ?? '')
                setBio(user.bio ?? '')
                setAvatar(user.avatar ?? '')
              }}
              disabled={updateMut.isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={updateMut.isPending || !name.trim()}
            >
              {updateMut.isPending ? '저장 중…' : '저장'}
            </button>
          </div>
        </form>
      ) : (
        <section className="mypage-view">
          <div className="mypage-avatar large">
            {user.avatar ? <img src={user.avatar} alt="프로필" /> : <span>👤</span>}
          </div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          {user.bio ? (
            <p className="mypage-bio">{user.bio}</p>
          ) : (
            <p className="muted small">한 줄 소개를 추가해보세요.</p>
          )}
        </section>
      )}

      <hr style={{ margin: '32px 0', border: 0, borderTop: '1px solid var(--border, #2a2a35)' }} />

      <section>
        <h3 style={{ marginBottom: 8 }}>계정</h3>
        <p className="muted small" style={{ marginBottom: 12 }}>
          탈퇴하면 계정과 작성한 글·댓글이 모두 삭제돼요.
        </p>
        <button
          type="button"
          className="btn small danger"
          onClick={() => {
            setConfirmDelete(true)
            setParams({ delete: '1' }, { replace: true })
          }}
        >
          탈퇴하기
        </button>
      </section>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => {
          if (deleteMut.isPending) return
          setConfirmDelete(false)
          if (params.get('delete')) {
            const next = new URLSearchParams(params)
            next.delete('delete')
            setParams(next, { replace: true })
          }
        }}
        onConfirm={() => deleteMut.mutate()}
        title="정말 탈퇴할까요?"
        message="이 동작은 되돌릴 수 없어요. 동의하시면 '예'를 눌러주세요."
        confirmText="예, 탈퇴할게요"
        cancelText="아니오"
        confirmDanger
        pending={deleteMut.isPending}
      />
    </main>
  )
}
