'use client'

export default function TaskPagination({
  currentPage,
  totalPages,
  totalCount,
  pageLoading,
  onPrevious,
  onNext,
  onGoToPage,
}) {
  const displayPage = currentPage + 1
  const showPageNumbers = totalPages <= 7

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="card-panel-muted text-sm">
        {totalCount === 0
          ? 'No tasks to display'
          : `Showing page ${displayPage} of ${totalPages} (${totalCount} total)`}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 0 || pageLoading}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Previous
        </button>

        {showPageNumbers
          ? Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onGoToPage(index)}
                disabled={pageLoading}
                className={`min-w-9 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                  index === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {index + 1}
              </button>
            ))
          : (
            <span className="px-2 text-sm font-medium text-slate-900">
              Page {displayPage} of {totalPages}
            </span>
          )}

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages - 1 || pageLoading || totalCount === 0}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Next
        </button>

        {pageLoading ? (
          <span className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
              aria-hidden="true"
            />
            Loading...
          </span>
        ) : null}
      </div>
    </div>
  )
}
