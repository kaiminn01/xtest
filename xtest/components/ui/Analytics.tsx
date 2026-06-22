'use client'

import { Post, XAccount } from '@/types'
import { BarChart2, TrendingUp, MessageSquare, Heart, Repeat2 } from 'lucide-react'

interface Props {
  posts: Post[]
  account: XAccount
}

export default function Analytics({ posts, account }: Props) {
  const posted = posts.filter(p => p.status === 'posted')
  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')
  const replies = posts.filter(p => p.post_type === 'reply')
  const tweets = posts.filter(p => p.post_type === 'tweet')

  const totalLikes = posted.reduce((sum, p) => sum + (p.likes || 0), 0)
  const totalReplies = posted.reduce((sum, p) => sum + (p.replies || 0), 0)
  const totalReposts = posted.reduce((sum, p) => sum + (p.reposts || 0), 0)
  const totalImpressions = posted.reduce((sum, p) => sum + (p.impressions || 0), 0)

  const stats = [
    { label: 'Total Posted', value: posted.length, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Scheduled', value: scheduled.length, icon: BarChart2, color: 'text-blue-400' },
    { label: 'Drafts', value: drafts.length, icon: MessageSquare, color: 'text-slate-400' },
    { label: 'Replies', value: replies.length, icon: MessageSquare, color: 'text-green-400' },
    { label: 'Total Likes', value: totalLikes, icon: Heart, color: 'text-red-400' },
    { label: 'Total Reposts', value: totalReposts, icon: Repeat2, color: 'text-teal-400' },
  ]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <BarChart2 size={20} className="text-purple-400" />
        <div>
          <h2 className="text-white font-bold text-xl">Analytics</h2>
          <p className="text-slate-500 text-sm">@{account.x_handle} · {account.label}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#0f0f1a] border border-slate-800 rounded-xl p-4">
            <Icon size={16} className={`${color} mb-2`} />
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Content breakdown */}
      <div className="bg-[#0f0f1a] border border-slate-800 rounded-xl p-5 mb-4">
        <h3 className="text-white font-bold text-sm mb-4">Content Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Original Tweets</span>
            <span className="text-white font-bold text-sm">{tweets.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Replies</span>
            <span className="text-white font-bold text-sm">{replies.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Reply Rate</span>
            <span className="text-white font-bold text-sm">
              {posts.length > 0 ? Math.round((replies.length / posts.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0f0f1a] border border-slate-800 rounded-xl p-5">
        <h3 className="text-white font-bold text-sm mb-3">Learning Notes</h3>
        <p className="text-slate-500 text-xs leading-relaxed">
          As you post more and mark posts as posted, this section will surface what content type and timing is working best for @{account.x_handle}.
          For now, track your best performing posts manually and add notes in your Voice Profile.
        </p>
      </div>
    </div>
  )
}
