'use client'

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltipContent from '@/components/dashboard/ChartTooltipContent'
import { useChartTheme } from '@/hooks/useChartTheme'
import { buildWeeklyWorkloadData } from '@/lib/chartData'

export default function WeeklyWorkloadChart({
  tasks,
  loading,
  selectedDateKey,
  onBarClick,
}) {
  const theme = useChartTheme()
  const data = useMemo(() => buildWeeklyWorkloadData(tasks), [tasks])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
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
          content={(props) => <ChartTooltipContent {...props} />}
        />
        <Bar
          name="Tasks due"
          dataKey="count"
          radius={[6, 6, 0, 0]}
          onClick={(bar) => {
            const dateKey = bar?.payload?.dateKey ?? bar?.dateKey
            if (dateKey && onBarClick) {
              onBarClick(dateKey)
            }
          }}
          className="cursor-pointer"
        >
          {data.map((entry) => (
            <Cell
              key={entry.dateKey}
              fill={entry.dateKey === selectedDateKey ? theme.line : theme.bar}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
