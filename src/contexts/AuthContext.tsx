'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginRequest, RegisterRequest } from '@/types'
import { authService } from '@/services/auth'

interface AuthContextType {
  user: User | null
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (userData: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (userData: User) => void
  refreshUser: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    console.log('Checking authentication...');
    if (authService.isAuthenticated()) {
      try {
        console.log('User is authenticated, getting current user...');
        const userData = await authService.getCurrentUser()
        console.log('Current user data:', userData);
        setUser(userData)
      } catch (error) {
        console.error('Auth check failed:', error)
        await authService.logout()
      }
    } else {
      console.log('User is not authenticated');
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      
      if (response.success && response.user) {
        setUser(response.user)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await authService.register(userData)
      
      if (response.success && response.user) {
        setUser(response.user)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('User refresh failed:', error)
      }
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 