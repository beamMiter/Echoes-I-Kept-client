import { ChevronDown, Image } from 'lucide-react'

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
  footer,
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Thumbnail image
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-[180px] w-[360px] max-w-full items-center justify-center overflow-hidden rounded-md bg-[#EFEEEB]">
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
          <label className="inline-flex w-fit cursor-pointer rounded-full border border-foreground px-8 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground has-disabled:cursor-not-allowed has-disabled:opacity-60">
            {uploading ? 'Uploading...' : 'Upload thumbnail image'}
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
          <span className="mt-2 block text-xs text-red-500">{errors.image}</span>
        )}
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Category</span>
        <div className="relative w-[360px] max-w-full">
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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          Author name
        </span>
        <input
          value={authorName || ''}
          disabled
          className="h-10 w-[360px] max-w-full rounded-sm border border-transparent bg-[#FAFAF9] px-3 text-sm text-muted-foreground"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Title</span>
        <input
          value={form.title}
          onChange={(event) => onChange('title', event.target.value)}
          className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
          placeholder="Article title"
        />
        {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
      </label>

      <label className="block space-y-2">
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

      <label className="block space-y-2">
        <span className="text-sm font-medium text-muted-foreground">Content</span>
        <textarea
          value={form.content}
          onChange={(event) => onChange('content', event.target.value)}
          className="min-h-[420px] w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
          placeholder="Content"
        />
        {errors.content && (
          <span className="text-xs text-red-500">{errors.content}</span>
        )}
      </label>

      {footer}
    </div>
  )
}

export default ArticleForm
