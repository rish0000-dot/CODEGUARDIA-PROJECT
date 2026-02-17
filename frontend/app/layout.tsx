import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          <Toaster position="top-right" richColors />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
