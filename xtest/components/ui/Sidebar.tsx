'use client'

import { XAccount } from '@/types'
import { PenLine, Clock, Mic, Users, BarChart2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'compose' | 'queue' | 'voice' | 'accounts' | 'analytics'

interface Props {
  accounts: XAccount[]
  activeAccount: XAccount | null
  setActiveAccount: (a: XAccount) => void
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  onLogout: () => void
}

const tabs = [
  { id: 'compose', label: 'Compose', icon: PenLine },
  { id: 'queue', label: 'Queue', icon: Clock },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'accounts', label: 'Accounts', icon: Users },
] as const

export default function Sidebar({ accounts, activeAccount, setActiveAccount, activeTab, setActiveTab, onLogout }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a14] border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <h1 className="text-purple-400 font-black text-lg tracking-wider">X TEST</h1>
        <p className="text-slate-600 text-xs mt-0.5">Multi-account manager</p>
      </div>

      {/* Account switcher */}
      <div className="px-4 py-4 border-b border-slate-800">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Accounts</p>
        <div className="space-y-1">
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => setActiveAccount(account)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm',
                activeAccount?.id === account.id
                  ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                  : 'hover:bg-slate-800/50 text-slate-400 border border-transparent'
              )}
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {account.label[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{account.label}</div>
                <div className="text-xs opacity-60 truncate">@{account.x_handle}</div>
              </div>
            </button>
          ))}

          {accounts.length === 0 && (
            <p className="text-slate-600 text-xs px-3 py-2">No accounts yet</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Navigation</p>
        <div className="space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm',
                activeTab === id
                  ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300'
                  : 'hover:bg-slate-800/50 text-slate-500 border border-transparent hover:text-slate-300'
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}
