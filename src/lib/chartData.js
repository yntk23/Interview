const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfDay(date) {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function isSameCalendarDay(left, right) {
  return startOfDay(left).getTime() === startOfDay(right).getTime()
}

export function getWeekStartMonday(date = new Date()) {
  const monday = startOfDay(date)
  const weekday = monday.getDay()
  const offset = weekday === 0 ? -6 : 1 - weekday
  monday.setDate(monday.getDate() + offset)
  return monday
}

export function getTaskCompletionDate(task) {
  if (String(task.status ?? '').toUpperCase() !== 'DONE') {
    return null
  }
  return task.updated_at ?? task.created_at ?? null
}

export function buildWeeklyWorkloadData(tasks, referenceDate = new Date()) {
  const weekStart = getWeekStartMonday(referenceDate)

  return WEEKDAY_LABELS.map((label, index) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + index)

    const count = tasks.filter((task) => {
      if (!task.deadline) {
        return false
      }
      return isSameCalendarDay(new Date(task.deadline), day)
    }).length

    const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`

    return {
      day: label,
      count,
      dateKey,
    }
  })
}

export function buildCompletionTrendData(tasks, referenceDate = new Date()) {
  const today = startOfDay(referenceDate)
  const points = []

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - offset)

    const count = tasks.filter((task) => {
      const completedAt = getTaskCompletionDate(task)
      if (!completedAt) {
        return false
      }
      return isSameCalendarDay(new Date(completedAt), day)
    }).length

    points.push({
      day: day.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      count,
    })
  }

  return points
}
