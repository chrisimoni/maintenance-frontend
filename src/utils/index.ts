import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RequestStatus, RequestPriority, Role } from '../types'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const statusClass: Record<RequestStatus, string> = {
  PENDING:     'badge-pending',
  ASSIGNED:    'badge-assigned',
  IN_PROGRESS: 'badge-progress',
  COMPLETED:   'badge-completed',
  REJECTED:    'badge-rejected',
}

export const statusLabel: Record<RequestStatus, string> = {
  PENDING:     'Pending',
  ASSIGNED:    'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  REJECTED:    'Rejected',
}

export const priorityClass: Record<RequestPriority, string> = {
  LOW:    'badge-low',
  MEDIUM: 'badge-medium',
  HIGH:   'badge-high',
  URGENT: 'badge-urgent',
}

export const roleClass: Record<Role, string> = {
  STUDENT: 'badge-student',
  STAFF:   'badge-staff',
  OFFICER: 'badge-officer',
  ADMIN:   'badge-admin',
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
