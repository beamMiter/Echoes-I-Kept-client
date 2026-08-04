import { X } from 'lucide-react'
import { buttonClassName } from '../utils/buttonStyles'

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  pendingLabel = 'Working...',
  cancelLabel = 'Cancel',
  destructive = false,
  submitting = false,
  reason,
  onReasonChange,
  reasonLabel = 'Reason',
  reasonPlaceholder = '',
  reasonRequired = false,
  onCancel,
  onConfirm,
}) {
  const usesReason = typeof onReasonChange === 'function'
  const confirmDisabled =
    submitting || (usesReason && reasonRequired && !reason?.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-[420px] rounded-md bg-background px-10 py-8 text-center shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 rounded-full p-1 text-muted-foreground hover:bg-[#EFEEEB] hover:text-foreground"
          aria-label={`Close ${title.toLowerCase()} dialog`}
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
        {message && (
          <p className="mt-5 text-sm text-muted-foreground">{message}</p>
        )}

        {usesReason && (
          <label className="mt-5 block space-y-2 text-left">
            <span className="text-sm font-medium text-muted-foreground">
              {reasonLabel}
            </span>
            <textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              className="min-h-24 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:border-muted-foreground focus-visible:outline-none"
              placeholder={reasonPlaceholder}
              maxLength={1000}
            />
          </label>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={buttonClassName('secondary')}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={buttonClassName(destructive ? 'danger' : 'primary')}
          >
            {submitting ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
