import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { getStatusMeta } from '../utils/postStatus'
import { deleteMyArticle, getMyArticles } from '../services/memberArticleService'

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.error || fallback
}

function StatusLabel({ status }) {
  const meta = getStatusMeta(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium leading-none ${meta.className}`}
    >
      <span
        className={`h-1 w-1 rounded-full ${meta.dotClassName}`}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  )
}

function MyArticlesPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false

    getMyArticles()
      .then((data) => {
        if (!cancelled) setArticles(data)
      })
      .catch((error) => {
        if (!cancelled) setApiError(getErrorMessage(error, 'Unable to load your posts.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setSubmitting(true)
    try {
      await deleteMyArticle(deleteTarget.id)
      setArticles((prev) => prev.filter((article) => article.id !== deleteTarget.id))
      toast.success('Post deleted', {
        description: 'Your post has been removed.',
      })
      setDeleteTarget(null)
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to delete this post.'))
      setDeleteTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-[1000px] flex-1 px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">My posts</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every post you write is reviewed before it goes live.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/my-posts/new')}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Write a post
          </button>
        </div>

        {apiError && (
          <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
            {apiError}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && articles.length === 0 && (
          <div className="rounded-sm border border-border py-16 text-center">
            <p className="text-muted-foreground">You haven&apos;t written any posts yet.</p>
            <button
              type="button"
              onClick={() => navigate('/my-posts/new')}
              className="mt-4 text-sm font-medium underline hover:text-muted-foreground"
            >
              Write your first post
            </button>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li
                key={article.id}
                className="rounded-sm border border-border bg-background p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <StatusLabel status={article.status} />
                      <span className="text-xs text-muted-foreground">
                        {article.category}
                      </span>
                    </div>
                    {article.status === 'published' ? (
                      <Link
                        to={`/post/${article.id}`}
                        className="font-medium hover:underline"
                      >
                        {article.title}
                      </Link>
                    ) : (
                      <p className="font-medium">{article.title}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {article.description}
                    </p>

                    {article.status === 'rejected' && article.rejectionReason && (
                      <div className="mt-3 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span className="font-medium">Why it wasn&apos;t approved: </span>
                        {article.rejectionReason}
                        <p className="mt-1 text-xs text-red-600">
                          Edit your post and save to send it back for review.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/my-posts/${article.id}/edit`)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${article.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(article)}
                      className="text-muted-foreground hover:text-red-600"
                      aria-label={`Delete ${article.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />

      {deleteTarget && (
        <ConfirmDialog
          title="Delete post"
          message={
            deleteTarget.status === 'published'
              ? 'This post is live. Deleting it also removes its comments and likes. This cannot be undone.'
              : 'Do you want to delete this post?'
          }
          confirmLabel="Delete"
          pendingLabel="Deleting..."
          destructive
          submitting={submitting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}

export default MyArticlesPage
