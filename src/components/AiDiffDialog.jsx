import { diffLines, diffWords } from 'diff'
import { Sparkles, X } from 'lucide-react'
import { buttonClassName } from '../utils/buttonStyles'

// Renders a before/after comparison inline, in one pass — added text on a
// green background, removed text struck through on red, everything else
// plain. "lines" mode is for multi-paragraph content (a changed paragraph
// reads as one block); "words" mode is for short single-line fields, where
// line-diffing would just report "the whole line changed" and hide exactly
// which word did.
function DiffText({ before, after, mode }) {
  const parts = mode === 'lines' ? diffLines(before, after) : diffWords(before, after)

  return parts.map((part, index) => {
    if (part.added) {
      return (
        <span key={index} className="bg-green-100 text-green-900">
          {part.value}
        </span>
      )
    }
    if (part.removed) {
      return (
        <span key={index} className="bg-red-100 text-red-900 line-through">
          {part.value}
        </span>
      )
    }
    return <span key={index}>{part.value}</span>
  })
}

function DiffField({ label, before, after, mode }) {
  const unchanged = before.trim() === after.trim()

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{label}</h3>
      {unchanged ? (
        <p className="rounded-sm border border-input px-3 py-3 text-sm text-muted-foreground">
          No changes.
        </p>
      ) : (
        <div className="whitespace-pre-wrap break-words rounded-sm border border-input px-3 py-3 font-sans text-sm leading-relaxed">
          <DiffText before={before} after={after} mode={mode} />
        </div>
      )}
    </section>
  )
}

// Shows the assistant's suggestion inline against what the author already
// wrote, so accepting is a deliberate act. The editor is never overwritten
// silently.
function AiDiffDialog({ original, suggestion, notes = [], onCancel, onAccept }) {
  const unchanged =
    original.title.trim() === suggestion.title.trim() &&
    original.description.trim() === suggestion.description.trim() &&
    original.content.trim() === suggestion.content.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="relative flex max-h-full w-full max-w-3xl flex-col rounded-md bg-background px-6 py-6 shadow-lg sm:px-8">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label="Close writing assistant dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          Suggested edit
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {unchanged
            ? 'Your form came back unchanged — it already reads cleanly.'
            : 'Only wording and formatting were touched. Nothing was added to what you wrote.'}
        </p>

        {notes.length > 0 && (
          <ul className="mt-4 list-inside list-disc space-y-1 rounded-sm bg-[#F5F4F2] px-4 py-3 text-sm text-muted-foreground">
            {notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        )}

        <div className="mt-5 min-h-0 flex-1 space-y-5 overflow-auto">
          <DiffField
            label="Title"
            before={original.title}
            after={suggestion.title}
            mode="words"
          />
          <DiffField
            label="Introduction"
            before={original.description}
            after={suggestion.description}
            mode="words"
          />
          <DiffField
            label="Content"
            before={original.content}
            after={suggestion.content}
            mode="lines"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={buttonClassName('secondary')}
          >
            Keep mine
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={unchanged}
            className={buttonClassName('primary')}
          >
            Use suggestion
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiDiffDialog
