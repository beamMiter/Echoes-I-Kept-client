import { avatarUrl, mockUsers } from '../data/mockUsers'
import { getPasswordStrengthError } from '../utils/passwordValidation'

const TOKEN_KEY = 'token'
const USER_KEY = 'mockUser'
const REGISTERED_USERS_KEY = 'registeredUsers'
const USER_OVERRIDES_KEY = 'mockUserOverrides'
const DELETED_MOCK_USERS_KEY = 'deletedMockUsers'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function toPublicUser(user) {
  const publicUser = { ...user }
  delete publicUser.password
  return publicUser
}

function parseStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    localStorage.removeItem(key)
    return fallback
  }
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

function createError(message, status) {
  const error = new Error(message)
  error.response = { status, data: { error: message } }
  return error
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function normalizeUsername(username) {
  return username.trim()
}

function applyUserOverride(user) {
  const override = getUserOverrides()[user.id]
  return override ? { ...user, ...override } : user
}

function getAllUsers() {
  const deletedIds = getDeletedMockUserIds()
  return [
    ...mockUsers
      .filter((user) => !deletedIds.includes(user.id))
      .map(applyUserOverride),
    ...getRegisteredUsers(),
  ]
}

function persistSession(user) {
  const token = `mock-token-${user.id}`
  const publicUser = toPublicUser(user)
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(publicUser))
  return { access_token: token, user: publicUser }
}

function getCurrentPublicUser() {
  return parseStoredJson(USER_KEY, null)
}

function persistUserUpdate(updatedUser) {
  const registeredUsers = getRegisteredUsers()
  const registeredIndex = registeredUsers.findIndex(
    (user) => user.id === updatedUser.id,
  )

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

  const currentUser = getCurrentPublicUser()

  if (currentUser?.id === updatedUser.id) {
    return persistSession(updatedUser).user
  }

  return toPublicUser(updatedUser)
}

function getCurrentFullUser() {
  const currentUser = getCurrentPublicUser()

  if (!currentUser) {
    throw createError('Unauthorized', 401)
  }

  const fullUser = getAllUsers().find((user) => user.id === currentUser.id)

  if (!fullUser) {
    throw createError('Unauthorized', 401)
  }

  return fullUser
}

function validateUniqueUserFields({ email, username, excludedUserId }) {
  const users = getAllUsers()
  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = normalizeUsername(username)

  if (
    users.some(
      (user) =>
        user.id !== excludedUserId &&
        normalizeEmail(user.email) === normalizedEmail,
    )
  ) {
    throw createError('Email is already registered')
  }

  if (
    users.some(
      (user) =>
        user.id !== excludedUserId &&
        normalizeUsername(user.username).toLowerCase() ===
          normalizedUsername.toLowerCase(),
    )
  ) {
    throw createError('Username is already taken')
  }
}

function requireAdmin() {
  const currentUser = getCurrentFullUser()

  if (currentUser.role !== 'admin') {
    throw createError('Forbidden', 403)
  }

  return currentUser
}

function getNextUserId() {
  const maxId = getAllUsers().reduce(
    (max, user) => Math.max(max, Number(user.id)),
    0,
  )
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

export async function login({ email, password, role }) {
  await delay(500)

  const user = getAllUsers().find(
    (u) =>
      u.email === email &&
      u.password === password &&
      (!role || u.role === role),
  )

  if (!user) {
    const error = new Error('Invalid email or password')
    error.response = { data: { error: 'Invalid email or password' } }
    throw error
  }

  return persistSession(user)
}

export async function signup(
  { name, username, email, password },
  { persist = true } = {},
) {
  await delay(500)

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
    role: 'user',
    profilePic: avatarUrl(name, '2B6CB0'),
  }

  const registered = getRegisteredUsers()
  registered.push(newUser)
  saveRegisteredUsers(registered)

  return persist ? persistSession(newUser) : { user: newUser }
}

export async function updateProfile({ name, username, email, profilePic }) {
  await delay(400)

  const currentUser = getCurrentFullUser()
  validateUniqueUserFields({ email, username, excludedUserId: currentUser.id })

  return persistUserUpdate({
    ...currentUser,
    name: name.trim(),
    username: normalizeUsername(username),
    email: normalizeEmail(email),
    profilePic: profilePic || avatarUrl(name.trim(), '2B6CB0'),
  })
}

export async function resetPassword({ currentPassword, newPassword }) {
  await delay(400)

  const currentUser = getCurrentFullUser()

  const passwordError = getPasswordStrengthError(newPassword)
  if (passwordError) {
    throw createError(passwordError)
  }

  if (currentUser.password !== currentPassword) {
    throw createError('Current password is incorrect')
  }

  return persistUserUpdate({
    ...currentUser,
    password: newPassword,
  })
}

export async function getUser() {
  await delay(300)

  const token = localStorage.getItem(TOKEN_KEY)
  const stored = localStorage.getItem(USER_KEY)

  if (!token || !stored) {
    const error = new Error('Unauthorized')
    error.response = { status: 401, data: { error: 'Unauthorized or token expired' } }
    throw error
  }

  return JSON.parse(stored)
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  if (!getStoredToken()) return null
  return getCurrentPublicUser()
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

export function updateAdminMember(
  userId,
  { name, username, email, password, role, profilePic },
) {
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

  if (
    targetUser.role === 'admin' &&
    role !== 'admin' &&
    countAdmins(currentUsers) <= 1
  ) {
    throw createError('At least one admin account is required')
  }

  validateUniqueUserFields({
    email,
    username,
    excludedUserId: numericUserId,
  })

  return persistUserUpdate({
    ...targetUser,
    name: name.trim(),
    username: normalizeUsername(username),
    email: normalizeEmail(email),
    password: password || targetUser.password,
    role,
    profilePic: profilePic.trim() || avatarUrl(name.trim(), '2B6CB0'),
  })
}

export function deleteAdminMember(userId) {
  const currentUser = requireAdmin()
  const numericUserId = Number(userId)
  const currentUsers = getAllUsers()
  const targetUser = currentUsers.find((user) => user.id === numericUserId)

  if (!targetUser) {
    throw createError('Member not found', 404)
  }

  if (currentUser.id === numericUserId) {
    throw createError('You cannot delete your own account')
  }

  if (targetUser.role === 'admin' && countAdmins(currentUsers) <= 1) {
    throw createError('At least one admin account is required')
  }

  deleteStoredUser(numericUserId)
}
