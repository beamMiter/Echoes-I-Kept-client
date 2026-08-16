import { useState } from 'react'
import { User } from 'lucide-react'
import { toast } from 'sonner'
import AccountLayout from '../components/AccountLayout'
import { useAuth } from '../context/useAuth'
import { bioParagraphsToText, bioTextToParagraphs } from '../utils/bio'
import { buttonClassName } from '../utils/buttonStyles'

function getProfileForm(user) {
  return {
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    profilePic: user?.profilePic || '',
    bio: bioParagraphsToText(user?.bio),
  }
}

// Keyed by user id in ProfilePage below so the form fully remounts (and
// re-derives from getProfileForm) whenever the logged-in account changes —
// otherwise the useState initializer only runs once, and the form would keep
// showing whoever's data it first mounted with, bio included.
function ProfileForm() {
  const { state, updateProfile } = useAuth()
  const [form, setForm] = useState(() => getProfileForm(state.user))
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const next = {}

    if (!form.name.trim()) next.name = 'Name is required.'
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

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      updateField('profilePic', reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await updateProfile({
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      profilePic: form.profilePic.trim(),
      bio: bioTextToParagraphs(form.bio),
    })

    if (result?.error) {
      setErrors({ api: result.error })
      toast.error('Unable to save profile', {
        description: result.error,
      })
      return
    }

    toast.success('Saved profile', {
      description: 'Your profile has been successfully updated.',
    })
  }

  return (
    <AccountLayout activePage="profile" layout="profile" title="Profile">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-sm bg-[#EFEEEB] px-5 py-6 md:min-h-[648px] md:px-10 md:py-10"
      >
        <div className="mb-8 flex flex-col items-start gap-5 border-b border-border pb-8 sm:flex-row sm:items-center sm:gap-6 md:mb-10 md:gap-8 md:pb-10">
          {form.profilePic ? (
            <img
              src={form.profilePic}
              alt={form.name || 'Profile'}
              className="h-24 w-24 shrink-0 rounded-full object-cover md:h-[120px] md:w-[120px]"
            />
          ) : (
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#7B7974] text-white md:h-[120px] md:w-[120px]"
              role="img"
              aria-label={`${form.name || 'User'} profile placeholder`}
            >
              <User className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
            </div>
          )}
          <label className={buttonClassName('secondary', 'cursor-pointer')}>
            Upload profile picture
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleProfilePictureChange}
              disabled={state.loading}
            />
          </label>
        </div>

        {errors.api && (
          <div className="mb-5 rounded-sm bg-red-500 p-3 text-sm text-white">
            {errors.api}
          </div>
        )}

        <div className="space-y-5 md:space-y-6">
          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Name
            </span>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              disabled={state.loading}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name}</span>
            )}
          </label>

          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Username
            </span>
            <input
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              disabled={state.loading}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            {errors.username && (
              <span className="text-xs text-red-500">{errors.username}</span>
            )}
          </label>

          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              disabled={state.loading}
              className="h-12 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </label>

          <label className="block space-y-1 md:space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Bio
            </span>
            <textarea
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              disabled={state.loading}
              placeholder="Tell readers what you write about. Leave a blank line between paragraphs."
              className="min-h-28 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
            />
            <span className="block text-xs text-muted-foreground">
              Shown on your articles' author card. New posts snapshot this
              when they're created — editing your bio later won't change
              posts you already wrote.
            </span>
          </label>
        </div>

        <div className="mt-8 md:mt-10">
          <button
            type="submit"
            disabled={state.loading}
            className={buttonClassName('primary', 'min-w-[120px]')}
          >
            Save
          </button>
        </div>
      </form>
    </AccountLayout>
  )
}

function ProfilePage() {
  const { state } = useAuth()
  return <ProfileForm key={state.user?.id ?? 'anonymous'} />
}

export default ProfilePage
