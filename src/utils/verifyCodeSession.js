// Handoff between AuthPage and VerifyCodePage. sessionStorage rather than a
// query string — an email in the URL would leak into browser history and
// Referer headers, but a plain in-memory router state wouldn't survive a
// reload (OTP entry is manual typing, so users do switch tabs/refresh).
const KEY = 'pendingVerification'

export function setPendingVerification({ email, purpose }) {
  sessionStorage.setItem(KEY, JSON.stringify({ email, purpose }))
}

export function getPendingVerification() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

export function clearPendingVerification() {
  sessionStorage.removeItem(KEY)
}
