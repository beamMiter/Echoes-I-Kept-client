import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const apiClient = axios.create({ baseURL: API_BASE_URL })

let unauthorizedHandler = null

export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

function isExpired(accessToken) {
  try {
    const { exp } = jwtDecode(accessToken)
    return !exp || exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

let refreshPromise = null

function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(null)

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setTokens(data)
        return data.accessToken
      })
      .catch(() => {
        clearTokens()
        unauthorizedHandler?.()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

apiClient.interceptors.request.use(async (config) => {
  let accessToken = getAccessToken()

  if (accessToken && isExpired(accessToken)) {
    accessToken = await refreshAccessToken()
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)
