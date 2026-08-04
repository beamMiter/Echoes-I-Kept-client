import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from '../services/categoryAdminService'
import { getAdminArticles } from '../services/articleAdminService'

const emptyForm = {
  name: '',
}

function formatUpdatedAt(value) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function AdminCategoryManagementPage() {
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [view, setView] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([getAdminCategories(), getAdminArticles()])
      .then(([categoriesData, articlesData]) => {
        if (cancelled) return
        setCategories(categoriesData)
        setArticles(articlesData)
      })
      .catch((error) => {
        if (!cancelled) {
          setErrors({ api: error.response?.data?.error || 'Unable to load categories.' })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingId),
    [categories, editingId],
  )

  const usageByCategory = useMemo(
    () =>
      articles.reduce((usage, article) => {
        usage[article.category] = (usage[article.category] || 0) + 1
        return usage
      }, {}),
    [articles],
  )

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return categories

    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword),
    )
  }, [categories, search])

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const refreshData = async () => {
    const [categoriesData, articlesData] = await Promise.all([
      getAdminCategories(),
      getAdminArticles(),
    ])
    setCategories(categoriesData)
    setArticles(articlesData)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setView('form')
  }

  const openEdit = (category) => {
    setEditingId(category.id)
    setForm({ name: category.name })
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

  const submitCategory = async () => {
    setSubmitting(true)
    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory, form)
        showToast('Category updated', 'Category has been successfully saved')
      } else {
        await createAdminCategory(form)
        showToast('Category created', 'New category has been successfully created')
      }

      await refreshData()
      closeForm()
    } catch (error) {
      setErrors({ api: error.response?.data?.error || 'Unable to save category.' })
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    if (usageByCategory[deleteTarget.name]) {
      setDeleteTarget(null)
      setErrors({
        api: 'This category is being used by articles and cannot be deleted.',
      })
      return
    }

    setSubmitting(true)
    try {
      await deleteAdminCategory(deleteTarget.id)
      await refreshData()
      if (editingId === deleteTarget.id) closeForm()
      setDeleteTarget(null)
      showToast('Category deleted', 'Category has been deleted')
    } catch (error) {
      setErrors({ api: error.response?.data?.error || 'Unable to delete category.' })
      setDeleteTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (view === 'form') {
    return (
      <AdminLayout
        title={editingCategory ? 'Edit category' : 'Create category'}
        actions={
          <>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-foreground px-8 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitCategory}
              disabled={submitting}
              className="rounded-md bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <section className="mx-auto w-full max-w-md space-y-8">
          {errors.api && (
            <div className="rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
              {errors.api}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Category details
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Shown as the category tag on articles and in the filter list.
              </p>
            </div>

            <label className="flex flex-col gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Category name
              </span>
              <input
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                className="h-10 w-full max-w-xs rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                placeholder="Category name"
              />
            </label>
          </div>

          {editingCategory && (
            <div>
              <button
                type="button"
                onClick={() => setDeleteTarget(editingCategory)}
                disabled={Boolean(usageByCategory[editingCategory.name])}
                title={
                  usageByCategory[editingCategory.name]
                    ? `Used by ${usageByCategory[editingCategory.name]} article(s) — reassign them before deleting this category`
                    : undefined
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-red-600 disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete category
              </button>
              {Boolean(usageByCategory[editingCategory.name]) && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Used by {usageByCategory[editingCategory.name]} article
                  {usageByCategory[editingCategory.name] === 1 ? '' : 's'} — reassign
                  them to another category before deleting this one.
                </p>
              )}
            </div>
          )}
        </section>

        {deleteTarget && (
          <DeleteCategoryDialog
            category={deleteTarget}
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
      title="Category management"
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create category
        </button>
      }
    >
      {errors.api && (
        <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
          {errors.api}
        </div>
      )}

      <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,280px)_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-sm border border-input bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-background text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Category name</th>
                <th className="w-32 px-5 py-3 font-medium">Articles</th>
                <th className="w-44 px-5 py-3 font-medium">Updated</th>
                <th className="w-24 px-5 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-border odd:bg-[#F7F6F4] last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium">{category.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {usageByCategory[category.name] || 0}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatUpdatedAt(category.updatedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(category)}
                        disabled={Boolean(usageByCategory[category.name])}
                        title={
                          usageByCategory[category.name]
                            ? `Used by ${usageByCategory[category.name]} article(s) — reassign them before deleting this category`
                            : undefined
                        }
                        className="text-muted-foreground hover:text-red-600 disabled:cursor-not-allowed disabled:text-muted-foreground/50"
                        aria-label={`Delete ${category.name}`}
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
      </div>

      {loading && (
        <LoadingSpinner />
      )}

      {!loading && filteredCategories.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No categories match this filter.
        </p>
      )}

      {deleteTarget && (
        <DeleteCategoryDialog
          category={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDelete={confirmDelete}
          submitting={submitting}
        />
      )}
    </AdminLayout>
  )
}

function DeleteCategoryDialog({ category, onCancel, onDelete, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-[360px] rounded-md bg-background px-10 py-8 text-center shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label="Close delete category dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold">Delete category</h2>
        <p className="mt-5 text-sm text-muted-foreground">
          Do you want to delete {category.name}?
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-foreground px-6 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="rounded-md bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryManagementPage
