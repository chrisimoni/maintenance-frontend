import { statusClass, statusLabel, priorityClass, roleClass } from '../../utils'
import type { RequestStatus, RequestPriority, Role } from '../../types'

export const StatusBadge = ({ status }: { status: RequestStatus }) => (
  <span className={statusClass[status]}>{statusLabel[status]}</span>
)

export const PriorityBadge = ({ priority }: { priority: RequestPriority }) => (
  <span className={priorityClass[priority]}>{priority}</span>
)

export const RoleBadge = ({ role }: { role: Role }) => (
  <span className={roleClass[role]}>{role}</span>
)
