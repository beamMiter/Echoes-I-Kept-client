import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  Image,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../components/AdminLayout'
import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticles,
  updateAdminArticle,
  uploadArticleImage,
} from '../services/articleAdminService'
import { getAdminCategories } from '../services/categoryAdminService'

const emptyForm = {
  title: '',
  category: 'Pop',
  image: '',
  description: '',
  content: '',
}

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || fallback
}

function getStatusMeta(status) {
  return status === 'draft'
    ? {
        label: 'Draft',
        className: 'text-muted-foreground',
        dotClassName: 'bg-muted-foreground',
      }
    : {
        label: 'Published',
        className: 'text-[#12B76A]',
        dotClassName: 'bg-[#12B76A]',
      }
}

function getArticleForm(article) {
  if (!article) return emptyForm

  return {
    title: article.title,
    category: article.category,
    image: article.image,
    description: article.description,
    content: article.content,
  }
}

function AdminArticleManagementPage() {
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([getAdminArticles(), getAdminCategories()])
      .then(([articlesData, categoriesData]) => {
        if (cancelled) return
        setArticles(articlesData)
        setCategories(categoriesData)
      })
      .catch((error) => {
        if (!cancelled) setApiError(getErrorMessage(error, 'Unable to load articles.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const editingArticle = useMemo(
    () => articles.find((article) => article.id === editingId),
    [articles, editingId],
  )

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return articles.filter((article) => {
      const matchesStatus =
        statusFilter === 'all' ? true : article.status === statusFilter
      const matchesCategory =
        categoryFilter === 'all' ? true : article.category === categoryFilter
      const matchesSearch = keyword
        ? article.title.toLowerCase().includes(keyword)
        : true

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [articles, categoryFilter, search, statusFilter])

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const next = {}

    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.category.trim()) next.category = 'Category is required.'
    if (!form.image.trim()) next.image = 'Thumbnail image is required.'
    if (!form.description.trim()) next.description = 'Introduction is required.'
    if (!form.content.trim()) next.content = 'Content is required.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const refreshArticles = async () => {
    setArticles(await getAdminArticles())
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, category: categories[0]?.name || '' })
    setErrors({})
    setView('form')
  }

  const openEdit = (article) => {
    setEditingId(article.id)
    setForm(getArticleForm(article))
    setErrors({})
    setView('form')
  }

  const closeForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setView('list')
  }

  const showToast = (title, message) => {
    toast.success(title, { description: message })
  }

  const submitArticle = async (status) => {
    if (!validate()) return

    setSubmitting(true)
    try {
      if (editingArticle) {
        await updateAdminArticle(editingArticle, form, status)
        showToast('Article updated', 'Your article has been successfully saved')
      } else {
        await createAdminArticle(form, status)
        showToast(
          status === 'published'
            ? 'Create article and published'
            : 'Create article and saved as draft',
          status === 'published'
            ? 'Your article has been successfully published'
            : 'You can publish article later',
        )
      }

      await refreshArticles()
      closeForm()
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to save article.'))
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setSubmitting(true)
    try {
      await deleteAdminArticle(deleteTarget.id)
      await refreshArticles()
      if (editingId === deleteTarget.id) closeForm()
      setDeleteTarget(null)
      showToast('Article deleted', 'Your article has been deleted')
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to delete article.'))
      setDeleteTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadArticleImage(file)
      updateForm('image', url)
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to upload image.'))
    } finally {
      setUploading(false)
    }
  }

  if (view === 'form') {
    const isEditing = Boolean(editingArticle)

    return (
      <AdminLayout
        title={isEditing ? 'Edit article' : 'Create article'}
        actions={
          <>
            <button
              type="button"
              onClick={() => submitArticle('draft')}
              disabled={submitting || uploading}
              className="rounded-full border border-foreground px-8 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() =>
                submitArticle(isEditing ? editingArticle.status : 'published')
              }
              disabled={submitting || uploading}
              className="rounded-full bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save' : 'Save and publish'}
            </button>
          </>
        }
      >
        <form className="max-w-[760px]" onSubmit={(e) => e.preventDefault()}>
          {apiError && (
            <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
              {apiError}
            </div>
          )}

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
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {errors.image && (
                <span className="mt-2 block text-xs text-red-500">
                  {errors.image}
                </span>
              )}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Category
              </span>
              <div className="relative w-[360px] max-w-full">
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateForm('category', event.target.value)
                  }
                  className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
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
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Author name
              </span>
              <input
                value="Techin B."
                disabled
                className="h-10 w-[360px] max-w-full rounded-sm border border-transparent bg-[#FAFAF9] px-3 text-sm text-muted-foreground"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Title
              </span>
              <input
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                placeholder="Article title"
              />
              {errors.title && (
                <span className="text-xs text-red-500">{errors.title}</span>
              )}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Introduction (max 120 letters)
              </span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm('description', event.target.value)
                }
                className="min-h-28 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                maxLength={120}
                placeholder="Introduction"
              />
              {errors.description && (
                <span className="text-xs text-red-500">
                  {errors.description}
                </span>
              )}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-muted-foreground">
                Content
              </span>
              <textarea
                value={form.content}
                onChange={(event) => updateForm('content', event.target.value)}
                className="min-h-[420px] w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                placeholder="Content"
              />
              {errors.content && (
                <span className="text-xs text-red-500">{errors.content}</span>
              )}
            </label>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={() => setDeleteTarget(editingArticle)}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete article
            </button>
          )}
        </form>

        {deleteTarget && (
          <DeleteArticleDialog
            onCancel={() => setDeleteTarget(null)}
            onDelete={confirmDelete}
            submitting={submitting}
          />
        )}
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Article management"
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create article
        </button>
      }
    >
      {apiError && (
        <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
          {apiError}
        </div>
      )}

      <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,280px)_1fr_160px_160px]">
        <div className="relative md:col-start-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-sm border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
            placeholder="Search..."
          />
        </div>
        <div className="hidden md:block" />
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
          >
            <option value="all">Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
          >
            <option value="all">Category</option>
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
      </div>

      <div className="overflow-hidden rounded-sm border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-background text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-5 py-3 font-medium">Article title</th>
              <th className="w-28 px-5 py-3 font-medium">Category</th>
              <th className="w-28 px-5 py-3 font-medium">Status</th>
              <th className="w-24 px-5 py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr
                key={article.id}
                className="border-b border-border odd:bg-[#F7F6F4] last:border-b-0"
              >
                <td className="max-w-[480px] px-5 py-4">
                  <p className="truncate font-medium">{article.title}</p>
                </td>
                <td className="px-5 py-4">{article.category}</td>
                <td className="px-5 py-4">
                  <StatusLabel status={article.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(article)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${article.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(article)}
                      className="text-muted-foreground hover:text-red-600"
                      aria-label={`Delete ${article.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <p className="py-10 text-center text-muted-foreground">Loading articles...</p>
      )}

      {!loading && filteredArticles.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No articles match this filter.
        </p>
      )}

      {deleteTarget && (
        <DeleteArticleDialog
          onCancel={() => setDeleteTarget(null)}
          onDelete={confirmDelete}
          submitting={submitting}
        />
      )}
    </AdminLayout>
  )
}

function StatusLabel({ status }) {
  const statusMeta = getStatusMeta(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium leading-none ${statusMeta.className}`}
    >
      <span
        className={`h-1 w-1 rounded-full ${statusMeta.dotClassName}`}
        aria-hidden="true"
      />
      {statusMeta.label}
    </span>
  )
}

function DeleteArticleDialog({ onCancel, onDelete, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-[360px] rounded-md bg-background px-10 py-8 text-center shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label="Close delete article dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold">Delete article</h2>
        <p className="mt-5 text-sm text-muted-foreground">
          Do you want to delete this article?
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-foreground px-6 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminArticleManagementPage
