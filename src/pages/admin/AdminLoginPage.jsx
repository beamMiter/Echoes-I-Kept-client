import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2, X } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { buttonClassName } from '../../utils/buttonStyles'

function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, state } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  if (state.user?.role === 'admin') {
    return <Navigate to="/admin/article-management" replace />
  }

  if (state.user && state.user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const validate = () => {
    const next = {}

    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email address.'
    }

    if (!form.password.trim()) {
      next.password = 'Password is required.'
    }

    return next
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setApiError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    const result = await login({ ...form, role: 'admin' })

    if (result?.error) {
      setApiError(result.error)
      return
    }

    navigate('/admin/article-management')
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-[600px] rounded-sm bg-[#EFEEEB] px-5 py-10 sm:px-16 md:px-20 md:py-12">
        <p className="text-center text-xs font-medium text-[#F97316]">
          Admin panel
        </p>
        <h1 className="mt-2 text-center text-2xl font-bold text-foreground">
          Log in
        </h1>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              disabled={state.loading}
              className={`h-10 w-full rounded-sm border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:border-muted-foreground focus-visible:outline-none ${
                errors.email || apiError ? 'border-red-400 text-red-500' : ''
              }`}
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              disabled={state.loading}
              className={`h-10 w-full rounded-sm border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:border-muted-foreground focus-visible:outline-none ${
                errors.password || apiError ? 'border-red-400 text-red-500' : ''
              }`}
            />
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </label>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={state.loading}
              className={buttonClassName('primary', 'min-w-[96px]')}
            >
              {state.loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Log in
            </button>
          </div>
        </form>
      </section>

      {apiError && (
        <div
          role="alert"
          className="fixed bottom-6 left-4 right-4 rounded-sm bg-[#EF4444] px-4 py-3 text-white shadow-lg sm:left-auto sm:right-8 sm:w-[430px]"
        >
          <button
            type="button"
            onClick={() => setApiError('')}
            className="absolute right-3 top-3 rounded-full p-1 hover:bg-white/10"
            aria-label="Close login error"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-8 text-sm font-bold">
            Your password is incorrect or this email doesn&apos;t exist
          </p>
          <p className="mt-1 text-xs">Please try another password or email</p>
        </div>
      )}
    </main>
  )
}

export default AdminLoginPage
