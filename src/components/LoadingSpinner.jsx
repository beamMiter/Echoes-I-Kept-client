import { Loader2 } from 'lucide-react'

// Member-facing content pages (as opposed to admin management tables, which
// use plain "Loading X..." text instead — see AdminArticleManagementPage,
// AdminCategoryManagementPage, AdminMemberManagementPage).
//
// `padded` adds the default py-10 rhythm used when this sits directly in a
// page's content flow. Set it false when the caller already centers this
// within its own sized container (e.g. a flex-grow main) — appending a
// conflicting py-* utility via `className` wouldn't reliably win, since
// Tailwind's cascade is decided by stylesheet order, not class-string order.
function LoadingSpinner({ className = '', padded = true }) {
  return (
    <div className={`flex justify-center ${padded ? 'py-10' : ''} ${className}`.trim()}>
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

export default LoadingSpinner
