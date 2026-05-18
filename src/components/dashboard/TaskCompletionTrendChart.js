'use client'

import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '@/hooks/useChartTheme'
import { buildCompletionTrendData } from '@/lib/chartData'

export default function TaskCompletionTrendChart({ tasks, loading }) {
  const theme = useChartTheme()
  const data = useMemo(() => buildCompletionTrendData(tasks), [tasks])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Loading chart...
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: theme.axis, fontSize: 11 }}
          axisLine={{ stroke: theme.grid }}
          tickLine={{ stroke: theme.grid }}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: theme.axis, fontSize: 12 }}
          axisLine={{ stroke: theme.grid }}
          tickLine={{ stroke: theme.grid }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltipBg,
            borderColor: theme.tooltipBorder,
            color: theme.tooltipText,
            borderRadius: '0.5rem',
          }}
          formatter={(value) => [value, 'Completed']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke={theme.line}
          strokeWidth={2.5}
          dot={{ fill: theme.lineDot, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
