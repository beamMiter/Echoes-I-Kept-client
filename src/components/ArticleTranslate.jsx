import { Loader2 } from 'lucide-react'

const LANGUAGES = [
  { code: 'original', label: 'Original' },
  { code: 'th', label: 'TH' },
  { code: 'en', label: 'EN' },
]

// Pure toggle — PostDetailPage owns which language is active and the
// translated text itself, this just renders the segmented control and a
// loading state for whichever option was just clicked.
//
// TH/EN as matched-length uppercase codes (not "th"/"English") reads as one
// consistent set rather than two different labeling conventions sitting next
// to each other — that mismatch was most of what made the control look
// cluttered. Uppercase also keeps them legible at a small size: a 2-letter
// code reads as an intentional abbreviation, where lowercase could pass for
// a typo.
function ArticleTranslate({ active, loadingLanguage, onSelect }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md border border-[#D9D8D4] bg-white p-0.5 text-sm"
      role="group"
      aria-label="Translate article"
    >
      {LANGUAGES.map(({ code, label }) => {
        const isActive = active === code
        const isLoading = loadingLanguage === code

        return (
          <button
            key={code}
            type="button"
            onClick={() => onSelect(code)}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-medium transition-colors disabled:cursor-wait ${
              isActive
                ? 'bg-foreground text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default ArticleTranslate
