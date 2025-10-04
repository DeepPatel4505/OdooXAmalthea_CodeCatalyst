import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, apiService } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('authToken')
        if (token) {
          apiService.setToken(token)
          
          // Verify token with backend
          const response = await authAPI.getProfile()
          if (response.success) {
            setUser(response.data.user)
            setIsAuthenticated(true)
          } else {
            // Token is invalid, clear it
            apiService.clearToken()
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        apiService.clearToken()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        const { user, token } = response.data
        
        // Store token and user data
        apiService.setToken(token)
        setUser(user)
        setIsAuthenticated(true)
        
        return { success: true, user }
      }
      
      throw new Error(response.message || 'Login failed')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData)
      
      if (response.success) {
        const { user, token } = response.data
        
        // Store token and user data
        apiService.setToken(token)
        setUser(user)
        setIsAuthenticated(true)
        
        return { success: true, user }
      }
      
      throw new Error(response.message || 'Signup failed')
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiService.clearToken()
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
