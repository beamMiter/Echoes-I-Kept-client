import { Loader2 } from 'lucide-react'

const LANGUAGES = [
  { code: 'original', label: 'Original' },
  { code: 'th', label: 'th' },
  { code: 'en', label: 'English' },
]

// Pure toggle — PostDetailPage owns which language is active and the
// translated text itself, this just renders the pill group and a loading
// state for whichever option was just clicked.
function ArticleTranslate({ active, loadingLanguage, onSelect }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-md border border-[#D9D8D4] bg-white p-1 text-xs"
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
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default ArticleTranslate
