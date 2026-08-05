export function createError(message, status, code) {
  const error = new Error(message)
  error.response = { status, data: { error: message } }
  // Top-level, not inside `response.data` — doesn't disturb the existing
  // `err.response?.data?.error` reads elsewhere, but lets callers that need
  // to branch on a specific server error code (e.g. EMAIL_NOT_VERIFIED) do
  // so without string-matching the message.
  error.code = code
  return error
}

// Normalizes the real API's `{ error: { code, message } }` shape into the
// flat `{ error: <string> }` shape the rest of the app expects (matching
// what the mock services used to throw).
export function normalizeApiError(error) {
  if (!error.response) return error
  const message = error.response.data?.error?.message || 'Something went wrong'
  const code = error.response.data?.error?.code
  return createError(message, error.response.status, code)
}
