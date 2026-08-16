import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, Eye, Image, Sparkles } from 'lucide-react'
import AiAdviceDialog from './AiAdviceDialog'
import AiDiffDialog from './AiDiffDialog'
import ArticlePreviewDialog from './ArticlePreviewDialog'
import FormSection from './FormSection'
import { checkBeforeSubmit, polishDraft } from '../services/aiService'
import { DESCRIPTION_MAX_LENGTH } from '../utils/articleForm'
import { AI_ICON_HOVER_CLASS, buttonClassName } from '../utils/buttonStyles'

// Form state helpers live in ../utils/articleForm — keeping this file to a
// single component export is what the react-refresh lint rule requires.

const READINESS_STYLES = {
  ready: { label: 'Looks ready', className: 'bg-green-100 text-green-900' },
  needs_work: { label: 'A few things to check', className: 'bg-amber-100 text-amber-900' },
}

// One "AI Assistant" menu instead of a scattered button per feature — admin
// and member both use this component, but only member submissions go through
// review, so `enablePresubmitCheck` is what varies the menu's contents, not
// a role check. Keeps the menu itself role-agnostic and growable: a future
// AI feature is one more conditional item here, not a new button somewhere
// else on the page.
const MENU_ITEM_CLASS =
  'flex w-full items-center gap-2 whitespace-nowrap rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-[#EFEEEB] disabled:cursor-not-allowed disabled:opacity-60'

