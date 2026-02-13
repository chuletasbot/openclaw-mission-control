import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'OpenClaw Mission Control',
  description: 'Mission Control dashboard for OpenClaw',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-[#0a0a0f]">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
