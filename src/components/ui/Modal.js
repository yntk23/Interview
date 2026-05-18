'use client'

import { useEffect } from 'react'

export default function Modal({
  open,
  onClose,
  children,
  overlayClassName = 'bg-slate-900/50',
  dismissible = true,
  ...props
}) {
  useEffect(() => {
    if (!open || !dismissible) {
      return
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, dismissible])

  if (!open) {
    return null
  }

  function handleBackdropClick() {
    if (dismissible) {
      onClose()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      <div onClick={(event) => event.stopPropagation()}>{children}</div>
    </div>
  )
}
