export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

export const PRIORITY_FILTERS = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'HIGH', label: 'High' },
  { id: 'MEDIUM', label: 'Medium' },
  { id: 'LOW', label: 'Low' },
]

export function normalizePriority(priority) {
  const value = String(priority ?? 'MEDIUM').toUpperCase()
  if (TASK_PRIORITIES.includes(value)) {
    return value
  }
  return 'MEDIUM'
}

export function getPriorityStyles(priority) {
  const normalized = normalizePriority(priority)

  if (normalized === 'HIGH') {
    return {
      bar: 'bg-red-500',
      flag: 'text-red-600',
      label: 'High',
    }
  }

  if (normalized === 'LOW') {
    return {
      bar: 'bg-slate-400',
      flag: 'text-slate-500',
      label: 'Low',
    }
  }

  return {
    bar: 'bg-orange-500',
    flag: 'text-orange-600',
    label: 'Medium',
  }
}
