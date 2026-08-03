import { Link } from 'react-router-dom'
import { NotebookPen } from 'lucide-react'

// Rendered as LatestArticles' `ctaSlot` — a row inside its shared
// rounded bg-[#EFEEEB] box, above the category tabs, separated by a
// divider — rather than its own section, so the homepage reads as one
// continuous block instead of two stacked cards.
//
// Shown to every visitor, logged in or not, admin or member. Logged-out
// visitors get sent through ProtectedRoute's normal /login redirect on
// click, same as any other protected link.
function WriteCta() {
  return (
    <div className="mb-3 flex flex-col items-center justify-between gap-4 border-b border-[#D7D3CE] pb-3 text-center sm:flex-row sm:text-left">
      <div>
        <h2 className="text-base font-semibold leading-snug text-[#171717]">
          Have a song and story of your own?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Write about the artist you keep coming back to, and the one song
          that means the most.
        </p>
      </div>
      <Link
        to="/my-posts/new"
        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
      >
        <NotebookPen className="h-4 w-4" aria-hidden="true" />
        Write a post
      </Link>
    </div>
  )
}

export default WriteCta
