import { Link } from 'react-router-dom'
import { NotebookPen } from 'lucide-react'
import { useAuth } from '../context/useAuth'

// Logged-out visitors still see this — clicking it sends them through
// ProtectedRoute's redirect to /login, same as any other protected link.
// Hidden for admins, who manage posts through the admin panel instead
// (matches Navbar/AccountLayout, which hide "My posts" the same way).
function WriteCta() {
  const { state } = useAuth()
  if (state.user?.role === 'admin') return null

  return (
    // Same outer width/padding as LatestArticles' <section>, and the same
    // rounded bg-[#EFEEEB] bar treatment as its header — this sits directly
    // above that component and is meant to read as part of the same block,
    // not a visually distinct card.
    <section className="mx-auto w-full max-w-[1040px] px-4 sm:px-6 lg:px-0">
      <div className="mb-10 flex flex-col items-center justify-between gap-5 rounded-[4px] bg-[#EFEEEB] px-4 py-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <div>
          <h2 className="font-display text-lg font-medium leading-none text-[#171717]">
            Have a song and story of your own?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Write about the artist you keep coming back to, and the one song
            that means the most.
          </p>
        </div>
        <Link
          to="/my-posts/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
        >
          <NotebookPen className="h-4 w-4" aria-hidden="true" />
          Write a post
        </Link>
      </div>
    </section>
  )
}

export default WriteCta
