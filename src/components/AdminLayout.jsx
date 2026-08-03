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
        <aside className="hidden w-[208px] shrink-0 flex-col bg-[#EFEEEB] lg:flex">
          <AdminSidebarContent onLogout={handleLogout} />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="flex h-16 items-center justify-between border-b border-border px-5 lg:hidden">
            <Link to="/" className="text-2xl font-medium leading-none">
              hh<span className="text-green-500">.</span>
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

function AdminSidebarContent({ onLinkClick, onLogout }) {
  return (
    <>
      <div className="px-6 pb-8 pt-12">
        <Link
          to="/"
          onClick={onLinkClick}
          className="text-[32px] font-medium leading-none"
        >
          hh<span className="text-green-500">.</span>
        </Link>
        <p className="mt-3 text-[15px] font-medium leading-none text-[#FF9950]">
          Admin panel
        </p>
      </div>

      <nav className="flex-1">
        {navItems.map(({ icon: Icon, label, path }) =>
          path ? (
            <NavLink
              key={label}
              to={path}
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 px-6 text-[11px] leading-none transition-colors ${
                  isActive
                    ? 'bg-[#DAD7D2] font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-[#E4E1DC] hover:text-foreground'
                }`
              }
            >
              <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
              <span className="min-w-0 truncate">{label}</span>
            </NavLink>
          ) : (
            <div
              key={label}
              className="flex h-11 items-center gap-3 px-6 text-[11px] leading-none text-muted-foreground"
            >
              <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
              <span className="min-w-0 truncate">{label}</span>
            </div>
          ),
        )}
      </nav>

      <div className="border-t border-border py-3">
        <Link
          to="/"
          onClick={onLinkClick}
          className="flex h-10 items-center gap-3 px-6 text-[11px] leading-none text-muted-foreground hover:text-foreground"
        >
          <ExternalLink
            className="h-[15px] w-[15px] shrink-0"
            strokeWidth={1.75}
          />
          <span className="truncate">hh. website</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 w-full items-center gap-3 px-6 text-[11px] leading-none text-muted-foreground hover:text-foreground"
        >
          <LogOut
            className="h-[15px] w-[15px] shrink-0"
            strokeWidth={1.75}
          />
          <span className="truncate">Log out</span>
        </button>
      </div>
    </>
  )
}

export default AdminLayout
