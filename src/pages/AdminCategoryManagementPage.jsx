import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import {
  createAdminCategory,
  getAdminCategories,
  saveAdminCategories,
  updateAdminCategory,
} from '../services/categoryAdminService'
import { getAdminArticles, saveAdminArticles } from '../services/articleAdminService'

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
  const [categories, setCategories] = useState(() => getAdminCategories())
  const [articles, setArticles] = useState(() => getAdminArticles())
  const [view, setView] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  const persistCategories = (nextCategories) => {
    setCategories(nextCategories)
    saveAdminCategories(nextCategories)
  }

  const persistArticles = (nextArticles) => {
    setArticles(nextArticles)
    saveAdminArticles(nextArticles)
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
    setToast({ title, message })
  }

  const submitCategory = () => {
    try {
      if (editingCategory) {
        const updatedCategory = updateAdminCategory(
          editingCategory,
          form,
          categories,
        )
        const nextCategories = categories.map((category) =>
          category.id === editingCategory.id ? updatedCategory : category,
        )
        const nextArticles = articles.map((article) =>
          article.category === editingCategory.name
            ? { ...article, category: updatedCategory.name }
            : article,
        )

        persistCategories(nextCategories)
        persistArticles(nextArticles)
        showToast('Category updated', 'Category has been successfully saved')
      } else {
        persistCategories([createAdminCategory(form), ...categories])
        showToast('Category created', 'New category has been successfully created')
      }

      closeForm()
    } catch (error) {
      setErrors({ api: error.message || 'Unable to save category.' })
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    if (usageByCategory[deleteTarget.name]) {
      setDeleteTarget(null)
      setErrors({
        api: 'This category is being used by articles and cannot be deleted.',
      })
      return
    }

    persistCategories(
      categories.filter((category) => category.id !== deleteTarget.id),
    )
    setDeleteTarget(null)
    showToast('Category deleted', 'Category has been deleted')
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
              className="rounded-full border border-foreground px-8 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitCategory}
              className="rounded-full bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
            >
              Save
            </button>
          </>
        }
      >
        <section className="max-w-[520px]">
          {errors.api && (
            <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
              {errors.api}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Category name
            </span>
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
              placeholder="Category name"
            />
          </label>

          {editingCategory && (
            <button
              type="button"
              onClick={() => setDeleteTarget(editingCategory)}
              disabled={Boolean(usageByCategory[editingCategory.name])}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-red-600 disabled:cursor-not-allowed disabled:text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete category
            </button>
          )}
        </section>

        {deleteTarget && (
          <DeleteCategoryDialog
            category={deleteTarget}
            onCancel={() => setDeleteTarget(null)}
            onDelete={confirmDelete}
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
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
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

      {filteredCategories.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No categories match this filter.
        </p>
      )}

      {toast && (
        <Toast
          message={toast.message}
          onClose={() => setToast(null)}
          title={toast.title}
        />
      )}

      {deleteTarget && (
        <DeleteCategoryDialog
          category={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDelete={confirmDelete}
        />
      )}
    </AdminLayout>
  )
}

function Toast({ message, onClose, title }) {
  return (
    <div className="fixed bottom-10 right-10 z-50 flex w-[520px] max-w-[calc(100vw-40px)] items-start justify-between rounded-sm bg-green-500 px-5 py-4 text-white shadow-lg">
      <div>
        <p className="text-base font-bold">{title}</p>
        <p className="mt-1 text-xs">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1 hover:bg-white/10"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function DeleteCategoryDialog({ category, onCancel, onDelete }) {
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
            className="rounded-full border border-foreground px-6 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryManagementPage
