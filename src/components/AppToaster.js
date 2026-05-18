'use client'

import { Toaster } from 'sonner'

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border border-slate-200 bg-white text-slate-900 shadow-lg',
          title: 'text-slate-900',
          description: 'text-slate-600',
        },
      }}
    />
  )
}
