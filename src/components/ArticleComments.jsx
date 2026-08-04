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
  const [error, setError] = useState(false)
  const hasComments = comments.length > 0

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!commentText.trim()) {
      setError(true)
      return
    }

    setError(false)
    const added = onAddComment(commentText.trim())

    if (added === false) return

    setCommentText('')
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
              setError(false)
            }}
            placeholder="What are your thoughts?"
            className={`w-full p-4 h-24 resize-none py-3 rounded-sm border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
              error ? 'border-red-500' : ''
            }`}
          />
          {error && (
            <p className="text-red-500 text-sm absolute">
              Please type something before sending.
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-2 bg-foreground text-white rounded-md hover:bg-muted-foreground transition-colors"
            >
              Send
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
                    src={comment.profile_pic || '/author-image.jpeg'}
                    alt={comment.name || 'Comment author'}
                    draggable={false}
                    className="rounded-full w-12 h-12 object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col items-start justify-between">
                    <h4 className="font-semibold">
                      {comment.name || 'Anonymous'}
                    </h4>
                    {comment.created_at && (
                      <span className="text-sm text-gray-500">
                        {formatCommentDate(comment.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{comment.comment_text}</p>
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
