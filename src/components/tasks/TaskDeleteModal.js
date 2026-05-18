'use client'

export default function TaskDeleteModal({
  task,
  open,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open || !task) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
        <h3 id="delete-task-title" className="text-lg font-semibold text-slate-900">
          Delete task?
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          This will permanently remove{' '}
          <span className="font-semibold text-slate-900">&quot;{task.title}&quot;</span>.
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Delete task'}
          </button>
        </div>
      </div>
    </div>
  )
}
