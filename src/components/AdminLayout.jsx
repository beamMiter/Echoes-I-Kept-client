import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Bell,
  ExternalLink,
  Folder,
  KeyRound,
  LogOut,
  Menu,
  NotebookTabs,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

const navItems = [
  {
    icon: NotebookTabs,
    label: 'Article management',
    path: '/admin/article-management',
  },
  { icon: ShieldCheck, label: 'Content moderation', path: '/admin/content-moderation' },
  { icon: Folder, label: 'Category management', path: '/admin/category-management' },
  { icon: Users, label: 'Member management', path: '/admin/member-management' },
  { icon: User, label: 'Profile', path: '/admin/profile' },
  { icon: Bell, label: 'Notification', path: '/admin/notification' },
  { icon: KeyRound, label: 'Reset password', path: '/admin/reset-password' },
]

function AdminLayout({ actions, children, title }) {
  const { logout } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const handleLogout = () => {
    setIsMobileNavOpen(false)
    logout()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#EFEEEB] lg:flex">
          <AdminSidebarContent onLogout={handleLogout} />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex h-16 items-center justify-between border-b border-border px-5 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/svg/listening-to-music.svg"
                alt=""
                className="h-8 w-8"
              />
              <span className="text-lg font-bold leading-none tracking-tight">
                Echoes I Kept
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <header className="flex min-h-16 flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-12">
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
            {actions && (
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            )}
          </header>

          <div className="px-4 py-6 sm:px-5 md:px-10 md:py-8 lg:px-12">
            {children}
          </div>
        </main>
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close admin navigation overlay"
          />
          <aside className="relative flex h-full w-[280px] max-w-[82vw] flex-col bg-[#EFEEEB] shadow-xl">
            <div className="absolute right-4 top-4">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#E4E1DC]"
                aria-label="Close admin navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebarContent
              onLinkClick={() => setIsMobileNavOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}
    </div>
  )
}

const sidebarItemClassName =
  'flex h-11 items-center gap-3 rounded-md px-3 text-sm leading-none transition-colors'

function AdminSidebarContent({ onLinkClick, onLogout }) {
  return (
    <>
      <div className="border-b border-[#DAD7D2] px-5 py-5">
        <Link
          to="/"
          onClick={onLinkClick}
          className="group flex items-center gap-2.5"
        >
          <img
            src="/svg/listening-to-music.svg"
            alt=""
            className="h-10 w-10 shrink-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="block text-2xl font-bold leading-tight tracking-tight text-[#FF9950]">
            Admin panel
          </span>
        </Link>
      </div>

      {/* Top-aligned, not centered — centering left a dead gap the height of
          half the viewport on tall screens. */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={label}
            to={path}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `${sidebarItemClassName} ${
                isActive
                  ? 'bg-[#DAD7D2] font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-[#E4E1DC] hover:text-foreground'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="min-w-0 truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-[#DAD7D2] p-3">
        <Link
          to="/"
          onClick={onLinkClick}
          className={`${sidebarItemClassName} text-muted-foreground hover:bg-[#E4E1DC] hover:text-foreground`}
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 truncate">View website</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className={`${sidebarItemClassName} w-full text-muted-foreground hover:bg-[#E4E1DC] hover:text-foreground`}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 truncate">Log out</span>
        </button>
      </div>
    </>
  )
}

export default AdminLayout
