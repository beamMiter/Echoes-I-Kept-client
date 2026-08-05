import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

// A member's own posts (also reachable by admins, who get more freedom
// server-side — see the moderation section in the server's CLAUDE.md). A
// non-admin can only ever save as 'draft' or submit as 'pending' — the
// server ignores any other status they send. An admin's status is trusted
// as-is.
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

// `status` here is whatever the caller decided should happen — for a
// non-admin it's their explicit draft-or-submit choice (the server allows
// exactly those two for a non-admin and forces anything else to 'pending');
// for an admin using this simpler member-style form, the caller passes
// their post's current status to leave it unchanged, since this form has
// no full status control the way the admin editor does.
export async function submitArticle(form, status = 'pending') {
  try {
    const { data } = await apiClient.post('/api/posts', {
      category: form.category,
      image: form.image,
      detailImage: form.detailImage || null,
      title: form.title,
      description: form.description,
      content: form.content,
      artist: form.artist,
      bestPick: form.bestPick,
      spotifyUrl: form.spotifyUrl || null,
      status,
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function updateMyArticle(id, form, status) {
  try {
    const { data } = await apiClient.put(`/api/posts/${id}`, {
      category: form.category,
      image: form.image,
      detailImage: form.detailImage || null,
      title: form.title,
      description: form.description,
      content: form.content,
      artist: form.artist,
      bestPick: form.bestPick,
      spotifyUrl: form.spotifyUrl || null,
      status: status || 'pending',
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
