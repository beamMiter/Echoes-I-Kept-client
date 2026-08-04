import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Check, ChevronDown, Copy, Eye, Image, PenLine } from 'lucide-react'
import FormSection from './FormSection'
import { buttonClassName } from '../utils/buttonStyles'

// Form state helpers live in ../utils/articleForm — keeping this file to a
// single component export is what the react-refresh lint rule requires.

// Shared between the admin editor and the member submission form. Deliberately
// has no status control — neither caller lets the author pick a status, and on
// the member side the server forces `pending` anyway.
function ArticleForm({
  form,
  errors = {},
  categories = [],
  authorName,
  uploading = false,
  onChange,
  onImageUpload,
  onUploadContentImage,
  footer,
}) {
  const [previewingContent, setPreviewingContent] = useState(false)
  const [contentImageUrl, setContentImageUrl] = useState(null)
  const [uploadingContentImage, setUploadingContentImage] = useState(false)
  const [snippetCopied, setSnippetCopied] = useState(false)

  const handleContentImageUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onUploadContentImage) return

    setUploadingContentImage(true)
    try {
      const url = await onUploadContentImage(file)
      setContentImageUrl(url)
      setSnippetCopied(false)
    } finally {
      setUploadingContentImage(false)
    }
  }

  const handleCopySnippet = async () => {
    if (!contentImageUrl) return
    await navigator.clipboard.writeText(`![](${contentImageUrl})`)
    setSnippetCopied(true)
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
            Introduction (max 120 letters)
          </span>
          <textarea
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            className="min-h-28 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            maxLength={120}
            placeholder="Introduction"
          />
          {errors.description && (
            <span className="text-xs text-red-500">{errors.description}</span>
          )}
        </label>

        {onUploadContentImage && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                In-content image (optional)
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                A picture that sits inside the article body, between
                paragraphs — not the cover image above. Upload it, copy the
                markdown, and paste that into Content where you want it to
                appear. Repeat for as many as you need.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4">
              {contentImageUrl ? (
                // The img carries no width/height class, so the browser draws
                // it at its raw pixel size. `self-start` is what actually
                // makes the wrapper shrink-wrap: this is a flex item, and a
                // flex item is blockified (inline-block is ignored) and
                // stretched to full width by default — that stretch was
                // leaving a filled gap beside anything narrower than the form.
                <div className="max-h-[600px] max-w-full self-start overflow-auto rounded-md border border-border">
                  <img src={contentImageUrl} alt="" className="block" />
                </div>
              ) : (
                // Nothing uploaded yet, so there's no "real size" to match —
                // use the same placeholder shape as the cover image above.
                <div className="flex aspect-[1.65/1] w-full max-w-[500px] items-center justify-center overflow-hidden rounded-md bg-[#EFEEEB]">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label className={buttonClassName('secondary', 'w-fit cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60')}>
                  {uploadingContentImage
                    ? 'Uploading...'
                    : 'Upload in-content image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingContentImage}
                    onChange={handleContentImageUpload}
                  />
                </label>
                {contentImageUrl && (
                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className={buttonClassName('secondary')}
                  >
                    {snippetCopied ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Copy markdown
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
              onClick={() => setPreviewingContent((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-md border border-foreground px-3 py-1 text-xs font-medium hover:border-muted-foreground hover:text-muted-foreground"
            >
              {previewingContent ? (
                <>
                  <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                  Write
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview
                </>
              )}
            </button>
          </div>
          {previewingContent ? (
            <div className="markdown min-h-[420px] w-full rounded-sm border border-input bg-background px-3 py-3 font-sans text-[15px] leading-[1.55]">
              {form.content ? (
                <ReactMarkdown>{form.content}</ReactMarkdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          ) : (
            <textarea
              id="article-content"
              value={form.content}
              onChange={(event) => onChange('content', event.target.value)}
              className="min-h-[420px] w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
              placeholder="Content"
            />
          )}
          {errors.content && (
            <span className="text-xs text-red-500">{errors.content}</span>
          )}
        </div>
      </FormSection>

      {footer}
    </div>
  )
}

export default ArticleForm
