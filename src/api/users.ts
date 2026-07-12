import api from './axios'
import type { User, PagedResponse } from '../types'

export const getUsers = (role?: string, page = 0, size = 20) =>
  api.get<PagedResponse<User>>('/api/users', { params: { role, page, size } }).then(r => r.data)

export const getUser = (id: number) =>
  api.get<User>(`/api/users/${id}`).then(r => r.data)

export const toggleUser = (id: number, enable: boolean) =>
  api.patch<User>(`/api/users/${id}/${enable ? 'enable' : 'disable'}`).then(r => r.data)

export const deleteUser = (id: number) =>
  api.delete(`/api/users/${id}`)
