export function createError(message, status) {
  const error = new Error(message)
  error.response = { status, data: { error: message } }
  return error
}

// Normalizes the real API's `{ error: { code, message } }` shape into the
// flat `{ error: <string> }` shape the rest of the app expects (matching
// what the mock services used to throw).
export function normalizeApiError(error) {
  if (!error.response) return error
  const message = error.response.data?.error?.message || 'Something went wrong'
  return createError(message, error.response.status)
}
