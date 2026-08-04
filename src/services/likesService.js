import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

export async function likePost(postId) {
  try {
    const { data } = await apiClient.post(`/api/posts/${postId}/likes`)
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function unlikePost(postId) {
  try {
    const { data } = await apiClient.delete(`/api/posts/${postId}/likes`)
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
