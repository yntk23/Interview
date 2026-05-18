'use client'

import { SORTABLE_COLUMNS } from '@/lib/tasks'

export default function SortableHeader({
  label,
  column,
  sortColumn,
  sortDirection,
  onSort,
  className = '',
}) {
  const dbColumn = SORTABLE_COLUMNS[column]
  const isActive = sortColumn === dbColumn
  const indicator = !isActive ? '↕' : sortDirection === 'asc' ? '↑' : '↓'

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(dbColumn)}
        className="inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-slate-900"
      >
        {label}
        <span className={`text-[10px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
          {indicator}
        </span>
      </button>
    </th>
  )
}
