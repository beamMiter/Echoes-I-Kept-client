import { mockCommentsByPostId, mockPosts } from '../data/mockPosts'
import { getMockUserById } from '../data/mockUsers'

const STORAGE_PREFIX = 'notifications'
const STORAGE_VERSION = '2'
const LEGACY_STORAGE_KEY = 'adminNotifications'
const LEGACY_VERSION_KEY = 'adminNotificationsVersion'
const UPDATED_EVENT = 'notifications:updated'

function getPost(postId) {
  return mockPosts.find((post) => post.id === postId) || null
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`
}

function getVersionKey(userId) {
  return `${STORAGE_PREFIX}:version:${userId}`
}

function parseStoredNotifications(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(stored) ? stored : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function getAdminNotifications() {
  const post = getPost(2)
  const comment = mockCommentsByPostId[2]?.[0]
  const commenter = getMockUserById(comment?.userId)

  return [
    {
      id: `comment-2-${comment?.id}`,
      type: 'comment',
      status: 'unread',
      actorName: commenter?.name || comment?.name || 'Reader',
      actorAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      action: 'Commented on your article:',
      message: comment?.comment_text || '',
      articleId: post?.id || 2,
      articleTitle: post?.title || 'Article',
      createdAt: hoursAgo(4),
    },
    {
      id: `like-2-${commenter?.id || 'reader'}`,
      type: 'like',
      status: 'unread',
      actorName: commenter?.name || 'Reader',
      actorAvatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      action: 'liked your article:',
      message: '',
      articleId: post?.id || 2,
      articleTitle: post?.title || 'Article',
      createdAt: hoursAgo(4),
    },
  ]
}

function getMemberNotifications() {
  const post = getPost(2)
  const author = getMockUserById(post?.authorId)
  const commenter = getMockUserById(3)

  return [
    {
      id: `published-${post?.id || 2}`,
      type: 'published',
      status: 'unread',
      actorName: author?.name || 'Techin B.',
      actorAvatar: author?.profilePic || '/avatars/anime.jpg',
      action: 'Published a new article:',
      message: '',
      articleId: post?.id || 2,
      articleTitle: post?.title || 'Article',
      createdAt: hoursAgo(9),
    },
    {
      id: `thread-comment-${post?.id || 2}-${commenter?.id || 'reader'}`,
      type: 'thread-comment',
      status: 'unread',
      actorName: commenter?.name || 'Reader',
      actorAvatar: commenter?.profilePic || '/author-image.jpeg',
      action: 'Commented on the article you have commented on:',
      message: '',
      articleId: post?.id || 2,
      articleTitle: post?.title || 'Article',
      createdAt: hoursAgo(12),
    },
  ]
}

function getInitialNotifications(user) {
  return user.role === 'admin'
    ? getAdminNotifications()
    : getMemberNotifications()
}

function saveNotifications(userId, notifications) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications))
  window.dispatchEvent(
    new CustomEvent(UPDATED_EVENT, { detail: { userId: String(userId) } }),
  )
  return notifications
}

export function getNotifications(user) {
  if (!user?.id) return []

  const storageKey = getStorageKey(user.id)
  const versionKey = getVersionKey(user.id)
  const storedVersion = localStorage.getItem(versionKey)

  if (storedVersion !== STORAGE_VERSION) {
    const notifications = getInitialNotifications(user)
    localStorage.setItem(storageKey, JSON.stringify(notifications))
    localStorage.setItem(versionKey, STORAGE_VERSION)

    if (user.role === 'admin' && Number(user.id) === 2) {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      localStorage.removeItem(LEGACY_VERSION_KEY)
    }

    return notifications
  }

  const stored = parseStoredNotifications(storageKey)
  if (stored) return stored

  const notifications = getInitialNotifications(user)
  localStorage.setItem(storageKey, JSON.stringify(notifications))
  return notifications
}

export function markNotificationAsRead(user, id) {
  if (!user?.id) return []

  const notifications = getNotifications(user).map((notification) =>
    notification.id === id ? { ...notification, status: 'read' } : notification,
  )

  return saveNotifications(user.id, notifications)
}

export function markAllNotificationsAsRead(user) {
  if (!user?.id) return []

  const notifications = getNotifications(user).map((notification) => ({
    ...notification,
    status: 'read',
  }))

  return saveNotifications(user.id, notifications)
}

export function getUnreadNotificationCount(user) {
  return getNotifications(user).filter(
    (notification) => notification.status === 'unread',
  ).length
}

export function subscribeToNotifications(user, listener) {
  if (!user?.id) return () => {}

  const userId = String(user.id)
  const storageKey = getStorageKey(user.id)

  const handleCustomUpdate = (event) => {
    if (event.detail?.userId === userId) listener(getNotifications(user))
  }
  const handleStorageUpdate = (event) => {
    if (event.key === storageKey) listener(getNotifications(user))
  }

  window.addEventListener(UPDATED_EVENT, handleCustomUpdate)
  window.addEventListener('storage', handleStorageUpdate)

  return () => {
    window.removeEventListener(UPDATED_EVENT, handleCustomUpdate)
    window.removeEventListener('storage', handleStorageUpdate)
  }
}
