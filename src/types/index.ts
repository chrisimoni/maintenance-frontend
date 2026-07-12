export type Role = 'STUDENT' | 'STAFF' | 'OFFICER' | 'ADMIN'
export type RequestStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: Role
  department?: string
  enabled: boolean
  createdAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
  active: boolean
}

export interface ServiceRequest {
  id: number
  title: string
  description: string
  categoryId: number
  categoryName: string
  location: string
  status: RequestStatus
  priority: RequestPriority
  submitter: User
  evidenceUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: number
  request: ServiceRequest
  officer: User
  assignedBy: User
  assignedAt: string
  notes?: string
}

export interface StatusLog {
  id: number
  oldStatus?: RequestStatus
  newStatus: RequestStatus
  comment?: string
  changedBy: User
  changedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface AuthResponse {
  token: string
  tokenType: string
  user: User
}

export interface ErrorResponse {
  status: number
  error: string
  message: string
  timestamp: string
  fieldErrors?: Record<string, string>
}
