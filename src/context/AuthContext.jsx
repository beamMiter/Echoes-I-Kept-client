import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthContext from './AuthContextCore'
import * as authService from '../services/authService'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [state, setState] = useState({
    user: authService.getStoredUser(),
    loading: false,
    error: null,
    getUserLoading: false,
  })

  const login = async (credentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await authService.login(credentials)
      setState((prev) => ({
        ...prev,
        user: result.user,
        loading: false,
        error: null,
      }))
      return { user: result.user }
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const signup = async (data, options = {}) => {
    const shouldAutoLogin = options.autoLogin !== false

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await authService.signup(data, { persist: shouldAutoLogin })
      setState((prev) => ({
        ...prev,
        user: shouldAutoLogin ? result.user : prev.user,
        loading: false,
        error: null,
      }))
      return { user: result.user }
    } catch (err) {
      const message = err.response?.data?.error || 'Sign up failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const updateProfile = async (profile) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const user = await authService.updateProfile(profile)
      setState((prev) => ({ ...prev, user, loading: false, error: null }))
      return null
    } catch (err) {
      const message = err.response?.data?.error || 'Update profile failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const resetPassword = async (passwords) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await authService.resetPassword(passwords)
      setState((prev) => ({ ...prev, loading: false, error: null }))
      return null
    } catch (err) {
      const message = err.response?.data?.error || 'Reset password failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const logout = () => {
    authService.logout()
    setState({ user: null, loading: false, error: null, getUserLoading: false })
    toast.success('Logged out', {
      description: 'You have signed out of your listening journal.',
    })
    navigate('/')
  }

  const isAuthenticated = !!state.user

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        signup,
        updateProfile,
        resetPassword,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
