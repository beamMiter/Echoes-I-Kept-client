import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ArticleContent from './ArticleContent'
import { bioTextToParagraphs } from '../utils/bio'

// Renders through the same ArticleContent used by PostDetailPage, so
// "Preview" can't drift from what a reader will actually see. Deliberately
// leaves out Navbar/Footer/comments/likes — those aren't part of what the
// author is checking, and the post doesn't exist yet to attach them to.
function ArticlePreviewDialog({ form, authorName, authorBio, authorAvatar, onClose }) {
  // This overlay covers the whole screen, so it reads as "a new page" — the
  // instinct is to hit the browser's physical Back button, not the X. Without
  // a history entry of its own, that Back press falls through to the app's
  // real previous route and unmounts the form entirely, losing the draft.
  // Pushing a dummy entry on open makes Back just close the preview instead.
  // Tracks whether our entry is on the stack so it's pushed once and popped
  // once. StrictMode runs this effect mount → cleanup → mount in development,
  // and the guard is on the *push* rather than the cleanup deliberately:
  // history.back() is asynchronous while StrictMode's remount is synchronous,
  // so popping in cleanup would queue a traversal that lands after the second
  // pushState and fires popstate into the newly attached listener — closing
  // the preview the moment it opens. Skipping the duplicate push has no such
  // race. The ref survives the simulated remount (same fiber), which is what
  // makes the guard work.
  const pushedEntry = useRef(false)
  const overlayRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!pushedEntry.current) {
      window.history.pushState({ articlePreview: true }, '')
      pushedEntry.current = true
    }

    const handlePopState = () => {
      // The browser consumed our entry to get here, so there's nothing left
      // to pop — just close.
      pushedEntry.current = false
      onClose()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // This overlay isn't portaled, so the form is still in the tab order behind
  // it. Without containment, Tab reaches "Submit for review" and "Cancel" —
  // and Cancel is navigate(-1), which would pop the preview's own history
  // entry and look like nothing happened. Escape closes properly for the same
  // reason: every exit should route through handleClose.
  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = overlayRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      // Wrap at both ends, and pull focus back in if it has already escaped.
      if (event.shiftKey && (active === first || !overlayRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !overlayRef.current.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    // Consume our own entry so a later Back doesn't land on it after the
    // preview is already gone. popstate then fires and calls onClose too;
    // closing twice is a no-op.
    if (pushedEntry.current) {
      pushedEntry.current = false
      window.history.back()
    }
    onClose()
  }

  const heroImage = form.detailImage || form.image || ''
  const bioParagraphs = bioTextToParagraphs(authorBio || '')
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Article preview"
      className="fixed inset-0 z-50 overflow-y-auto bg-background"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-8">
        <span className="text-sm font-medium text-muted-foreground">
          Preview — this is how the article will look, not saved
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <ArticleContent
        category={form.category}
        dateLabel={today}
        title={form.title}
        description={form.description}
        content={form.content}
        heroImage={heroImage}
        heroImagePosition={form.detailImagePosition || 'center'}
        authorName={authorName}
        authorBio={bioParagraphs}
        authorAvatar={authorAvatar}
        placeholder
      />
    </div>
  )
}

export default ArticlePreviewDialog
