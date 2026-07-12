import api from './axios'
import type { ServiceRequest, PagedResponse, StatusLog } from '../types'

export interface RequestFilters {
  status?: string; priority?: string; categoryId?: number
  keyword?: string; page?: number; size?: number
}

export const getRequests = (filters: RequestFilters = {}) =>
  api.get<PagedResponse<ServiceRequest>>('/api/requests', { params: filters }).then(r => r.data)

export const getRequest = (id: number) =>
  api.get<ServiceRequest>(`/api/requests/${id}`).then(r => r.data)

export const createRequest = (data: {
  title: string; description: string; categoryId: number
  location: string; priority: string
}) => api.post<ServiceRequest>('/api/requests', data).then(r => r.data)

export const updateStatus = (id: number, status: string, comment?: string) =>
  api.patch<ServiceRequest>(`/api/requests/${id}/status`, { status, comment }).then(r => r.data)

export const uploadEvidence = (id: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<ServiceRequest>(`/api/requests/${id}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const getAuditTrail = (id: number) =>
  api.get<StatusLog[]>(`/api/requests/${id}/audit`).then(r => r.data)

export const deleteRequest = (id: number) =>
  api.delete(`/api/requests/${id}`)
