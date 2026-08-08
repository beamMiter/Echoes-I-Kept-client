// Single source of truth for action-button styling across the admin panel and
// the member forms. Buttons had drifted into a mix of px-6/px-8 with no set
// height, so a "Save" and a "Cancel" sitting next to each other could differ in
// both width padding and height.
//
// h-10 fixes the height regardless of whether the label wraps an icon, and
// inline-flex + justify-center keeps single- and icon-plus-text buttons
// identical.
const BASE =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS = {
  // Filled — the primary commit action (Save, Submit, Approve, Create).
  primary: 'bg-foreground text-white hover:bg-muted-foreground',
  // Outlined — the neutral escape hatch (Cancel, Back).
  secondary:
    'border border-foreground hover:border-muted-foreground hover:text-muted-foreground',
  // Filled red — confirming a destructive action inside a dialog.
  danger: 'bg-red-600 text-white hover:bg-red-500',
  // Outlined, turns red on hover — a destructive action offered alongside
  // neutral ones (Reject), where a filled red button would shout too loudly.
  dangerOutline: 'border border-foreground hover:border-red-600 hover:text-red-600',
  // Filled gray — every AI-powered action (Tidy up, Check before submitting,
  // Check with AI) shares this so it reads as "the assistant", not just
  // another neutral form control sitting next to it. `group` lets the icon
  // inside react to hover via AI_ICON_HOVER_CLASS below.
  ai: 'group border border-gray-400 bg-gray-200 text-gray-800 hover:border-gray-500 hover:bg-gray-300',
}

export function buttonClassName(variant = 'primary', extra = '') {
  return `${BASE} ${VARIANTS[variant] ?? VARIANTS.primary}${extra ? ` ${extra}` : ''}`
}

// Put on the icon inside any `ai`-variant button (or AI_BUTTON_CLASS in
// ArticleForm) — it spins and pops only while hovering, not constantly.
export const AI_ICON_HOVER_CLASS =
  'transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125'
