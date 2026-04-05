import './globals.css'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { Toaster } from 'sonner'

import SessionManager from './components/SessionManager'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" richColors />
            <SessionManager />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
