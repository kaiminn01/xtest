'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { XAccount, VoiceProfile } from '@/types'
import { Save, Mic } from 'lucide-react'

export default function VoiceEditor({ account }: { account: XAccount }) {
  const [voice, setVoice] = useState<Partial<VoiceProfile>>({
    tone: '', topics: '', example_tweets: '', avoid: '', reference_accounts: ''
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchVoice()
  }, [account.id])

  async function fetchVoice() {
    const { data } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('account_id', account.id)
      .single()
    if (data) setVoice(data)
    else setVoice({ tone: '', topics: '', example_tweets: '', avoid: '', reference_accounts: '' })
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...voice, account_id: account.id, updated_at: new Date().toISOString() }

    const { data: existing } = await supabase
      .from('voice_profiles')
      .select('id')
      .eq('account_id', account.id)
      .single()

    if (existing) {
      await supabase.from('voice_profiles').update(payload).eq('account_id', account.id)
    } else {
      await supabase.from('voice_profiles').insert(payload)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { key: 'tone', label: 'Tone & Style', placeholder: 'e.g. funny, chill, crypto-native, sarcastic but not mean, lowercase vibes', rows: 2 },
    { key: 'topics', label: 'Topics I Post About', placeholder: 'e.g. crypto, web3, casino, gaming, SEA market, growth marketing', rows: 2 },
    { key: 'example_tweets', label: 'Example Tweets I Like (paste 3-5)', placeholder: 'Paste examples of tweets that match the vibe you want...', rows: 5 },
    { key: 'avoid', label: 'What to Avoid', placeholder: 'e.g. no hashtags, no emojis unless funny, no corporate speak, never start with "Great point!"', rows: 2 },
    { key: 'reference_accounts', label: 'Reference Accounts (handles)', placeholder: 'e.g. @naval @levelsio @cobie @0xfoobar', rows: 2 },
  ]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Mic size={20} className="text-purple-400" />
        <div>
          <h2 className="text-white font-bold text-xl">Voice Profile</h2>
          <p className="text-slate-500 text-sm">@{account.x_handle} · {account.label}</p>
        </div>
      </div>

      <div className="space-y-5">
        {fields.map(({ key, label, placeholder, rows }) => (
          <div key={key}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {label}
            </label>
            <textarea
              rows={rows}
              value={(voice as Record<string, string>)[key] || ''}
              onChange={e => setVoice(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-[#0f0f1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none placeholder:text-slate-700"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        <Save size={14} />
        {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Voice Profile'}
      </button>

      <p className="text-slate-600 text-xs mt-3">
        This voice profile is saved per account. Switch accounts to set different voices.
      </p>
    </div>
  )
}
