import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../context/useAuth'
import {
  getNotifications,
  markNotificationAsRead,
} from '../services/notificationService'

function formatRelativeTime(value) {
  const diffMs = Date.now() - new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function AdminNotificationPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchNotifications = state.user ? getNotifications() : Promise.resolve([])

    fetchNotifications
      .then((data) => {
        if (!cancelled) setNotifications(data)
      })
      .catch(() => {
        if (!cancelled) setNotifications([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [state.user])

  const unreadNotifications = useMemo(
    () =>
      notifications.filter((notification) => notification.status === 'unread'),
    [notifications],
  )

  const viewNotification = (notification) => {
    navigate(`/post/${notification.articleId}`)

    markNotificationAsRead(notification.id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, status: 'read' } : item,
          ),
        )
      })
      .catch(() => {})
  }

  return (
    <AdminLayout title="Notification">
      <div className="w-full">
        {loading ? (
          <p className="py-10 text-muted-foreground">Loading notifications...</p>
        ) : unreadNotifications.length > 0 ? (
          <div className="divide-y divide-border">
            {unreadNotifications.map((notification) => (
              <article
                key={notification.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-6 first:pt-0 sm:gap-x-6 sm:py-8"
              >
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <img
                    src={notification.actorAvatar}
                    alt={notification.actorName}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-6 text-muted-foreground md:text-base">
                      <span className="font-bold text-foreground">
                        {notification.actorName}
                      </span>{' '}
                      {notification.action} {notification.articleTitle}
                      {notification.message && (
                        <>
                          {' '}
                          <span className="text-foreground">
                            “{notification.message}”
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-[#FF9950]">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => viewNotification(notification)}
                  className="justify-self-end pt-1 text-sm font-semibold underline underline-offset-2"
                >
                  View
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-10 text-muted-foreground">
            No unread notifications.
          </p>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminNotificationPage
