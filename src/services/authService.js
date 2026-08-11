import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStorage'

const USER_CACHE_KEY = 'authUser'

function parseStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

// ---- real auth (backed by the Echoes-I-Kept-server API) ----

function splitName(name) {
  const [firstName, ...rest] = name.trim().split(/\s+/)
  return { firstName, lastName: rest.join(' ') || null }
}

function toDisplayUser(apiUser) {
  return {
    ...apiUser,
    name: [apiUser.firstName, apiUser.lastName].filter(Boolean).join(' ') || apiUser.username,
  }
}

function cacheUser(user) {
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
}

function persistSession({ accessToken, refreshToken, user }) {
  setTokens({ accessToken, refreshToken })
  cacheUser(user)
}

// Signup no longer returns a session — the server requires the account's
// email to be verified (via a 6-digit code) before any login is allowed, so
// there's nothing to persist here anymore.
export async function signup({ firstName, lastName, username, email, password }) {
  try {
    const { data } = await apiClient.post('/api/auth/signup', {
      firstName,
      lastName: lastName?.trim() || null,
      username,
      email,
      password,
    })

    return { user: toDisplayUser(data.data) }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function login({ email, password, role }) {
  try {
    const { data } = await apiClient.post('/api/auth/login', { email, password, role })
    const user = toDisplayUser(data.data)
    persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user })

    return { user }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

// The server treats this as first-login, returning-user, or account-linking
// purely based on what's already in its database — the client just forwards
// the credential Google issued and persists whatever session comes back,
// identical in shape to login()'s response.
export async function loginWithGoogle(credential) {
  try {
    const { data } = await apiClient.post('/api/auth/google', { credential })
    const user = toDisplayUser(data.data)
    persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user })

    return { user }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function verifyEmail({ email, code }) {
  try {
    const { data } = await apiClient.post('/api/auth/verify-email', { email, code })
    const user = toDisplayUser(data.data)
    persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user })

    return { user }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function resendVerificationCode({ email }) {
  try {
    await apiClient.post('/api/auth/resend-verification-code', { email })
  } catch (error) {
    throw normalizeApiError(error)
  }
}

// Always "succeeds" from the caller's perspective — the server never
// reveals whether the email belongs to a real account, so there's nothing
// for this to branch on beyond a hard network/server failure.
export async function forgotPassword({ email }) {
  try {
    await apiClient.post('/api/auth/forgot-password', { email })
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function resetPasswordWithCode({ email, code, newPassword }) {
  try {
    const { data } = await apiClient.post('/api/auth/reset-password-with-code', {
      email,
      code,
      newPassword,
    })
    const user = toDisplayUser(data.data)
    persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user })

    return { user }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function updateProfile({ name, username, email, profilePic, bio }) {
  try {
    const { firstName, lastName } = splitName(name)
    const { data } = await apiClient.put('/api/auth/me', {
      firstName,
      lastName,
      username,
      email,
      profilePic: profilePic || null,
      bio,
    })

    const user = toDisplayUser(data.data)
    cacheUser(user)

    return user
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function resetPassword({ currentPassword, newPassword }) {
  try {
    const { data } = await apiClient.put('/api/auth/me/password', {
      currentPassword,
      newPassword,
    })

    // Resetting the password bumps token_version server-side, revoking the
    // session this request started with — store the fresh pair it returns.
    const user = toDisplayUser(data.data)
    persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user })
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function logout() {
  const refreshToken = getRefreshToken()

  try {
    if (refreshToken) {
      await apiClient.post('/api/auth/logout', { refreshToken })
    }
  } catch {
    // best-effort revoke — clear local state regardless of server response
  } finally {
    clearTokens()
    localStorage.removeItem(USER_CACHE_KEY)
  }
}

export function getStoredUser() {
  if (!getAccessToken()) return null
  return parseStoredJson(USER_CACHE_KEY, null)
}

// ---- admin member management (backed by the same server's /api/users) ----

export async function getAdminMembers() {
  try {
    const { data } = await apiClient.get('/api/users')
    return data.data.filter((user) => user.isActive).map(toDisplayUser)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function createAdminMember({ name, username, email, password, role, profilePic }) {
  try {
    const { firstName, lastName } = splitName(name)
    const { data } = await apiClient.post('/api/users', {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      profilePic: profilePic || null,
    })

    return toDisplayUser(data.data)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function updateAdminMember(
  userId,
  { name, username, email, password, role, profilePic },
) {
  try {
    const { firstName, lastName } = splitName(name)
    const { data } = await apiClient.put(`/api/users/${userId}`, {
      firstName,
      lastName,
      username,
      email,
      password: password || undefined,
      role,
      profilePic: profilePic || null,
    })

    return toDisplayUser(data.data)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function deleteAdminMember(userId) {
  try {
    await apiClient.delete(`/api/users/${userId}`)
  } catch (error) {
    throw normalizeApiError(error)
  }
}
