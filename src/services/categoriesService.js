import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function fetchCategories() {
  const { data } = await axios.get(`${API_BASE_URL}/api/categories`)
  return data.data
}
