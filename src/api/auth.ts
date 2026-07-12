import api from './axios'
import type { AuthResponse, User } from '../types'

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/api/auth/login', { email, password }).then(r => r.data)

export const register = (data: {
  name: string; email: string; password: string
  role: string; phone?: string; department?: string
}) => api.post<User>('/api/auth/register', data).then(r => r.data)

export const getMe = () =>
  api.get<User>('/api/auth/me').then(r => r.data)
