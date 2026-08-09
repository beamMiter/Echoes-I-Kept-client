import { apiClient } from './apiClient'
import { normalizeApiError } from './apiError'

// Everything here returns a *suggestion*. Nothing on the server writes to the
// database on behalf of these calls — the author (or admin) reviews the result
// and it reaches the API through the normal post routes, with the normal
// validation. Keep it that way.

// The server constrains the model to a JSON schema and validates with zod, but
// this is still a model's output crossing a network boundary into components
// that index into it (`.length`, `.trim()`, style-map lookups). A missing or
// null field would throw during render, and there's no error boundary on these
// routes — the whole page would blank out, taking an unsaved draft with it.
// So every response is normalized to its expected shape here, once, rather
// than each call site guarding defensively.
function asString(value, fallback = '') {
  if (typeof value === 'string') return value
  // The fallback is a caller-supplied field, so it can be undefined too —
  // returning it unchecked would defeat the point and hand a non-string back
  // to a component that calls .trim() on it.
  return typeof fallback === 'string' ? fallback : ''
}

function asStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

export async function polishDraft({ content, title, description }) {
  try {
    const { data } = await apiClient.post('/api/ai/polish', { content, title, description })
    // Falling back to what was sent is the right reading of an absent field:
    // "the assistant didn't change this one".
    return {
      title: asString(data?.title, title),
      description: asString(data?.description, description),
      content: asString(data?.content, content),
      notes: asStringArray(data?.notes),
    }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

// Must stay in step with READINESS_STYLES in ArticleForm.jsx.
const READINESS_VALUES = ['ready', 'needs_work']

export async function checkBeforeSubmit({ content, title, artist, bestPick, description }) {
  try {
    const { data } = await apiClient.post('/api/ai/presubmit-check', {
      content,
      title,
      artist,
      bestPick,
      description,
    })
    return {
      // Allowlisted the same way as `recommendation` below: the value is a
      // key into READINESS_STYLES, and anything unrecognized would look up
      // undefined and render the dialog with no verdict at all. Unknown
      // means "look at it", never "looks ready".
      readiness: READINESS_VALUES.includes(data?.readiness) ? data.readiness : 'needs_work',
      concerns: asStringArray(data?.concerns),
      strengths: asStringArray(data?.strengths),
      suggestions: asStringArray(data?.suggestions),
    }
  } catch (error) {
    throw normalizeApiError(error)
  }
}

const RECOMMENDATIONS = ['approve', 'review', 'reject']

export async function analyzePost(postId) {
  try {
    const { data } = await apiClient.post('/api/ai/moderate', { postId })
    return {
      // Anything outside the known set becomes 'review' — an unrecognized
      // verdict should send the admin to look, never silently read as
      // "nothing flagged".
      recommendation: RECOMMENDATIONS.includes(data?.recommendation)
        ? data.recommendation
        : 'review',
      concerns: asStringArray(data?.concerns),
      suggestedRejectionReason: asString(data?.suggestedRejectionReason),
      // True when the post was too long to send in full, so the verdict is
      // based on only the opening section.
      truncated: data?.truncated === true,
    }
  } catch (error) {
    throw normalizeApiError(error)
  }
}
