'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, XAccount } from '@/types'
import { Clock, Send, Trash2, ExternalLink, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  posts: Post[]
  account: XAccount
  onUpdate: () => void
}

const statusColor: Record<string, string> = {
  draft: 'bg-slate-700 text-slate-300',
  scheduled: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  posted: 'bg-green-500/20 text-green-300 border border-green-500/30',
  failed: 'bg-red-500/20 text-red-300 border border-red-500/30',
}

export default function PostQueue({ posts, account, onUpdate }: Props) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'posted'>('all')

  const filtered = posts.filter(p => filter === 'all' || p.status === filter)

  async function markPosted(id: string) {
    await supabase.from('posts').update({ status: 'posted', posted_at: new Date().toISOString() }).eq('id', id)
    onUpdate()
  }

  async function deletePost(id: string) {
    await supabase.from('posts').delete().eq('id', id)
    onUpdate()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-purple-400" />
          <div>
            <h2 className="text-white font-bold text-xl">Queue</h2>
            <p className="text-slate-500 text-sm">@{account.x_handle} · {posts.length} posts</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'draft', 'scheduled', 'posted'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-[#0f0f1a] border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <Clock size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No posts in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div
              key={post.id}
              className="bg-[#0f0f1a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md capitalize ${statusColor[post.status]}`}>
                    {post.status}
                  </span>
                  <span className="text-xs text-slate-600 capitalize">{post.post_type}</span>
                </div>
                <span className="text-xs text-slate-600">{formatDate(post.created_at)}</span>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-300 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

              {/* Scheduled time */}
              {post.scheduled_at && (
                <div className="flex items-center gap-1.5 text-xs text-blue-400 mb-3">
                  <Clock size={11} />
                  Scheduled for {formatDate(post.scheduled_at)}
                </div>
              )}

              {/* Reply URL */}
              {post.reply_to_url && (
                <a
                  href={post.reply_to_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mb-3 transition-colors"
                >
                  <ExternalLink size={11} />
                  View original tweet
                </a>
              )}

              {/* Actions */}
              {post.status !== 'posted' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                  {post.reply_to_url ? (
                    <a
                      href={post.reply_to_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markPosted(post.id)}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors"
                    >
                      <Send size={11} />
                      Open & Reply
                    </a>
                  ) : (
                    <a
                      href="https://x.com/compose/tweet"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markPosted(post.id)}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition-colors"
                    >
                      <Send size={11} />
                      Post Now
                    </a>
                  )}

                  <button
                    onClick={() => markPosted(post.id)}
                    className="flex items-center gap-1.5 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-300 font-bold px-3 py-2 rounded-lg text-xs transition-colors"
                  >
                    <CheckCircle size={11} />
                    Mark Posted
                  </button>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold px-3 py-2 rounded-lg text-xs transition-colors ml-auto"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
