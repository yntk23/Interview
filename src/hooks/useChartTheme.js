'use client'

import { useEffect, useState } from 'react'

const LIGHT_THEME = {
  grid: '#e2e8f0',
  axis: '#64748b',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#0f172a',
  bar: '#3b82f6',
  line: '#10b981',
  lineDot: '#059669',
}

const DARK_THEME = {
  grid: '#334155',
  axis: '#94a3b8',
  tooltipBg: '#1e293b',
  tooltipBorder: '#475569',
  tooltipText: '#f8fafc',
  bar: '#60a5fa',
  line: '#34d399',
  lineDot: '#6ee7b7',
}

export function useChartTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setIsDark(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isDark ? DARK_THEME : LIGHT_THEME
}
