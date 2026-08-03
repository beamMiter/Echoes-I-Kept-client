import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function fetchPublishedPosts({ page = 1, limit = 6, category, search } = {}) {
  const params = { page, limit, status: 'published' }
  if (category && category !== 'Highlight') params.category = category
  if (search) params.search = search

  const { data } = await axios.get(`${API_BASE_URL}/api/posts`, { params })

  return {
    posts: data.data,
    currentPage: data.pagination.page,
    totalPages: data.pagination.totalPages,
  }
}

export async function fetchPublishedPostById(id) {
  const { data } = await axios.get(`${API_BASE_URL}/api/posts/${id}`)
  return data.data
}
