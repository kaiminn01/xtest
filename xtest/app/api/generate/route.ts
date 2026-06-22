import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { generateAIReply } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { accountId, mode, topic, replyText } = await req.json()

    // Get account config
    const { data: account, error: accErr } = await supabaseAdmin
      .from('x_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (accErr || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Get voice profile
    const { data: voice } = await supabaseAdmin
      .from('voice_profiles')
      .select('*')
      .eq('account_id', accountId)
      .single()

    // Build system prompt from voice profile
    const systemPrompt = voice
      ? `You are a social media expert writing tweets for @${account.x_handle}.

TONE & STYLE: ${voice.tone || 'casual, authentic, engaging'}
TOPICS: ${voice.topics || 'general'}
WHAT TO AVOID: ${voice.avoid || 'nothing specific'}
REFERENCE STYLE: ${voice.example_tweets ? `Here are example tweets that match the right style:\n${voice.example_tweets}` : 'Be natural and authentic'}

RULES:
- Match the tone and style exactly
- Keep it under 280 characters
- Sound human, not AI-generated
- No generic openers
- Write only the tweet text, nothing else`
      : `You are writing tweets for @${account.x_handle}. Be natural, engaging, and human. Under 280 characters. Write only the tweet text.`

    const userPrompt = mode === 'reply'
      ? `Write a reply to this tweet:\n\n"${replyText || 'No tweet text provided'}"`
      : `Write a tweet about: ${topic || 'something interesting and engaging relevant to my niche'}`

    const content = await generateAIReply({
      provider: account.ai_provider,
      apiKey: account.ai_api_key,
      model: account.ai_model,
      systemPrompt,
      userPrompt,
      temperature: 0.9,
    })

    return NextResponse.json({ content })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
