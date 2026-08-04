import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

export async function fetchComments(postId) {
  try {
    const { data } = await apiClient.get(`/api/posts/${postId}/comments`)
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function createComment(postId, commentText) {
  try {
    const { data } = await apiClient.post(`/api/posts/${postId}/comments`, {
      commentText,
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