// Shared between the admin editor and the member submission form. Deliberately
// has no status control — neither caller lets the author pick a status, and on
// the member side the server forces `pending` anyway.
function ArticleForm({
  form,
  errors = {},
  categories = [],
  authorName,
  authorBio = '',
  authorAvatar,
  uploading = false,
  uploadingDetailImage = false,
  onChange,
  onImageUpload,
  onDetailImageUpload,
  onAuthorBioChange,
  enablePresubmitCheck = false,
  // The author the *preview* should show. Defaults to the person filling the
  // form, which is right on the member side, but an admin editing someone
  // else's post would otherwise see their own name, avatar and bio on a
  // screen that promises "this is how the article will look". The editable
  // bio field above stays tied to the current user either way — it saves to
  // their own profile.
  previewAuthor,
  footer,
  actions,
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [aiMenuOpen, setAiMenuOpen] = useState(false)
  const [polishing, setPolishing] = useState(false)
  const [checkingSubmit, setCheckingSubmit] = useState(false)
  // Held here rather than applied directly — the author confirms in the dialog
  // before anything replaces what they wrote.
  const [suggestion, setSuggestion] = useState(null)
  // What was actually sent to the model. The diff has to compare against this
  // rather than live form state: the fields stay editable while the request is
  // in flight, and diffing a snapshot-based suggestion against a form the
  // author kept typing into would render their new text as a red "removal"
  // the assistant never proposed.
  const [suggestionBase, setSuggestionBase] = useState(null)
  const [presubmitResult, setPresubmitResult] = useState(null)
  const aiMenuRef = useRef(null)
  // Closing the menu doesn't cancel the request behind it, so without this both
  // actions could be started and resolve into two stacked z-50 dialogs.
  const aiBusy = polishing || checkingSubmit

  useEffect(() => {
    function handleClickOutside(event) {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target)) {
        setAiMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handlePolish() {
    setAiMenuOpen(false)
    if (!form.content.trim()) {
      toast.error('Write your article first, then the assistant can tidy it up.')
      return
    }

    setPolishing(true)
    const sent = {
      content: form.content,
      title: form.title,
      description: form.description,
    }
    try {
      const result = await polishDraft(sent)
      // Clamped here rather than on accept, so the diff shows exactly what
      // will land in the form. Truncating after the author approved the full
      // text would apply something they never saw, cut mid-word.
      setSuggestion({
        ...result,
        description: result.description.slice(0, DESCRIPTION_MAX_LENGTH),
      })
      setSuggestionBase(sent)
    } catch (error) {
      toast.error(error.message || 'The writing assistant is unavailable.')
    } finally {
      setPolishing(false)
    }
  }

  function dismissSuggestion() {
    setSuggestion(null)
    setSuggestionBase(null)
  }

  function acceptSuggestion() {
    // Already clamped in handlePolish, so what's applied is what was shown.
    onChange('title', suggestion.title)
    onChange('description', suggestion.description)
    onChange('content', suggestion.content)
    dismissSuggestion()
    toast.success('Suggested edit applied.')
  }

  async function handleCheckBeforeSubmit() {
    setAiMenuOpen(false)
    if (!form.content.trim()) {
      toast.error('Write your article first, then the assistant can check it.')
      return
    }

    setCheckingSubmit(true)
    try {
      setPresubmitResult(
        await checkBeforeSubmit({
          content: form.content,
          title: form.title,
          artist: form.artist,
          bestPick: form.bestPick,
          description: form.description,
        }),
      )
    } catch (error) {
      toast.error(error.message || 'The writing assistant is unavailable.')
    } finally {
      setCheckingSubmit(false)
    }
  }

  return (
    <div className="space-y-8">
      <FormSection
        title="Cover image"
        description="The banner at the top of the article, and its thumbnail on the homepage and article cards. One per article."
      >
        <div className="flex flex-col gap-4">
          <div className="flex aspect-[1.65/1] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-md bg-[#EFEEEB]">
            {form.image ? (
              <img
                src={form.image}
                alt="Thumbnail preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <label className={buttonClassName('secondary', 'w-fit cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60')}>
            {uploading ? 'Uploading...' : 'Upload cover image'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={onImageUpload}
            />
          </label>
        </div>
        {errors.image && (
          <span className="block text-xs text-red-500">{errors.image}</span>
        )}
      </FormSection>

      <div className="border-t border-border" />

      <FormSection
        title="Wallpaper image"
        description="The full-width banner shown at the top of the article page. Optional — falls back to the cover image above if left empty."
      >
        <div className="flex flex-col gap-4">
          <div className="flex aspect-[1.65/1] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-md bg-[#EFEEEB]">
            {form.detailImage ? (
              <img
                src={form.detailImage}
                alt="Wallpaper preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <Image className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <label className={buttonClassName('secondary', 'w-fit cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60')}>
            {uploadingDetailImage ? 'Uploading...' : 'Upload wallpaper image'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingDetailImage}
              onChange={onDetailImageUpload}
            />
          </label>
        </div>
        {errors.detailImage && (
          <span className="block text-xs text-red-500">{errors.detailImage}</span>
        )}
      </FormSection>

      <div className="border-t border-border" />

      <FormSection
        title="Song details"
        description="The artist and track this article is about."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Category
            </span>
            <div className="relative w-full">
              <select
                value={form.category}
                onChange={(event) => onChange('category', event.target.value)}
                className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            {errors.category && (
              <span className="text-xs text-red-500">{errors.category}</span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Artist
            </span>
            <input
              value={form.artist}
              onChange={(event) => onChange('artist', event.target.value)}
              className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
              placeholder="e.g. Billie Eilish"
            />
            {errors.artist && (
              <span className="text-xs text-red-500">{errors.artist}</span>
            )}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Best pick (song title)
            </span>
            <input
              value={form.bestPick}
              onChange={(event) => onChange('bestPick', event.target.value)}
              className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
              placeholder="The one song you keep coming back to"
            />
            {errors.bestPick && (
              <span className="text-xs text-red-500">{errors.bestPick}</span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Spotify URL (optional)
            </span>
            <input
              value={form.spotifyUrl}
              onChange={(event) => onChange('spotifyUrl', event.target.value)}
              className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
              placeholder="https://open.spotify.com/track/..."
            />
            {errors.spotifyUrl && (
              <span className="text-xs text-red-500">{errors.spotifyUrl}</span>
            )}
          </label>
        </div>

        <label className="flex flex-col gap-2 sm:w-1/2 sm:pr-2">
          <span className="text-sm font-medium text-muted-foreground">
            Author name
          </span>
          <input
            value={authorName || ''}
            disabled
            className="h-10 w-full rounded-sm border border-transparent bg-[#FAFAF9] px-3 text-sm text-muted-foreground"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Your bio
          </span>
          <textarea
            value={authorBio}
            onChange={(event) => onAuthorBioChange?.(event.target.value)}
            className="min-h-24 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            placeholder="Tell readers what you write about. Leave a blank line between paragraphs."
          />
          <span className="text-xs text-muted-foreground">
            Saved to your profile and shown on your articles' author card.
            Editing it here won't change posts you've already published —
            only new ones snapshot it.
          </span>
        </label>
      </FormSection>

      <div className="border-t border-border" />

      <FormSection
        title="Article content"
        description="The title, introduction, and full write-up readers will see."
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">Title</span>
          <input
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            placeholder="Article title"
          />
          {errors.title && (
            <span className="text-xs text-red-500">{errors.title}</span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Introduction (max {DESCRIPTION_MAX_LENGTH} letters)
          </span>
          <textarea
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            className="min-h-28 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="Introduction"
          />
          {errors.description && (
            <span className="text-xs text-red-500">{errors.description}</span>
          )}
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="article-content"
              className="text-sm font-medium text-muted-foreground"
            >
              Content
            </label>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              // Both overlays are fixed inset-0 z-50 siblings, so a suggestion
              // arriving while the preview is open would render completely
              // hidden behind it — and one Escape press reaches both document
              // listeners, discarding a paid-for result the author never saw.
              disabled={aiBusy}
              className="inline-flex items-center gap-1.5 rounded-md border border-foreground px-3 py-1 text-xs font-medium hover:border-muted-foreground hover:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              Preview
            </button>
          </div>
          <textarea
            id="article-content"
            value={form.content}
            onChange={(event) => onChange('content', event.target.value)}
            className="min-h-[420px] w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            placeholder="Content"
          />
          {errors.content && (
            <span className="text-xs text-red-500">{errors.content}</span>
          )}
        </div>
      </FormSection>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative w-fit" ref={aiMenuRef}>
          <button
            type="button"
            onClick={() => setAiMenuOpen((open) => !open)}
            // Both handlers close the menu first, which unmounts the menu
            // items carrying the loading labels — so without a busy state
            // here, a multi-second model call looked like a dead click.
            disabled={aiBusy}
            className={buttonClassName('ai')}
            aria-haspopup="menu"
            aria-expanded={aiMenuOpen}
            aria-busy={aiBusy}
          >
            <Sparkles
              className={`h-4 w-4 ${AI_ICON_HOVER_CLASS} ${aiBusy ? 'animate-pulse' : ''}`}
              aria-hidden="true"
            />
            {polishing
              ? 'Reading your draft...'
              : checkingSubmit
                ? 'Checking your draft...'
                : 'AI Assistant'}
            {!aiBusy && (
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${aiMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            )}
          </button>

          {aiMenuOpen && (
            <div
              className="absolute bottom-full left-0 z-20 mb-2 w-max min-w-[180px] rounded-md border border-gray-300 bg-white p-1.5 shadow-md"
              role="menu"
            >
              <button
                type="button"
                onClick={handlePolish}
                disabled={aiBusy}
                className={MENU_ITEM_CLASS}
                role="menuitem"
              >
                {polishing ? 'Reading your draft...' : 'Tidy up'}
              </button>
              {enablePresubmitCheck && (
                <button
                  type="button"
                  onClick={handleCheckBeforeSubmit}
                  disabled={aiBusy}
                  className={MENU_ITEM_CLASS}
                  role="menuitem"
                >
                  {checkingSubmit ? 'Checking your draft...' : 'Check before submitting'}
                </button>
              )}
            </div>
          )}
        </div>

        {actions}
      </div>

      {footer}

      {suggestion && suggestionBase && (
        <AiDiffDialog
          original={suggestionBase}
          suggestion={suggestion}
          notes={suggestion.notes}
          // Detects edits made while the request was in flight — accepting
          // replaces all three fields wholesale, so those edits would go.
          staleEdits={
            form.title !== suggestionBase.title ||
            form.description !== suggestionBase.description ||
            form.content !== suggestionBase.content
          }
          onCancel={dismissSuggestion}
          onAccept={acceptSuggestion}
        />
      )}

      {/* Gated on the AI dialogs rather than just aiBusy: once a suggestion
          has arrived aiBusy is false again, and AiDiffDialog has no focus
          trap, so Tab could reach the Preview button behind it and stack a
          second fixed-inset-0 z-50 overlay on top. One Escape then reaches
          both document listeners and discards the unaccepted suggestion. */}
      {previewOpen && !suggestion && !presubmitResult && (
        <ArticlePreviewDialog
          form={form}
          // Branching on previewAuthor itself, not ??-ing each field: a member
          // with no profile picture has authorAvatar null, and ?? would fall
          // through to the *admin's* avatar — putting the admin's photo beside
          // the member's name, the exact mixing previewAuthor exists to stop.
          authorName={previewAuthor ? previewAuthor.name : authorName}
          authorBio={previewAuthor ? previewAuthor.bio : authorBio}
          authorAvatar={previewAuthor ? previewAuthor.avatar : authorAvatar}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {presubmitResult && (
        <AiAdviceDialog
          title="Before you submit"
          description="This is a courtesy check, not the real review — an admin still looks at every post regardless of what's below."
          badge={READINESS_STYLES[presubmitResult.readiness]}
          sections={[
            {
              heading: 'Readiness notes',
              items: presubmitResult.concerns,
              emptyText: 'Nothing stood out.',
            },
            {
              heading: 'What works',
              items: presubmitResult.strengths,
              emptyText: 'Nothing specific stood out — that\'s not a bad sign, just nothing to call out.',
            },
            {
              heading: 'Worth a second look',
              items: presubmitResult.suggestions,
              emptyText: 'No notes here — this part reads clearly as is.',
            },
          ]}
          onClose={() => setPresubmitResult(null)}
        />
      )}
    </div>
  )
}

export default ArticleForm
