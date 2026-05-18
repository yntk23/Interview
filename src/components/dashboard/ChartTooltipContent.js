'use client'

const CHART_TOOLTIP = {
  background: '#1e293b',
  border: '#475569',
  text: '#FFFFFF',
}

export default function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-md"
      style={{
        backgroundColor: CHART_TOOLTIP.background,
        borderColor: CHART_TOOLTIP.border,
        color: CHART_TOOLTIP.text,
      }}
    >
      {label != null && label !== '' ? (
        <p
          className="mb-1.5 text-sm font-semibold leading-tight"
          style={{ color: CHART_TOOLTIP.text }}
        >
          {label}
        </p>
      ) : null}
      <ul className="space-y-0.5">
        {payload.map((entry, index) => {
          const seriesName = entry.name ?? entry.dataKey ?? 'Value'

          return (
            <li
              key={`${seriesName}-${index}`}
              className="text-sm leading-snug"
              style={{ color: CHART_TOOLTIP.text }}
            >
              <span style={{ color: CHART_TOOLTIP.text }}>{seriesName}</span>
              {': '}
              <span className="font-medium" style={{ color: CHART_TOOLTIP.text }}>
                {entry.value}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
