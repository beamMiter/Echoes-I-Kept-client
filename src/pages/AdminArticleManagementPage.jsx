import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import ArticleForm from '../components/ArticleForm'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticles,
  updateAdminArticle,
  uploadArticleImage,
} from '../services/articleAdminService'
import { getAdminCategories } from '../services/categoryAdminService'
import { getStatusMeta } from '../utils/postStatus'
import {
  emptyArticleForm,
  getArticleForm,
  validateArticleForm,
} from '../utils/articleForm'
import { useAuth } from '../context/useAuth'

const emptyForm = { ...emptyArticleForm, category: 'Pop' }

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || fallback
}

function AdminArticleManagementPage() {
  const { state } = useAuth()
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('pending')
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
    const next = validateArticleForm(form)
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const refreshArticles = async () => {
    setArticles(await getAdminArticles())
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, category: categories[0]?.name || '' })
    // Not shown as an editable control on create — every new post starts
    // pending no matter what's sent, so this is purely for the request body.
    setStatus('pending')
    setErrors({})
    setView('form')
  }

  const openEdit = (article) => {
    setEditingId(article.id)
    setForm(getArticleForm(article))
    setStatus(article.status)
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

  const submitArticle = async () => {
    if (!validate()) return

    setSubmitting(true)
    try {
      if (editingArticle) {
        await updateAdminArticle(editingArticle, form, status)
        showToast('Article updated', 'Your article has been successfully saved')
      } else {
        // The server forces every new post to pending regardless of what's
        // sent here — see postsController.createPost.
        await createAdminArticle(form, 'pending')
        showToast(
          'Article submitted',
          'Change its status from the edit screen once you’re ready to publish it.',
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
          <button
            type="button"
            onClick={submitArticle}
            disabled={submitting || uploading}
            className="rounded-full bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : isEditing ? 'Save' : 'Submit'}
          </button>
        }
      >
        <form className="max-w-[760px]" onSubmit={(e) => e.preventDefault()}>
          {apiError && (
            <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
              {apiError}
            </div>
          )}

          <ArticleForm
            form={form}
            errors={errors}
            categories={categories}
            authorName={state.user?.name || ''}
            uploading={uploading}
            onChange={updateForm}
            onImageUpload={handleImageUpload}
            footer={
              isEditing && (
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status
                  </span>
                  <div className="relative w-[360px] max-w-full">
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending review</option>
                      <option value="published">Published</option>
                      {/* Not a real choice to switch into from here — listed
                          only so a post that's already rejected displays its
                          true status instead of silently mismatching every
                          option above. Rejecting needs a reason for the
                          author, which only the Content moderation queue's
                          dedicated dialog collects. */}
                      {status === 'rejected' && (
                        <option value="rejected">Rejected</option>
                      )}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                </label>
              )
            }
          />

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
          <ConfirmDialog
            title="Delete article"
            message="Do you want to delete this article?"
            confirmLabel="Delete"
            pendingLabel="Deleting..."
            destructive
            submitting={submitting}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
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
            <option value="pending">Pending review</option>
            <option value="rejected">Rejected</option>
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
        <LoadingSpinner />
      )}

      {!loading && filteredArticles.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No articles match this filter.
        </p>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete article"
          message="Do you want to delete this article?"
          confirmLabel="Delete"
          pendingLabel="Deleting..."
          destructive
          submitting={submitting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
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

export default AdminArticleManagementPage
