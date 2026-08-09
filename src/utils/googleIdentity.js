const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let scriptPromise = null

// Injects the Google Identity Services script once and caches the promise,
// so every caller (login page, signup page — GoogleAuthButton mounts on
// both) shares the same load instead of racing duplicate <script> tags.
export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      // Let a later call retry (a transient network blip shouldn't wedge the
      // button forever behind one failed load).
      scriptPromise = null
      reject(new Error('Failed to load Google Identity Services'))
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}
