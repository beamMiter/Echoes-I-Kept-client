import { apiClient } from './apiClient'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStorage'
import { avatarUrl, mockUsers } from '../data/mockUsers'
import { getPasswordStrengthError } from '../utils/passwordValidation'

const USER_CACHE_KEY = 'authUser'
const REGISTERED_USERS_KEY = 'registeredUsers'
const USER_OVERRIDES_KEY = 'mockUserOverrides'
const DELETED_MOCK_USERS_KEY = 'deletedMockUsers'

function parseStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
}

function createError(message, status) {
  const error = new Error(message)
  error.response = { status, data: { error: message } }
  return error
}

// Normalizes the real API's `{ error: { code, message } }` shape into the
// flat `{ error: <string> }` shape the rest of the app expects (matching
// what the mock service used to throw).
function normalizeApiError(error) {
  if (!error.response) return error
  const message = error.response.data?.error?.message || 'Something went wrong'
  return createError(message, error.response.status)
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

export async function signup({ name, username, email, password }, { persist = true } = {}) {
  try {
    const { firstName, lastName } = splitName(name)
    const { data } = await apiClient.post('/api/auth/signup', {
      firstName,
      lastName,
      username,
      email,
      password,
    })

    const user = toDisplayUser(data.data)
    if (persist) {
      persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user })
    }

    return { user }
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

export async function updateProfile({ name, username, email, profilePic }) {
  try {
    const { firstName, lastName } = splitName(name)
    const { data } = await apiClient.put('/api/auth/me', {
      firstName,
      lastName,
      username,
      email,
      profilePic: profilePic || null,
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

// ---- admin member management (still mock — not part of this branch) ----
//
// This section is unchanged demo data, disconnected from the real `users`
// table. `requireAdmin` below only checks the real logged-in user's role;
// wiring these to the real `/api/users` endpoints is a separate follow-up.

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function normalizeUsername(username) {
  return username.trim()
}

function getRegisteredUsers() {
  return parseStoredJson(REGISTERED_USERS_KEY, [])
}

function getUserOverrides() {
  return parseStoredJson(USER_OVERRIDES_KEY, {})
}

function getDeletedMockUserIds() {
  return parseStoredJson(DELETED_MOCK_USERS_KEY, [])
}

function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users))
}

function saveUserOverrides(overrides) {
  localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides))
}

function saveDeletedMockUserIds(userIds) {
  localStorage.setItem(DELETED_MOCK_USERS_KEY, JSON.stringify(userIds))
}

function applyUserOverride(user) {
  const override = getUserOverrides()[user.id]
  return override ? { ...user, ...override } : user
}

function getAllUsers() {
  const deletedIds = getDeletedMockUserIds()
  return [
    ...mockUsers.filter((user) => !deletedIds.includes(user.id)).map(applyUserOverride),
    ...getRegisteredUsers(),
  ]
}

function toPublicUser(user) {
  const publicUser = { ...user }
  delete publicUser.password
  return publicUser
}

function getNextUserId() {
  const maxId = getAllUsers().reduce((max, user) => Math.max(max, Number(user.id)), 0)
  return maxId + 1
}

function countAdmins(users = getAllUsers()) {
  return users.filter((user) => user.role === 'admin').length
}

function deleteStoredUser(userId) {
  const registeredUsers = getRegisteredUsers()
  const registeredIndex = registeredUsers.findIndex((user) => user.id === userId)

  if (registeredIndex >= 0) {
    registeredUsers.splice(registeredIndex, 1)
    saveRegisteredUsers(registeredUsers)
    return
  }

  const deletedIds = getDeletedMockUserIds()
  if (!deletedIds.includes(userId)) {
    saveDeletedMockUserIds([...deletedIds, userId])
  }

  const overrides = getUserOverrides()
  delete overrides[userId]
  saveUserOverrides(overrides)
}

function validateUniqueUserFields({ email, username, excludedUserId }) {
  const users = getAllUsers()
  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = normalizeUsername(username)

  if (
    users.some(
      (user) => user.id !== excludedUserId && normalizeEmail(user.email) === normalizedEmail,
    )
  ) {
    throw createError('Email is already registered')
  }

  if (
    users.some(
      (user) =>
        user.id !== excludedUserId &&
        normalizeUsername(user.username).toLowerCase() === normalizedUsername.toLowerCase(),
    )
  ) {
    throw createError('Username is already taken')
  }
}

function requireAdmin() {
  const currentUser = getStoredUser()

  if (!currentUser) {
    throw createError('Unauthorized', 401)
  }
  if (currentUser.role !== 'admin') {
    throw createError('Forbidden', 403)
  }

  return currentUser
}

export function getAdminMembers() {
  requireAdmin()
  return getAllUsers().map(toPublicUser)
}

export function createAdminMember({ name, username, email, password, role, profilePic }) {
  requireAdmin()

  const passwordError = getPasswordStrengthError(password)
  if (passwordError) {
    throw createError(passwordError)
  }

  validateUniqueUserFields({ email, username })

  const newUser = {
    id: getNextUserId(),
    name: name.trim(),
    username: normalizeUsername(username),
    email: normalizeEmail(email),
    password,
    role,
    profilePic: profilePic.trim() || avatarUrl(name.trim(), '2B6CB0'),
  }

  const registered = getRegisteredUsers()
  registered.push(newUser)
  saveRegisteredUsers(registered)

  return toPublicUser(newUser)
}

export function updateAdminMember(userId, { name, username, email, password, role, profilePic }) {
  requireAdmin()

  const numericUserId = Number(userId)
  const currentUsers = getAllUsers()
  const targetUser = currentUsers.find((user) => user.id === numericUserId)

  if (!targetUser) {
    throw createError('Member not found', 404)
  }

  const passwordError = password ? getPasswordStrengthError(password) : ''
  if (passwordError) {
    throw createError(passwordError)
  }

  if (targetUser.role === 'admin' && role !== 'admin' && countAdmins(currentUsers) <= 1) {
    throw createError('At least one admin account is required')
  }

  validateUniqueUserFields({ email, username, excludedUserId: numericUserId })

  const updatedUser = {
    ...targetUser,
    name: name.trim(),
    username: normalizeUsername(username),
    email: normalizeEmail(email),
    password: password || targetUser.password,
    role,
    profilePic: profilePic.trim() || avatarUrl(name.trim(), '2B6CB0'),
  }

  const registeredUsers = getRegisteredUsers()
  const registeredIndex = registeredUsers.findIndex((user) => user.id === updatedUser.id)

  if (registeredIndex >= 0) {
    registeredUsers[registeredIndex] = updatedUser
    saveRegisteredUsers(registeredUsers)
  } else {
    const overrides = getUserOverrides()
    overrides[updatedUser.id] = {
      ...(overrides[updatedUser.id] || {}),
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      password: updatedUser.password,
      profilePic: updatedUser.profilePic,
    }
    saveUserOverrides(overrides)
  }

  return toPublicUser(updatedUser)
}

export function deleteAdminMember(userId) {
  requireAdmin()
  const numericUserId = Number(userId)
  const currentUsers = getAllUsers()
  const targetUser = currentUsers.find((user) => user.id === numericUserId)

  if (!targetUser) {
    throw createError('Member not found', 404)
  }

  if (targetUser.role === 'admin' && countAdmins(currentUsers) <= 1) {
    throw createError('At least one admin account is required')
  }

  deleteStoredUser(numericUserId)
}
