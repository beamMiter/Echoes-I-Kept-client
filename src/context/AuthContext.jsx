import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthContext from './AuthContextCore'
import * as authService from '../services/authService'
import { onUnauthorized } from '../services/apiClient'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [state, setState] = useState({
    user: authService.getStoredUser(),
    loading: false,
    error: null,
    getUserLoading: false,
  })

  useEffect(() => {
    onUnauthorized(() => {
      setState({ user: null, loading: false, error: null, getUserLoading: false })
    })
  }, [])

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
      return { error: message, code: err.code }
    }
  }

  const loginWithGoogle = async (credential) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await authService.loginWithGoogle(credential)
      setState((prev) => ({
        ...prev,
        user: result.user,
        loading: false,
        error: null,
      }))
      return { user: result.user }
    } catch (err) {
      // err.response missing means the request never got an HTTP response at
      // all (server unreachable, CORS block, timeout) — distinct from a real
      // server-side rejection, and worth telling the user apart from it.
      const message = err.response
        ? err.response.data?.error || 'Google sign-in failed'
        : "Couldn't reach the server — check it's running and try again"
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message, code: err.code }
    }
  }

  // Never logs the user in — the server requires email verification first,
  // so there's no session to persist yet. The caller (AuthPage) sends them
  // to the verify-code step next.
  const signup = async (data) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await authService.signup(data)
      setState((prev) => ({ ...prev, loading: false, error: null }))
      return { user: result.user }
    } catch (err) {
      const message = err.response?.data?.error || 'Sign up failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const verifyEmail = async (payload) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await authService.verifyEmail(payload)
      setState((prev) => ({ ...prev, user: result.user, loading: false, error: null }))
      return { user: result.user }
    } catch (err) {
      const message = err.response?.data?.error || 'Verification failed'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message, code: err.code }
    }
  }

  const resendVerificationCode = async (payload) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await authService.resendVerificationCode(payload)
      setState((prev) => ({ ...prev, loading: false, error: null }))
      return null
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to resend code'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const forgotPassword = async (payload) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      await authService.forgotPassword(payload)
      setState((prev) => ({ ...prev, loading: false, error: null }))
      return null
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to request a reset link'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message }
    }
  }

  const resetPasswordWithToken = async (payload) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const result = await authService.resetPasswordWithToken(payload)
      setState((prev) => ({ ...prev, user: result.user, loading: false, error: null }))
      return { user: result.user }
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to reset your password'
      setState((prev) => ({ ...prev, loading: false, error: message }))
      return { error: message, code: err.code }
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

  const logout = async () => {
    await authService.logout()
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
        loginWithGoogle,
        signup,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPasswordWithToken,
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
