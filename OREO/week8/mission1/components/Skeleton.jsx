export function SkeletonCard() {
  return (
    <li className="card skeleton-card">
      <div className="thumb skeleton-shimmer" />
      <div className="card-body">
        <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: 14 }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: 12, marginTop: 8 }} />
      </div>
    </li>
  )
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <ul className="card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </ul>
  )
}

export function SkeletonComment() {
  return (
    <li className="comment skeleton-comment">
      <div className="skeleton-line skeleton-shimmer" style={{ width: '20%', height: 12 }} />
      <div className="skeleton-line skeleton-shimmer" style={{ width: '90%', height: 14, marginTop: 8 }} />
      <div className="skeleton-line skeleton-shimmer" style={{ width: '70%', height: 14, marginTop: 6 }} />
    </li>
  )
}

export function SkeletonCommentList({ count = 4 }) {
  return (
    <ul className="comment-list">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComment key={i} />
      ))}
    </ul>
  )
}
