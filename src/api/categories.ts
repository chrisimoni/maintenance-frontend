import api from './axios'
import type { Category } from '../types'

export const getCategories = () =>
  api.get<Category[]>('/api/categories').then(r => r.data)

export const getAllCategories = () =>
  api.get<Category[]>('/api/categories/all').then(r => r.data)

export const createCategory = (data: { name: string; description?: string }) =>
  api.post<Category>('/api/categories', data).then(r => r.data)

export const toggleCategory = (id: number, activate: boolean) =>
  api.patch<Category>(`/api/categories/${id}/${activate ? 'activate' : 'deactivate'}`).then(r => r.data)

export const exportReport = (status?: string) =>
  api.get('/api/reports/export', {
    params: status ? { status } : {},
    responseType: 'blob',
  }).then(r => r.data)
