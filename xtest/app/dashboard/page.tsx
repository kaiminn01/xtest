'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { XAccount, Post } from '@/types'
import Sidebar from '@/components/ui/Sidebar'
import PostComposer from '@/components/ui/PostComposer'
import PostQueue from '@/components/ui/PostQueue'
import VoiceEditor from '@/components/ui/VoiceEditor'
import AccountManager from '@/components/ui/AccountManager'
import Analytics from '@/components/ui/Analytics'

type Tab = 'compose' | 'queue' | 'voice' | 'accounts' | 'analytics'

export default function Dashboard() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<XAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<XAccount | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('compose')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (activeAccount) fetchPosts()
  }, [activeAccount])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    await fetchAccounts()
    setLoading(false)
  }

  async function fetchAccounts() {
    const { data } = await supabase.from('x_accounts').select('*').order('created_at')
    if (data && data.length > 0) {
      setAccounts(data)
      setActiveAccount(data[0])
    }
  }

  async function fetchPosts() {
    if (!activeAccount) return
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('account_id', activeAccount.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setPosts(data)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
      <div className="text-purple-400 font-bold tracking-widest text-sm animate-pulse">LOADING...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#07070f] flex">
      <Sidebar
        accounts={accounts}
        activeAccount={activeAccount}
        setActiveAccount={setActiveAccount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        {!activeAccount && activeTab !== 'accounts' ? (
          <div className="flex flex-col items-center justify-center h-full text-center pt-32">
            <div className="text-5xl mb-4">🐦</div>
            <h2 className="text-white font-bold text-xl mb-2">No X accounts yet</h2>
            <p className="text-slate-500 text-sm mb-6">Add your first X account to get started</p>
            <button
              onClick={() => setActiveTab('accounts')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Add Account
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'compose' && activeAccount && (
              <PostComposer account={activeAccount} onPostSaved={fetchPosts} />
            )}
            {activeTab === 'queue' && activeAccount && (
              <PostQueue posts={posts} account={activeAccount} onUpdate={fetchPosts} />
            )}
            {activeTab === 'voice' && activeAccount && (
              <VoiceEditor account={activeAccount} />
            )}
            {activeTab === 'accounts' && (
              <AccountManager accounts={accounts} onUpdate={fetchAccounts} />
            )}
            {activeTab === 'analytics' && activeAccount && (
              <Analytics posts={posts} account={activeAccount} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
