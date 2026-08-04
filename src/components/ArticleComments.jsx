import { useState } from 'react'

function formatCommentDate(dateString) {
  if (!dateString) return ''

  return new Date(dateString)
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(', ', ' at ')
}

function ArticleComments({ comments = [], onAddComment }) {
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const hasComments = comments.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!commentText.trim()) {
      setError('Please type something before sending.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const added = await onAddComment(commentText.trim())
      if (added === false) return

      setCommentText('')
    } catch {
      setError('Unable to post your comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="space-y-4 px-4 mb-16">
        <h3 className="text-lg font-semibold">Comment</h3>

        <form className="space-y-2 relative" onSubmit={handleSubmit}>
          <textarea
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value)
              setError('')
            }}
            placeholder="What are your thoughts?"
            className={`w-full p-4 h-24 resize-none py-3 rounded-sm border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
              error ? 'border-red-500' : ''
            }`}
          />
          {error && (
            <p className="text-red-500 text-sm absolute">{error}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2 bg-foreground text-white rounded-md hover:bg-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6 px-4">
        {hasComments ? (
          comments.map((comment, index) => (
            <div key={comment.id || index} className="flex flex-col gap-2 mb-4">
              <div className="flex space-x-4">
                <div className="shrink-0">
                  <img
                    src={comment.authorAvatar || '/author-image.jpeg'}
                    alt={comment.authorName || 'Comment author'}
                    draggable={false}
                    className="rounded-full w-12 h-12 object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col items-start justify-between">
                    <h4 className="font-semibold">
                      {comment.authorName || 'Anonymous'}
                    </h4>
                    {comment.createdAt && (
                      <span className="text-sm text-gray-500">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{comment.commentText}</p>
              {index < comments.length - 1 && (
                <hr className="border-gray-300 my-4" />
              )}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            Be the first to share your thoughts.
          </p>
        )}
      </div>
    </div>
  )
}

export default ArticleComments
