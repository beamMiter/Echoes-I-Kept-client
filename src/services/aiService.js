import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

// Everything here returns a *suggestion*. Nothing on the server writes to the
// database on behalf of these calls — the author (or admin) reviews the result
// and it reaches the API through the normal post routes, with the normal
// validation. Keep it that way.

export async function polishDraft({ content, title, description }) {
  try {
    const { data } = await apiClient.post('/api/ai/polish', { content, title, description })
    return data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function checkBeforeSubmit({ content, title, artist, bestPick, description }) {
  try {
    const { data } = await apiClient.post('/api/ai/presubmit-check', {
      content,
      title,
      artist,
      bestPick,
      description,
    })
    return data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function analyzePost(postId) {
  try {
    const { data } = await apiClient.post('/api/ai/moderate', { postId })
    return data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
