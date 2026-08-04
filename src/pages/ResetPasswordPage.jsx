import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import AccountLayout from '../components/AccountLayout'
import { useAuth } from '../context/useAuth'
import { getPasswordStrengthError } from '../utils/passwordValidation'

function ResetPasswordPage() {
  const { state, resetPassword } = useAuth()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const next = {}

    if (!form.currentPassword) {
      next.currentPassword = 'Current password is required.'
    }

    if (!form.newPassword) {
      next.newPassword = 'New password is required.'
    } else {
      const passwordError = getPasswordStrengthError(form.newPassword)
      if (passwordError) next.newPassword = passwordError
    }

    if (!form.confirmPassword) {
      next.confirmPassword = 'Please confirm your new password.'
    } else if (form.newPassword !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setConfirmOpen(true)
  }

  const confirmResetPassword = async () => {
    const result = await resetPassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    })

    if (result?.error) {
      setErrors({ api: result.error })
      setConfirmOpen(false)
      toast.error('Unable to reset password', {
        description: result.error,
      })
      return
    }

    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setConfirmOpen(false)
    toast.success('Password updated', {
      description: 'Your password has been successfully reset.',
    })
  }

  return (
    <AccountLayout
      activePage="reset-password"
      layout="reset-password"
      title="Reset password"
    >
      <form
        onSubmit={handleSubmit}
        className="h-fit w-full rounded-sm bg-[#EFEEEB] px-5 py-6 md:min-h-[455px] md:px-10 md:py-10"
      >
        {errors.api && (
          <div className="mb-5 rounded-sm bg-red-500 p-3 text-sm text-white">
            {errors.api}
          </div>
        )}
        <div className="space-y-5 md:space-y-6">
          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Current password
            </span>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => updateField('currentPassword', e.target.value)}
              disabled={state.loading}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            {errors.currentPassword && (
              <span className="text-xs text-red-500">
                {errors.currentPassword}
              </span>
            )}
          </label>

          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              New password
            </span>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => updateField('newPassword', e.target.value)}
              disabled={state.loading}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            {errors.newPassword && (
              <span className="text-xs text-red-500">
                {errors.newPassword}
              </span>
            )}
          </label>

          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Confirm new password
            </span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              disabled={state.loading}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </label>
        </div>

        <div className="mt-8 md:mt-10">
          <button
            type="submit"
            disabled={state.loading}
            className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-md bg-foreground px-6 text-xs font-medium text-white hover:bg-muted-foreground disabled:opacity-60"
          >
            Reset password
          </button>
        </div>
      </form>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-dialog-title"
            className="relative flex min-h-[260px] w-full max-w-[480px] flex-col items-center justify-center rounded-sm bg-background px-6 py-8 text-center shadow-lg sm:px-10"
          >
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-[#EFEEEB]"
              aria-label="Close reset password dialog"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 id="reset-password-dialog-title" className="text-lg font-bold">
              Reset password
            </h2>
            <p className="mt-3 text-xs text-muted-foreground">
              Do you want to reset your password?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-md border border-foreground px-5 text-xs font-medium hover:border-muted-foreground hover:text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetPassword}
                disabled={state.loading}
                className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-md bg-foreground px-5 text-xs font-medium text-white hover:bg-muted-foreground disabled:opacity-60"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  )
}

export default ResetPasswordPage
