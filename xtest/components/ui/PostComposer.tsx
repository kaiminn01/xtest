'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { XAccount } from '@/types'
import { Sparkles, Send, Clock, RefreshCw } from 'lucide-react'

interface Props {
  account: XAccount
  onPostSaved: () => void
}

export default function PostComposer({ account, onPostSaved }: Props) {
  const [mode, setMode] = useState<'tweet' | 'reply'>('tweet')
  const [content, setContent] = useState('')
  const [replyUrl, setReplyUrl] = useState('')
  const [replyText, setReplyText] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [topic, setTopic] = useState('')

  const charCount = content.length
  const isOverLimit = charCount > 280

  async function generateContent() {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          mode,
          topic,
          replyText,
        })
      })
      const data = await res.json()
      if (data.content) setContent(data.content)
      else alert(data.error || 'Generation failed')
    } catch {
      alert('Failed to generate')
    }
    setGenerating(false)
  }

  async function saveDraft(status: 'draft' | 'scheduled') {
    if (!content.trim()) return
    setSaving(true)

    await supabase.from('posts').insert({
      account_id: account.id,
      content,
      status,
      post_type: mode,
      reply_to_url: replyUrl || null,
      reply_to_text: replyText || null,
      scheduled_at: status === 'scheduled' && scheduledAt ? scheduledAt : null,
    })

    setContent('')
    setReplyUrl('')
    setReplyText('')
    setScheduledAt('')
    setTopic('')
    onPostSaved()
    setSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles size={20} className="text-purple-400" />
        <div>
          <h2 className="text-white font-bold text-xl">Compose</h2>
          <p className="text-slate-500 text-sm">@{account.x_handle} · {account.label}</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(['tweet', 'reply'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
              mode === m
                ? 'bg-purple-600 text-white'
                : 'bg-[#0f0f1a] border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Reply URL input */}
      {mode === 'reply' && (
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tweet URL to reply to
            </label>
            <input
              type="url"
              value={replyUrl}
              onChange={e => setReplyUrl(e.target.value)}
              placeholder="https://x.com/..."
              className="w-full bg-[#0f0f1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tweet text (paste for AI context)
            </label>
            <textarea
              rows={2}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Paste the tweet text here so AI can generate a relevant reply..."
              className="w-full bg-[#0f0f1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>
        </div>
      )}

      {/* Topic for tweets */}
      {mode === 'tweet' && (
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Topic / angle (optional — for AI generation)
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. why crypto casinos will outperform traditional ones in SEA"
            className="w-full bg-[#0f0f1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      )}

      {/* AI generate button */}
      <button
        onClick={generateContent}
        disabled={generating}
        className="flex items-center gap-2 mb-4 bg-[#1e1030] border border-purple-500/40 hover:border-purple-500 text-purple-300 font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
      >
        {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {generating ? 'Generating...' : '✨ Generate with AI'}
      </button>

      {/* Content editor */}
      <div className="relative">
        <textarea
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your tweet here or generate with AI above..."
          className="w-full bg-[#0f0f1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />
        <div className={`absolute bottom-3 right-4 text-xs font-bold ${isOverLimit ? 'text-red-400' : 'text-slate-600'}`}>
          {charCount}/280
        </div>
      </div>

      {/* Schedule input */}
      <div className="mt-4">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Schedule for (optional)
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          className="bg-[#0f0f1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => saveDraft('draft')}
          disabled={saving || !content.trim() || isOverLimit}
          className="flex items-center gap-2 bg-[#0f0f1a] border border-slate-700 hover:border-slate-500 text-slate-300 font-bold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-40"
        >
          Save Draft
        </button>

        {scheduledAt ? (
          <button
            onClick={() => saveDraft('scheduled')}
            disabled={saving || !content.trim() || isOverLimit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-40"
          >
            <Clock size={14} />
            Schedule Post
          </button>
        ) : (
          <button
            onClick={() => saveDraft('draft')}
            disabled={saving || !content.trim() || isOverLimit}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-40"
          >
            <Send size={14} />
            Add to Queue
          </button>
        )}
      </div>

      <p className="text-slate-600 text-xs mt-3">
        Posts go to your Queue. From there you can post now or let scheduled ones auto-fire via X native scheduler.
      </p>
    </div>
  )
}
