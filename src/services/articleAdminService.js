import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

export async function getAdminArticles() {
  try {
    const { data } = await apiClient.get('/api/posts', {
      params: { status: 'all', limit: 50 },
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function createAdminArticle(form, status) {
  try {
    const { data } = await apiClient.post('/api/posts', {
      category: form.category,
      image: form.image,
      detailImage: form.detailImage || null,
      // Omitted when empty so the server default applies; sending it back
      // preserves the stored crop, which is otherwise reset to "center" on
      // every save because updatePostSchema defaults it.
      ...(form.detailImagePosition
        ? { detailImagePosition: form.detailImagePosition }
        : {}),
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

export async function updateAdminArticle(article, form, status) {
  try {
    const { data } = await apiClient.put(`/api/posts/${article.id}`, {
      category: form.category,
      image: form.image,
      detailImage: form.detailImage || null,
      // Omitted when empty so the server default applies; sending it back
      // preserves the stored crop, which is otherwise reset to "center" on
      // every save because updatePostSchema defaults it.
      ...(form.detailImagePosition
        ? { detailImagePosition: form.detailImagePosition }
        : {}),
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

export async function getPendingArticles() {
  try {
    const { data } = await apiClient.get('/api/posts', {
      params: { status: 'pending', limit: 50 },
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function approveArticle(id) {
  try {
    const { data } = await apiClient.put(`/api/posts/${id}/approve`)
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function rejectArticle(id, reason) {
  try {
    const { data } = await apiClient.put(`/api/posts/${id}/reject`, { reason })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function deleteAdminArticle(id) {
  try {
    await apiClient.delete(`/api/posts/${id}`)
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function uploadArticleImage(file) {
  try {
    const formData = new FormData()
    formData.append('image', file)
    // Don't set Content-Type manually — the browser needs to generate it
    // itself (with the multipart boundary) when given a FormData body.
    // Setting it explicitly here would strip the boundary and multer
    // would fail to parse the request.
    const { data } = await apiClient.post('/api/uploads', formData)
    return data.data.url
  } catch (error) {
    throw normalizeApiError(error)
  }
}
