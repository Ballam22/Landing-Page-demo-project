import {BlogStatus, STATUS_BADGE_CLASS} from '../model/Blog'

type StatusBadgeProps = {
  status: BlogStatus
}

export function StatusBadge({status}: StatusBadgeProps) {
  const statusClass = `status-${status.toLowerCase()}`
  return (
    <span className={`badge blog-status-badge ${STATUS_BADGE_CLASS[status]} ${statusClass}`}>
      {status}
    </span>
  )
}
