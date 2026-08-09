import { useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { buttonClassName } from '../utils/buttonStyles'

// Read-only advisory dialog shared by "Get feedback" and "Check before
// submitting" — both return notes for the author to act on themselves,
// never a replacement for the text, so there's nothing here to accept.
function AiAdviceDialog({ title, description, badge, sections, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
    >
      <div className="relative flex max-h-full w-full max-w-2xl flex-col rounded-md bg-background px-6 py-6 shadow-lg sm:px-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label={`Close ${title.toLowerCase()} dialog`}
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          {title}
        </h2>

        {badge && (
          <span
            className={`mt-3 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        )}

        {description && (
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        )}

        {/* min-h-0 is redundant — overflow-auto already zeroes a flex item's
            automatic minimum size — but it's stated explicitly here to match
            AiDiffDialog and to keep the scroll behaviour from looking
            accidental. */}
        <div className="mt-5 min-h-0 flex-1 space-y-5 overflow-auto">
          {sections.map((section) => {
            // A caller passing no items at all should land on emptyText, which
            // is the whole point of that prop — not throw on `.length`.
            const items = Array.isArray(section.items) ? section.items : []

            return (
              <div key={section.heading}>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  {section.heading}
                </h3>
                {items.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1.5 rounded-sm bg-[#F5F4F2] px-4 py-3 text-sm leading-relaxed">
                    {items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">{section.emptyText}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className={buttonClassName('primary')}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiAdviceDialog
