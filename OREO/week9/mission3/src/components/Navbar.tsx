import { usePlayListStore } from '../stores/usePlayListStore'

export default function Navbar() {
  // Zustand 셀렉터 — 필요한 필드만 꺼내쓰면 다른 필드 변화에는 리렌더 안 됨.
  const amount = usePlayListStore((state) => state.amount)

  return (
    <nav className="sticky top-0 z-10 bg-violet-700 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">🎵 UMC Play List</h1>
        <div className="relative">
          <span className="text-3xl" aria-hidden="true">🛒</span>
          <span
            aria-label={`장바구니 ${amount}개`}
            className="absolute -right-3 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 text-sm font-bold text-violet-900"
          >
            {amount}
          </span>
        </div>
      </div>
    </nav>
  )
}
