import { apiClient } from './apiClient'

export async function fetchCategories() {
  const { data } = await apiClient.get('/api/categories')
  return data.data
}
