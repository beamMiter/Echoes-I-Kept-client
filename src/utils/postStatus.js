// Single source of truth for how the four post statuses are labelled, so the
// admin list, the moderation queue, and a member's own post list stay in sync.
const STATUS_META = {
  draft: {
    label: 'Draft',
    className: 'text-muted-foreground',
    dotClassName: 'bg-muted-foreground',
  },
  pending: {
    label: 'Pending review',
    className: 'text-[#B54708]',
    dotClassName: 'bg-[#F79009]',
  },
  rejected: {
    label: 'Rejected',
    className: 'text-red-600',
    dotClassName: 'bg-red-600',
  },
  published: {
    label: 'Published',
    className: 'text-[#12B76A]',
    dotClassName: 'bg-[#12B76A]',
  },
}

export function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.draft
}

export const POST_STATUSES = Object.keys(STATUS_META)
