import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

export async function getNotifications() {
  try {
    const { data } = await apiClient.get('/api/notifications')
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function markNotificationAsRead(id) {
  try {
    const { data } = await apiClient.put(`/api/notifications/${id}/read`)
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await apiClient.put('/api/notifications/read-all')
  } catch (error) {
    throw normalizeApiError(error)
  }
}
