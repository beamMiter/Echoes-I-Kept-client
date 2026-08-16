// Handoff between AuthPage and VerifyCodePage. Not a query string — an email
// in the URL would leak into browser history and Referer headers, and not a
// plain in-memory router state either — that wouldn't survive a reload (OTP
// entry is manual typing, so users do switch tabs/refresh).
//
// localStorage rather than sessionStorage: the email's "Enter code" button
// links to this same page, and email clients almost always open links in a
// new tab — sessionStorage is scoped per-tab and wouldn't be there, so the
// page would find no pending state and bounce to /login even on the exact
// device/browser that just signed up. localStorage is per-origin, so it's
// visible from that new tab too. It's still cleared as soon as verification
// succeeds (see clearPendingVerification), so it doesn't linger.
const KEY = 'pendingVerification'

export function setPendingVerification({ email, purpose }) {
  localStorage.setItem(KEY, JSON.stringify({ email, purpose }))
}

export function getPendingVerification() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

export function clearPendingVerification() {
  localStorage.removeItem(KEY)
}
