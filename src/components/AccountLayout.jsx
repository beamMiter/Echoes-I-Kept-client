import { Link, useLocation } from 'react-router-dom'
import { KeyRound, User } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import AdminLayout from './AdminLayout'
import { useAuth } from '../context/useAuth'

function AccountLayout({ activePage, children, layout = 'default', title }) {
  const { state } = useAuth()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin/')
  const isEnhancedAccountLayout =
    layout === 'profile' || layout === 'reset-password'
  const profilePath =
    state.user?.role === 'admin' ? '/admin/profile' : '/profile'
  const resetPasswordPath =
    state.user?.role === 'admin' ? '/admin/reset-password' : '/reset-password'

  const navItems = [
    { icon: User, label: 'Profile', path: profilePath, value: 'profile' },
    {
      icon: KeyRound,
      label: 'Reset password',
      path: resetPasswordPath,
      value: 'reset-password',
    },
  ]

  const containerClassName = isEnhancedAccountLayout
    ? 'mx-auto w-full max-w-[800px]'
    : 'mx-auto w-full max-w-[760px]'
  const headingClassName = isEnhancedAccountLayout
    ? 'mb-6 flex min-w-0 items-center gap-3'
    : 'mb-6 flex items-center gap-3 md:ml-[150px]'
  const contentClassName = isEnhancedAccountLayout
    ? 'grid gap-6 lg:grid-cols-[minmax(160px,200px)_minmax(0,552px)] lg:items-start lg:justify-center xl:gap-12'
    : 'grid gap-6 md:grid-cols-[120px_300px] md:items-start md:justify-center'
  const avatarClassName = isEnhancedAccountLayout
    ? 'h-12 w-12 rounded-full object-cover'
    : 'h-8 w-8 rounded-full object-cover'
  const headingTextClassName = isEnhancedAccountLayout ? 'text-base' : 'text-sm'
  const accountNavClassName = isEnhancedAccountLayout
    ? 'space-y-3'
    : 'space-y-2'
  const accountNavLinkClassName = isEnhancedAccountLayout
    ? 'flex min-h-8 items-center gap-3 text-sm leading-5 transition-colors'
    : 'flex items-center gap-2 text-xs transition-colors'
  const accountNavIconClassName = isEnhancedAccountLayout
    ? 'h-4 w-4 shrink-0'
    : 'h-3 w-3'

  const accountContent = (
    <div className={containerClassName}>
      <div className={headingClassName}>
        {state.user?.profilePic ? (
          <img
            src={state.user.profilePic}
            alt={state.user?.name || 'Profile'}
            className={avatarClassName}
          />
        ) : isEnhancedAccountLayout ? (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7B7974] text-white"
            role="img"
            aria-label={`${state.user?.name || 'User'} profile placeholder`}
          >
            <User className="h-5 w-5" strokeWidth={1.5} />
          </div>
        ) : (
          <img
            src="/author-image.jpeg"
            alt={state.user?.name || 'Profile'}
            className={avatarClassName}
          />
        )}
        <p className={`${headingTextClassName} min-w-0 truncate font-medium`}>
          {state.user?.name || 'Member'}
        </p>
        <span
          className={
            isEnhancedAccountLayout ? 'h-6 w-px bg-border' : 'h-4 w-px bg-border'
          }
          aria-hidden="true"
        />
        <p className={`${headingTextClassName} shrink-0 font-bold`}>{title}</p>
      </div>

      <div className={contentClassName}>
        <aside>
          <nav className={accountNavClassName}>
            {navItems.map(({ icon: Icon, label, path, value }) => (
              <Link
                key={value}
                to={path}
                className={`${accountNavLinkClassName} ${
                  activePage === value
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={accountNavIconClassName} strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  )

  if (isAdminPath) {
    return <AdminLayout title={title}>{accountContent}</AdminLayout>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow bg-background px-4 py-10 md:px-8 md:py-14">
        {accountContent}
      </main>

      <Footer />
    </div>
  )
}

export default AccountLayout
