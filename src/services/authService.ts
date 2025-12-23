import axios from 'axios'
import { User } from '../types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitlife-auth')
  if (token) {
    const authData = JSON.parse(token)
    if (authData.state?.token) {
      config.headers.Authorization = `Bearer ${authData.state.token}`
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fitlife-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  age: number
  height: number
  currentWeight: number
  targetWeight: number
  activityLevel: string
  goal: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async refreshToken(): Promise<LoginResponse> {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/password', { currentPassword, newPassword })
  },
}

export { api }