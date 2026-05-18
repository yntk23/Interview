import { formatDateTime } from '@/lib/tasks'

const CSV_HEADERS = ['ลำดับ', 'ชื่องาน', 'สถานะ', 'Priority', 'deadline', 'วันที่เพิ่ม']

function escapeCsvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function formatCsvDate(value) {
  if (!value) {
    return ''
  }
  return formatDateTime(value)
}

export function getTasksCsvFilename(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `tasks_${year}-${month}-${day}.csv`
}

export function buildTasksCsv(tasks) {
  const rows = tasks.map((task, index) => [
    index + 1,
    task.title ?? '',
    String(task.status ?? '').toUpperCase(),
    String(task.priority ?? 'MEDIUM').toUpperCase(),
    formatCsvDate(task.deadline),
    formatCsvDate(task.created_at),
  ])

  const lines = [
    CSV_HEADERS.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]

  return `\uFEFF${lines.join('\r\n')}`
}

export function downloadTasksCsv(tasks, filename = getTasksCsvFilename()) {
  const csv = buildTasksCsv(tasks)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
