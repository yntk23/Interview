const STATUS_STYLES = {
  TODO: 'bg-slate-100 text-slate-700 ring-slate-200',
  DOING: 'bg-sky-100 text-sky-800 ring-sky-200',
  DONE: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

export default function StatusBadge({ status }) {
  const normalized = String(status ?? 'TODO').toUpperCase()
  const style = STATUS_STYLES[normalized] ?? STATUS_STYLES.TODO

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {normalized}
    </span>
  )
}
