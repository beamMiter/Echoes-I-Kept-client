import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

// A member's own posts. The server forces `status: 'pending'` on every create
// and edit from a non-admin, so no status is ever sent from here — see the
// moderation section in the server's CLAUDE.md.
export async function getMyArticles() {
  try {
    const { data } = await apiClient.get('/api/posts', {
      params: { mine: 'true', status: 'all', limit: 50 },
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function getMyArticleById(id) {
  try {
    const { data } = await apiClient.get(`/api/posts/${id}`)
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function submitArticle(form) {
  try {
    const { data } = await apiClient.post('/api/posts', {
      category: form.category,
      image: form.image,
      title: form.title,
      description: form.description,
      content: form.content,
      artist: form.artist,
      bestPick: form.bestPick,
      spotifyUrl: form.spotifyUrl || null,
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function updateMyArticle(id, form) {
  try {
    const { data } = await apiClient.put(`/api/posts/${id}`, {
      category: form.category,
      image: form.image,
      title: form.title,
      description: form.description,
      content: form.content,
      artist: form.artist,
      bestPick: form.bestPick,
      spotifyUrl: form.spotifyUrl || null,
      // updatePostSchema requires a status, but the server overrides it to
      // 'pending' for non-admins regardless of what's sent.
      status: 'pending',
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function deleteMyArticle(id) {
  try {
    await apiClient.delete(`/api/posts/${id}`)
  } catch (error) {
    throw normalizeApiError(error)
  }
}
