'use client'

import Modal from '@/components/ui/Modal'

export default function BulkDeleteModal({
  count,
  open,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open || count === 0) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!loading}
      aria-labelledby="bulk-delete-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
        <h3 id="bulk-delete-title" className="text-lg font-semibold text-slate-900">
          Delete {count} task{count === 1 ? '' : 's'}?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          This will permanently remove the selected tasks. This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Delete selected'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
