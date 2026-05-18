'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartTheme } from '@/hooks/useChartTheme'
import { buildWeeklyWorkloadData } from '@/lib/chartData'

export default function WeeklyWorkloadChart({ tasks, loading }) {
  const theme = useChartTheme()
  const data = useMemo(() => buildWeeklyWorkloadData(tasks), [tasks])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Loading chart...
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: theme.axis, fontSize: 12 }}
          axisLine={{ stroke: theme.grid }}
          tickLine={{ stroke: theme.grid }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: theme.axis, fontSize: 12 }}
          axisLine={{ stroke: theme.grid }}
          tickLine={{ stroke: theme.grid }}
        />
        <Tooltip
          cursor={{ fill: theme.grid, opacity: 0.35 }}
          contentStyle={{
            backgroundColor: theme.tooltipBg,
            borderColor: theme.tooltipBorder,
            color: theme.tooltipText,
            borderRadius: '0.5rem',
          }}
          formatter={(value) => [value, 'Tasks due']}
        />
        <Bar dataKey="count" fill={theme.bar} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
