import { memo } from 'react'

// memo 데모용 자식 컴포넌트.
// props가 얕은 비교(===)로 같으면 리렌더가 스킵된다.
// 부모에서 onClick을 useCallback 없이 인라인으로 만들면 매번 새 함수 참조라
// memo가 의미 없어진다 (참조 동일성 깨짐).
interface Props {
  label: string
  onClick: () => void
}

function ExpensiveChild({ label, onClick }: Props) {
  // 일부러 무거운 작업처럼 콘솔 로그 — 렌더 발화 여부를 시각화
  console.log(`[render] <ExpensiveChild label="${label}" />`)
  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #d1d5db',
        borderRadius: 8,
        marginTop: 12,
      }}
    >
      <p style={{ margin: 0 }}>{label}</p>
      <button onClick={onClick} style={{ marginTop: 8 }}>
        클릭
      </button>
    </div>
  )
}

// memo로 감싸면 props가 얕은 비교상 같을 때 리렌더 스킵.
export default memo(ExpensiveChild)
