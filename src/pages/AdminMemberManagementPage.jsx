import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '../components/AdminLayout'
import LoadingSpinner from '../components/LoadingSpinner'
import FormSection from '../components/FormSection'
import {
  createAdminMember,
  deleteAdminMember,
  getAdminMembers,
  updateAdminMember,
} from '../services/authService'
import { useAuth } from '../context/useAuth'
import { getPasswordStrengthError } from '../utils/passwordValidation'

const emptyForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'user',
  profilePic: '',
}

const roleOptions = [
  { label: 'Member', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

function getErrorMessage(error, fallback) {
  return error.response?.data?.error || fallback
}

function getMemberForm(member) {
  if (!member) return emptyForm

  return {
    name: member.name,
    username: member.username,
    email: member.email,
    password: '',
    role: member.role,
    profilePic: member.profilePic || '',
  }
}

function AdminMemberManagementPage() {
  const { state } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [view, setView] = useState('list')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    let cancelled = false

    getAdminMembers()
      .then((data) => {
        if (!cancelled) setMembers(data)
      })
      .catch((error) => {
        if (!cancelled) setApiError(getErrorMessage(error, 'Unable to load members.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const editingMember = useMemo(
    () => members.find((member) => member.id === editingId),
    [editingId, members],
  )

  const adminCount = members.filter((member) => member.role === 'admin').length
  const memberCount = members.filter((member) => member.role !== 'admin').length

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesRole =
        roleFilter === 'all' ? true : member.role === roleFilter
      const matchesSearch = keyword
        ? [member.name, member.username, member.email].some((value) =>
            value.toLowerCase().includes(keyword),
          )
        : true

      return matchesRole && matchesSearch
    })
  }, [members, roleFilter, search])

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    setApiError('')
  }

  const validate = () => {
    const next = {}

    if (!form.name.trim()) next.name = 'Name is required.'

    if (!form.username.trim()) {
      next.username = 'Username is required.'
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      next.username =
        'Username can only contain letters, numbers, and underscores.'
    }

    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email address.'
    }

    if (!editingMember && !form.password.trim()) {
      next.password = 'Password is required.'
    } else if (form.password) {
      const passwordError = getPasswordStrengthError(form.password)
      if (passwordError) next.password = passwordError
    }

    if (!['admin', 'user'].includes(form.role)) {
      next.role = 'Role is required.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const refreshMembers = async () => {
    setMembers(await getAdminMembers())
  }

  const closeForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrors({})
    setApiError('')
    setView('list')
  }

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrors({})
    setApiError('')
    setView('form')
  }

  const openEdit = (member) => {
    setEditingId(member.id)
    setForm(getMemberForm(member))
    setErrors({})
    setApiError('')
    setView('form')
  }

  const submitMember = async () => {
    if (!validate()) return

    setSubmitting(true)
    try {
      if (editingMember) {
        await updateAdminMember(editingMember.id, form)
        toast.success('Member updated', {
          description: 'Member profile has been successfully saved',
        })
      } else {
        await createAdminMember(form)
        toast.success('Member created', {
          description: 'New member has been successfully created',
        })
      }

      await refreshMembers()
      closeForm()
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to save member.'))
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setSubmitting(true)
    try {
      await deleteAdminMember(deleteTarget.id)
      await refreshMembers()
      if (editingId === deleteTarget.id) closeForm()
      setDeleteTarget(null)
      toast.success('Member deleted', {
        description: 'Member account has been deleted',
      })
    } catch (error) {
      setApiError(getErrorMessage(error, 'Unable to delete member.'))
      setDeleteTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (view === 'form') {
    const isEditing = Boolean(editingMember)

    return (
      <AdminLayout
        title={isEditing ? 'Edit member' : 'Create member'}
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
              onClick={submitMember}
              disabled={submitting}
              className="rounded-md bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <section className="mx-auto w-full max-w-[1100px]">
          {apiError && (
            <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
              {apiError}
            </div>
          )}

          <div className="space-y-8">
            <FormSection
              title="Profile picture"
              description="Shown next to this member's name across the site."
            >
              <div className="flex items-center gap-6">
                {form.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt={form.name || 'Member avatar'}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#77736A] text-white">
                    <UserRound className="h-8 w-8" />
                  </div>
                )}
                <input
                  value={form.profilePic}
                  onChange={(event) =>
                    updateForm('profilePic', event.target.value)
                  }
                  className="h-10 w-full max-w-[420px] rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                  placeholder="Avatar URL"
                />
              </div>
            </FormSection>

            <div className="border-t border-border" />

            <FormSection
              title="Account details"
              description="Name and sign-in identifiers for this member."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Name
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                    placeholder="Member name"
                  />
                  {errors.name && (
                    <span className="text-xs text-red-500">{errors.name}</span>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Username
                  </span>
                  <input
                    value={form.username}
                    onChange={(event) =>
                      updateForm('username', event.target.value)
                    }
                    className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                    placeholder="username"
                  />
                  {errors.username && (
                    <span className="text-xs text-red-500">{errors.username}</span>
                  )}
                </label>
              </div>

              <label className="flex flex-col gap-2 sm:w-1/2 sm:pr-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm('email', event.target.value)}
                  className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                  placeholder="member@example.com"
                />
                {errors.email && (
                  <span className="text-xs text-red-500">{errors.email}</span>
                )}
              </label>
            </FormSection>

            <div className="border-t border-border" />

            <FormSection
              title="Access"
              description="Sign-in password and permission level."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Password
                  </span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateForm('password', event.target.value)
                    }
                    className="h-10 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                    placeholder={
                      isEditing
                        ? 'Leave blank to keep current password'
                        : 'At least 8 characters, including .'
                    }
                  />
                  {errors.password && (
                    <span className="text-xs text-red-500">{errors.password}</span>
                  )}
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Role
                  </span>
                  <div className="relative w-full">
                    <select
                      value={form.role}
                      onChange={(event) => updateForm('role', event.target.value)}
                      className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
                    >
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  {errors.role && (
                    <span className="text-xs text-red-500">{errors.role}</span>
                  )}
                </label>
              </div>
            </FormSection>
          </div>

          {isEditing && (
            <div>
              <button
                type="button"
                onClick={() => setDeleteTarget(editingMember)}
                disabled={editingMember.id === state.user?.id}
                title={
                  editingMember.id === state.user?.id
                    ? "You can't delete your own account"
                    : undefined
                }
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-red-600 disabled:cursor-not-allowed disabled:text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Delete member
              </button>
              {editingMember.id === state.user?.id && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  You can&apos;t delete your own account while logged in as it.
                </p>
              )}
            </div>
          )}
        </section>

        {deleteTarget && (
          <DeleteMemberDialog
            member={deleteTarget}
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
      title="Member management"
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-8 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create member
        </button>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:w-[520px]">
        <SummaryStat label="Total" value={members.length} />
        <SummaryStat label="Admin" value={adminCount} />
        <SummaryStat label="Member" value={memberCount} />
      </div>

      {apiError && (
        <div className="mb-5 rounded-sm bg-red-500 px-5 py-3 text-sm font-medium text-white">
          {apiError}
        </div>
      )}

      <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,280px)_1fr_160px]">
        <div className="relative">
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
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 w-full appearance-none rounded-sm border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:border-muted-foreground"
          >
            <option value="all">Role</option>
            <option value="admin">Admin</option>
            <option value="user">Member</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left text-sm">
            <thead className="bg-background text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="w-40 px-5 py-3 font-medium">Username</th>
                <th className="w-64 px-5 py-3 font-medium">Email</th>
                <th className="w-28 px-5 py-3 font-medium">Role</th>
                <th className="w-24 px-5 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const isCurrentUser = member.id === state.user?.id

                return (
                  <tr
                    key={member.id}
                    className="border-b border-border odd:bg-[#F7F6F4] last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {member.profilePic ? (
                          <img
                            src={member.profilePic}
                            alt={member.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#77736A] text-white">
                            <UserRound className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{member.name}</p>
                          {isCurrentUser && (
                            <p className="text-xs text-muted-foreground">
                              Current user
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {member.username}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          member.role === 'admin'
                            ? 'font-medium text-green-600'
                            : 'font-medium text-muted-foreground'
                        }
                      >
                        • {member.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(member)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Edit ${member.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(member)}
                          disabled={isCurrentUser}
                          title={
                            isCurrentUser
                              ? "You can't delete your own account"
                              : undefined
                          }
                          className="text-muted-foreground hover:text-red-600 disabled:cursor-not-allowed disabled:text-muted-foreground/50"
                          aria-label={`Delete ${member.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <LoadingSpinner />
      )}

      {!loading && filteredMembers.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          No members match this filter.
        </p>
      )}

      {deleteTarget && (
        <DeleteMemberDialog
          member={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDelete={confirmDelete}
          submitting={submitting}
        />
      )}
    </AdminLayout>
  )
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-sm bg-[#EFEEEB] px-5 py-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function DeleteMemberDialog({ member, onCancel, onDelete, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-[360px] rounded-md bg-background px-10 py-8 text-center shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label="Close delete member dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold">Delete member</h2>
        <p className="mt-5 text-sm text-muted-foreground">
          Do you want to delete {member.name}?
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

export default AdminMemberManagementPage
