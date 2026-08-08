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
  // Tracks whether our entry is still on the stack, so it gets popped exactly
  // once. StrictMode runs this effect mount → cleanup → mount in development,
  // which would otherwise push twice and pop once, stranding a dead entry that
  // makes both browser Back and the form's Cancel (navigate(-1)) need two
  // presses to leave the page.
  const pushedEntry = useRef(false)

  useEffect(() => {
    window.history.pushState({ articlePreview: true }, '')
    pushedEntry.current = true

    const handlePopState = () => {
      // The browser already popped our entry to get here — don't pop again.
      pushedEntry.current = false
      onClose()
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (pushedEntry.current) {
        pushedEntry.current = false
        window.history.back()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    // Unmounting runs the cleanup above, which pops the entry we pushed — so
    // this only has to close, or the stack would rewind one step too far.
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-8">
        <span className="text-sm font-medium text-muted-foreground">
          Preview — this is how the article will look, not saved
        </span>
        <button
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
        heroImagePosition={form.detailImagePosition}
        authorName={authorName}
        authorBio={bioParagraphs}
        authorAvatar={authorAvatar}
        placeholder
      />
    </div>
  )
}

export default ArticlePreviewDialog
