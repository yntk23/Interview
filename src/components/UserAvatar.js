export default function UserAvatar({ username, size = 'md' }) {
  const initial = (username?.trim()?.[0] ?? '?').toUpperCase()
  const sizeClass =
    size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-white ${sizeClass}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
