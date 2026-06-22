export interface XAccount {
  id: string
  user_id: string
  label: string
  x_handle: string
  avatar_url?: string
  ai_provider: 'openai' | 'gemini' | 'openrouter'
  ai_api_key: string
  ai_model: string
  created_at: string
}

export interface VoiceProfile {
  id: string
  account_id: string
  tone: string
  topics: string
  example_tweets: string
  avoid: string
  reference_accounts: string
  updated_at: string
}

export interface Post {
  id: string
  account_id: string
  content: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  post_type: 'tweet' | 'reply'
  reply_to_url?: string
  reply_to_text?: string
  scheduled_at?: string
  posted_at?: string
  likes?: number
  replies?: number
  reposts?: number
  impressions?: number
  created_at: string
}

export interface User {
  id: string
  email: string
}
