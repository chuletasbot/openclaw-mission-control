'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/tasks', label: 'Task Board', icon: '📋' },
  { href: '/sessions', label: 'Sesiones', icon: '🔌' },
  { href: '/cron', label: 'Cron Jobs', icon: '⏰' },
  { href: '/channels', label: 'Canales', icon: '💬' },
  { href: '/logs', label: 'Logs', icon: '📝' },
  { href: '/lab', label: 'Lab', icon: '🧪' },
  { href: '/memory', label: 'Memoria/Skills', icon: '🧠' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-screen w-64 flex flex-col z-50">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5c3cdc] flex items-center justify-center text-xl">
            🐾
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">OpenClaw</h1>
            <p className="text-xs text-[#8e8e93]">Mission Control</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-purple-500/5'
                  : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="glass-card p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
          <span className="text-xs text-[#8e8e93]">Gateway Online</span>
        </div>
      </div>
    </aside>
  )
}
