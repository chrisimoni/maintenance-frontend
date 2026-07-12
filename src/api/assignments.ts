import api from './axios'
import type { Assignment, PagedResponse } from '../types'

export const getMyAssignments = (page = 0, size = 20) =>
  api.get<PagedResponse<Assignment>>('/api/assignments/my', { params: { page, size } }).then(r => r.data)

export const getAllAssignments = (page = 0, size = 20) =>
  api.get<PagedResponse<Assignment>>('/api/assignments', { params: { page, size } }).then(r => r.data)

export const createAssignment = (data: { requestId: number; officerId: number; notes?: string }) =>
  api.post<Assignment>('/api/assignments', data).then(r => r.data)
