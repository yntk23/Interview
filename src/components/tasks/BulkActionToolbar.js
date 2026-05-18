'use client'

export default function BulkActionToolbar({
  selectedCount,
  onMarkDone,
  onDelete,
  loading,
}) {
  if (selectedCount === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-10 border-b border-blue-200 bg-blue-50 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-blue-900">
          {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onMarkDone}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mark as Done
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  )
}
