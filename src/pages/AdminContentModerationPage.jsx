import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  approveArticle,
  getPendingArticles,
  rejectArticle,
} from '../services/articleAdminService'
import { analyzePost } from '../services/aiService'
import { AI_ICON_HOVER_CLASS, buttonClassName } from '../utils/buttonStyles'

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.error || fallback
}

const RECOMMENDATION_STYLES = {
  approve: { label: 'Nothing flagged', className: 'bg-green-100 text-green-900' },
  review: { label: 'Worth a closer look', className: 'bg-amber-100 text-amber-900' },
  reject: { label: 'Likely reject', className: 'bg-red-100 text-red-900' },
}

function AdminContentModerationPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  // Advisory analysis, keyed by article id. Nothing here decides anything —
  // approve/reject remain manual clicks against the admin-only post routes.
  const [analyses, setAnalyses] = useState({})
  const [analyzingId, setAnalyzingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    getPendingArticles()
      .then((data) => {
        if (!cancelled) setArticles(data)
      })
      .catch((error) => {
        if (!cancelled) setApiError(getErrorMessage(error, 'Unable to load the review queue.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const removeFromQueue = (id) => {
    setArticles((prev) => prev.filter((article) => article.id !== id))
  }

  const handleAnalyze = async (article) => {
    setAnalyzingId(article.id)
    setApiError('')
    try {
      const result = await analyzePost(article.id)
      setAnalyses((prev) => ({ ...prev, [article.id]: result }))
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to analyze this post.'))
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleApprove = async (article) => {
    setSubmitting(true)
    setApiError('')
    try {
      await approveArticle(article.id)
      removeFromQueue(article.id)
      toast.success('Post approved', {
        description: `"${article.title}" is now live.`,
      })
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to approve this post.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return

    setSubmitting(true)
    setApiError('')
    try {
      await rejectArticle(rejectTarget.id, rejectReason.trim())
      removeFromQueue(rejectTarget.id)
      toast.success('Post rejected', {
        description: 'The author has been notified with your reason.',
      })
      setRejectTarget(null)
      setRejectReason('')
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to reject this post.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout title="Content moderation">
      {apiError && (
        <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
          {apiError}
        </div>
      )}

      <p className="mb-6 text-sm text-muted-foreground">
        Posts submitted by members, waiting for review. Approving publishes the post
        immediately; rejecting sends your reason back to the author so they can revise
        and resubmit.
      </p>

      {loading && (
        <LoadingSpinner />
      )}

      {!loading && articles.length === 0 && (
        <div className="rounded-sm border border-border py-16 text-center">
          <p className="text-muted-foreground">Nothing is waiting for review.</p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <ul className="space-y-4">
          {articles.map((article) => {
            const expanded = expandedId === article.id
            const analysis = analyses[article.id]
            const recommendation = analysis
              ? RECOMMENDATION_STYLES[analysis.recommendation]
              : null

            return (
              <li
                key={article.id}
                className="rounded-sm border border-border bg-background p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{article.category}</span>
                      <span>·</span>
                      <span>by {article.author}</span>
                    </div>
                    <p className="font-medium">{article.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {article.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : article.id)}
                      className="mt-3 text-sm font-medium underline hover:text-muted-foreground"
                    >
                      {expanded ? 'Hide full content' : 'Read full content'}
                    </button>

                    {expanded && (
                      <div className="mt-3 space-y-3">
                        {article.image && (
                          <img
                            src={article.image}
                            alt=""
                            className="h-[200px] w-full max-w-[420px] rounded-sm object-cover"
                          />
                        )}
                        <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap rounded-sm bg-[#F7F6F4] px-4 py-3 text-sm">
                          {article.content}
                        </div>
                      </div>
                    )}

                    {analysis && (
                      <div className="mt-4 rounded-sm border border-border bg-[#FAFAF9] px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${recommendation.className}`}
                          >
                            {recommendation.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            AI suggestion — you still decide
                          </span>
                        </div>

                        {analysis.concerns.length > 0 ? (
                          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                            {analysis.concerns.map((concern, index) => (
                              <li key={index}>{concern}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-muted-foreground">
                            No specific concerns raised.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(article)}
                      disabled={submitting}
                      className={buttonClassName('primary')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectTarget(article)
                        // Pre-fills the reason when the assistant drafted one;
                        // the admin edits it before it reaches the author.
                        setRejectReason(analysis?.suggestedRejectionReason || '')
                      }}
                      disabled={submitting}
                      className={buttonClassName('dangerOutline')}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnalyze(article)}
                      disabled={analyzingId === article.id}
                      className={buttonClassName('ai')}
                    >
                      <Sparkles className={`h-4 w-4 ${AI_ICON_HOVER_CLASS}`} aria-hidden="true" />
                      {analyzingId === article.id
                        ? 'Reading...'
                        : analysis
                          ? 'Re-check'
                          : 'Check with AI'}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {rejectTarget && (
        <ConfirmDialog
          title="Reject post"
          message={`"${rejectTarget.title}" will be sent back to its author with your reason.`}
          confirmLabel="Reject"
          pendingLabel="Rejecting..."
          destructive
          submitting={submitting}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          reasonLabel="Reason (the author will see this)"
          reasonPlaceholder="Explain what needs to change..."
          reasonRequired
          onCancel={() => {
            setRejectTarget(null)
            setRejectReason('')
          }}
          onConfirm={handleReject}
        />
      )}
    </AdminLayout>
  )
}

export default AdminContentModerationPage
