import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, ChevronDown, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from '../services/notificationService'

function formatNotificationDate(value) {
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

function NotificationItems({ notifications, onOpenArticle }) {
  if (notifications.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-xs text-muted-foreground">
        No unread notifications.
      </p>
    )
  }

  return notifications.map((notification) => (
    <button
      type="button"
      key={notification.id}
      onClick={() => onOpenArticle(notification)}
      className="flex w-full gap-3 rounded-sm px-2 py-2 text-left hover:bg-[#EFEEEB]"
    >
      <img
        src={notification.actorAvatar}
        alt={notification.actorName}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold leading-snug">
          {notification.actorName}{' '}
          <span className="font-normal">
            {notification.action} {notification.articleTitle}
          </span>
        </span>
        {notification.message && (
          <span className="mt-1 block truncate text-xs text-muted-foreground">
            “{notification.message}”
          </span>
        )}
        <span className="mt-1 block text-[10px] text-[#FF9950]">
          {formatNotificationDate(notification.createdAt)}
        </span>
      </span>
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
    </button>
  ))
}

function NotificationBell({ compact = false, onNavigate }) {
  const navigate = useNavigate()
  const { state } = useAuth()
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(() =>
    getNotifications(state.user),
  )
  const isAdmin = state.user?.role === 'admin'

  const unreadNotifications = useMemo(
    () =>
      notifications.filter((notification) => notification.status === 'unread'),
    [notifications],
  )
  const previewNotifications = unreadNotifications.slice(0, 4)

  useEffect(
    () => subscribeToNotifications(state.user, setNotifications),
    [state.user],
  )

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openArticle = (notification) => {
    setNotifications(markNotificationAsRead(state.user, notification.id))
    setOpen(false)
    onNavigate?.()
    navigate(`/post/${notification.articleId}`)
  }

  const markAllAsRead = () => {
    setNotifications(markAllNotificationsAsRead(state.user))
  }

  const openAdminNotifications = () => {
    setOpen(false)
    onNavigate?.()
    navigate('/admin/notification')
  }

  if (compact) {
    return (
      <div ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center rounded-sm px-4 py-2 text-base font-medium text-foreground hover:bg-[#EFEEEB] hover:text-muted-foreground"
          aria-expanded={open}
        >
          <Bell className="mr-4 h-5 w-5" />
          <span>Notification</span>
          {unreadNotifications.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {unreadNotifications.length}
            </span>
          )}
          <ChevronDown
            className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="mt-2 rounded-sm border border-muted bg-background p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">Notification</h2>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadNotifications.length === 0}
                className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/50"
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-[320px] space-y-1 overflow-y-auto">
              <NotificationItems
                notifications={previewNotifications}
                onOpenArticle={openArticle}
              />
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={openAdminNotifications}
                className="mt-2 w-full rounded-sm py-2 text-xs font-semibold hover:bg-[#EFEEEB]"
              >
                View all notifications
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-muted text-foreground hover:bg-[#EFEEEB]"
        aria-label="Open notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadNotifications.length > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-32px)] rounded-sm border border-muted bg-background p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Notification</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadNotifications.length === 0}
                className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground/50"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB]"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] space-y-1 overflow-y-auto">
            <NotificationItems
              notifications={previewNotifications}
              onOpenArticle={openArticle}
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAdminNotifications}
              className="mt-2 w-full rounded-sm py-2 text-xs font-semibold hover:bg-[#EFEEEB]"
            >
              View all notifications
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
