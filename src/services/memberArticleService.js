import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

// A member's own posts (also reachable by admins, who get more freedom
// server-side — see the moderation section in the server's CLAUDE.md).
// Every post starts pending on create, whoever creates it; the server
// forces edits by a non-admin back to pending too, regardless of what's
// sent — see updateMyArticle for the one case that does matter.
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

// `currentStatus` is the post's status before this edit. For a non-admin
// author this is irrelevant — the server always forces the post back to
// 'pending' on any edit, regardless of what's sent. But this same function
// is also reachable by an admin editing their own post through this simpler
// member-style form (as opposed to the admin editor, which has an explicit
// status control) — for them the server trusts the payload's status as-is,
// so sending a hardcoded 'pending' here would silently revert their post's
// status on every save. Passing the post's current status keeps this a
// no-op for admins using this form, while still doing nothing different for
// members (whose value gets overridden either way).
export async function updateMyArticle(id, form, currentStatus) {
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
      status: currentStatus || 'pending',
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
