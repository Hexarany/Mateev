import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'admin'
  accessLevel: 'free' | 'basic' | 'premium'
  paymentAmount?: number
  paymentDate?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  updateUser: (updatedUser: User) => void
  hasAccess: (requiredTier: 'free' | 'basic' | 'premium') => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Загрузка токена из localStorage при инициализации
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      loadUserProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Загрузка профиля пользователя
  const loadUserProfile = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // Если токен невалидный, удаляем его
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Вход
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || 'Ошибка входа')
    }
  }

  // Регистрация
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
      })

      const { token: newToken, user: newUser } = response.data

      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.response?.data?.message || 'Ошибка регистрации')
    }
  }

  // Обновление данных пользователя (например, после покупки тарифа)
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  // Проверка доступа к контенту по тарифу
  const hasAccess = (requiredTier: 'free' | 'basic' | 'premium'): boolean => {
    if (!user) return false

    // Админы и учителя имеют полный доступ
    if (user.role === 'admin' || user.role === 'teacher') {
      return true
    }

    const tierHierarchy = { free: 0, basic: 1, premium: 2 }
    const userLevel = tierHierarchy[user.accessLevel]
    const requiredLevel = tierHierarchy[requiredTier]

    return userLevel >= requiredLevel
  }

  // Выход
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    hasAccess,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
