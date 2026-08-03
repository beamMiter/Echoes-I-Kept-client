import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

export async function getAdminCategories() {
  try {
    const { data } = await apiClient.get('/api/categories')
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function createAdminCategory(form) {
  try {
    const { data } = await apiClient.post('/api/categories', { name: form.name.trim() })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function updateAdminCategory(category, form) {
  try {
    const { data } = await apiClient.put(`/api/categories/${category.id}`, {
      name: form.name.trim(),
    })
    return data.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function deleteAdminCategory(id) {
  try {
    await apiClient.delete(`/api/categories/${id}`)
  } catch (error) {
    throw normalizeApiError(error)
  }
}
