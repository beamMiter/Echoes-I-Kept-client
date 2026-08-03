import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/useAuth'
import { getPasswordStrengthError } from '../utils/passwordValidation'

function SignUpPage() {
  const navigate = useNavigate()
  const { signup, state } = useAuth()
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const next = {}

    if (!form.name.trim()) {
      next.name = 'Name is required.'
    }

    if (!form.username.trim()) {
      next.username = 'Username is required.'
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      next.username = 'Username can only contain letters, numbers, and underscores.'
    }

    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email address.'
    }

    if (!form.password.trim()) {
      next.password = 'Password is required.'
    } else {
      const passwordError = getPasswordStrengthError(form.password)
      if (passwordError) next.password = passwordError
    }

    if (!form.confirmPassword.trim()) {
      next.confirmPassword = 'Please confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }

    return next
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    const result = await signup({
      name: form.name,
      username: form.username,
      email: form.email,
      password: form.password,
    })

    if (result?.error) {
      setApiError(result.error)
      return
    }

    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex justify-center items-center p-4 my-4 flex-grow">
        <div className="w-full max-w-2xl bg-[#EFEEEB] rounded-sm shadow-md px-4 sm:px-12 lg:px-20 py-8 sm:py-14">
          <h2 className="text-2xl sm:text-4xl font-semibold text-center mb-6 text-foreground">
            Sign up
          </h2>

          {apiError && (
            <div className="mb-6 bg-red-500 text-white p-4 rounded-sm">
              <h3 className="font-bold text-lg mb-1">{apiError}</h3>
              <p className="text-sm">Please check your details and try again</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-muted-foreground"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>

            <div className="relative space-y-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-muted-foreground"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.username ? 'border-red-500' : ''
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs">{errors.username}</p>
              )}
            </div>

            <div className="relative space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="relative space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters, including ."
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.password ? 'border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="relative space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-muted-foreground"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={state.loading}
                className="px-8 py-2 bg-foreground text-white rounded-md hover:bg-muted-foreground transition-colors flex items-center gap-2"
              >
                {state.loading && <Loader2 className="animate-spin" size={20} />}
                Sign up
              </button>
            </div>
          </form>

          <p className="flex flex-row justify-center gap-1 mt-4 text-sm text-center pt-2 text-muted-foreground font-medium">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-foreground hover:text-muted-foreground transition-colors underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default SignUpPage
