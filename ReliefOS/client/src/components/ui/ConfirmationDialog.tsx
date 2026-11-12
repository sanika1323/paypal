import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  children?: ReactNode
  confirmLabel: string
  tone?: 'primary' | 'danger' | 'success'
  busy?: boolean
  confirmDisabled?: boolean
  error?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmationDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  tone = 'primary',
  busy,
  confirmDisabled,
  error,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
    >
      <div className="dialog__header">
        <h2>{title}</h2>
        <button type="button" className="icon-btn" onClick={onClose} disabled={busy} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      {description && <p className="dialog__description">{description}</p>}
      {children}
      {error && (
        <div className="inline-error" role="alert">
          {error}
        </div>
      )}
      <div className="dialog__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn btn--${tone}`}
          onClick={onConfirm}
          disabled={busy || confirmDisabled}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
