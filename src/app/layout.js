import AppToaster from '@/components/AppToaster'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Interview App',
  description: 'Username login demo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppToaster />
          <div className="app-shell">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
