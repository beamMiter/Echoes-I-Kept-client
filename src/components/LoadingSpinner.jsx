import { Loader2 } from 'lucide-react'

// Member-facing content pages (as opposed to admin management tables, which
// use plain "Loading X..." text instead — see AdminArticleManagementPage,
// AdminCategoryManagementPage, AdminMemberManagementPage).
function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-10 ${className}`}>
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

export default LoadingSpinner
