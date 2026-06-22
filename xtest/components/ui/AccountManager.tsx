'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { XAccount } from '@/types'
import { Plus, Trash2, Users } from 'lucide-react'

interface Props {
  accounts: XAccount[]
  onUpdate: () => void
}

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openrouter', label: 'OpenRouter' },
]

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (recommended)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano (cheapest)' },
  ],
  gemini: [
    { value: 'gemini-2.0-flash-001', label: 'Gemini Flash 2.0 (recommended)' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  ],
  openrouter: [
    { value: 'google/gemini-2.0-flash-001', label: 'Gemini Flash 2.0 via OpenRouter' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini via OpenRouter' },
    { value: 'anthropic/claude-haiku-3-5', label: 'Claude Haiku 3.5 via OpenRouter' },
  ],
}

const emptyForm = { label: '', x_handle: '', ai_provider: 'openai' as const, ai_api_key: '', ai_model: 'gpt-4o-mini' }

export default function AccountManager({ accounts, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('x_accounts').insert({ ...form, user_id: user.id })
    setForm(emptyForm)
    setShowForm(false)
    setSaving(false)
    onUpdate()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this account and all its data?')) return
    await supabase.from('x_accounts').delete().eq('id', id)
    onUpdate()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-purple-400" />
          <div>
            <h2 className="text-white font-bold text-xl">X Accounts</h2>
            <p className="text-slate-500 text-sm">{accounts.length} accounts connected</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={14} />
          Add Account
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-[#0f0f1a] border border-purple-500/30 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="text-white font-bold text-sm mb-4">Add New X Account</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Label</label>
              <input
                required
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Personal, DEXINO, OmenX"
                className="w-full bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">X Handle</label>
              <input
                required
                value={form.x_handle}
                onChange={e => setForm(p => ({ ...p, x_handle: e.target.value.replace('@', '') }))}
                placeholder="without @"
                className="w-full bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Provider</label>
            <select
              value={form.ai_provider}
              onChange={e => setForm(p => ({ ...p, ai_provider: e.target.value as 'openai', ai_model: MODELS[e.target.value][0].value }))}
              className="w-full bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {AI_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Model</label>
            <select
              value={form.ai_model}
              onChange={e => setForm(p => ({ ...p, ai_model: e.target.value }))}
              className="w-full bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {(MODELS[form.ai_provider] || []).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Key</label>
            <input
              required
              type="password"
              value={form.ai_api_key}
              onChange={e => setForm(p => ({ ...p, ai_api_key: e.target.value }))}
              placeholder="sk-... or your API key"
              className="w-full bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : 'Add Account'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Account list */}
      <div className="space-y-3">
        {accounts.map(account => (
          <div key={account.id} className="bg-[#0f0f1a] border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-sm">
                {account.label[0].toUpperCase()}
              </div>
              <div>
                <div className="text-white font-bold text-sm">{account.label}</div>
                <div className="text-slate-500 text-xs">@{account.x_handle} · {account.ai_provider} · {account.ai_model}</div>
              </div>
            </div>
            <button onClick={() => handleDelete(account.id)} className="text-slate-600 hover:text-red-400 transition-colors p-2">
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No accounts yet — add your first one above</p>
          </div>
        )}
      </div>
    </div>
  )
}
