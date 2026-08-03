import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import ArticleForm from '../components/ArticleForm'
import {
  emptyArticleForm,
  getArticleForm,
  validateArticleForm,
} from '../utils/articleForm'
import { getStatusMeta } from '../utils/postStatus'
import { useAuth } from '../context/useAuth'
import { fetchCategories } from '../services/categoriesService'
import { uploadArticleImage } from '../services/articleAdminService'
import {
  getMyArticleById,
  submitArticle,
  updateMyArticle,
} from '../services/memberArticleService'

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.error || fallback
}

function MyArticleFormPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { state } = useAuth()
  const isEditing = Boolean(postId)

  const [form, setForm] = useState(emptyArticleForm)
  const [existing, setExisting] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = isEditing
      ? Promise.all([fetchCategories(), getMyArticleById(postId)])
      : Promise.all([fetchCategories(), Promise.resolve(null)])

    load
      .then(([categoriesData, article]) => {
        if (cancelled) return
        setCategories(categoriesData)
        setExisting(article)
        setForm(
          article
            ? getArticleForm(article)
            : { ...emptyArticleForm, category: categoriesData[0]?.name || '' },
        )
      })
      .catch((error) => {
        if (!cancelled) setApiError(getErrorMessage(error, 'Unable to load this post.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isEditing, postId])

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
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

  const save = async (status) => {
    setSubmitting(true)
    setApiError('')
    try {
      if (isEditing) {
        await updateMyArticle(postId, form, status)
      } else {
        await submitArticle(form, status)
      }

      if (status === 'draft') {
        toast.success('Saved as draft', {
          description: 'Come back and submit it whenever you’re ready.',
        })
      } else {
        toast.success(isEditing ? 'Sent for review' : 'Submitted for review', {
          description: 'Your post will go live once an admin approves it.',
        })
      }
      navigate('/my-posts')
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to save your post.'))
      setConfirmingUnpublish(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (status) => {
    const nextErrors = validateArticleForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (existing?.status === 'published') {
      setPendingStatus(status)
      setConfirmingUnpublish(true)
      return
    }

    save(status)
  }

  const statusMeta = existing ? getStatusMeta(existing.status) : null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-[900px] flex-1 px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">
              {isEditing ? 'Edit post' : 'Write a post'}
            </h1>
            {statusMeta && (
              <span
                className={`inline-flex items-center gap-1.5 text-[12px] font-medium leading-none ${statusMeta.className}`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${statusMeta.dotClassName}`}
                  aria-hidden="true"
                />
                {statusMeta.label}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Posts are reviewed by an admin before they appear on the site.
          </p>
        </div>

        {apiError && (
          <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
            {apiError}
          </div>
        )}

        {existing?.status === 'rejected' && existing.rejectionReason && (
          <div className="mb-5 rounded-sm bg-red-50 px-5 py-3 text-sm text-red-700">
            <span className="font-medium">Why it wasn&apos;t approved: </span>
            {existing.rejectionReason}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <form className="max-w-[760px]" onSubmit={(event) => event.preventDefault()}>
            <ArticleForm
              form={form}
              errors={errors}
              categories={categories}
              authorName={state.user?.name || ''}
              uploading={uploading}
              onChange={updateForm}
              onImageUpload={handleImageUpload}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('pending')}
                disabled={submitting || uploading}
                className="rounded-full bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Submit for review'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={submitting || uploading}
                className="rounded-full border border-foreground px-8 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-full border border-foreground px-8 py-2 text-sm font-medium hover:border-muted-foreground hover:text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />

      {confirmingUnpublish && (
        <ConfirmDialog
          title={pendingStatus === 'draft' ? 'Save as draft?' : 'Send back for review?'}
          message={
            pendingStatus === 'draft'
              ? 'This post is currently live. Saving it as a draft takes it off the site until you submit and it’s approved again.'
              : 'This post is currently live. Saving your changes takes it off the site until an admin approves the new version.'
          }
          confirmLabel={pendingStatus === 'draft' ? 'Save as draft' : 'Save and resubmit'}
          pendingLabel="Sending..."
          submitting={submitting}
          onCancel={() => setConfirmingUnpublish(false)}
          onConfirm={() => save(pendingStatus)}
        />
      )}
    </div>
  )
}

export default MyArticleFormPage
