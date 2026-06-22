export type AIProvider = 'openai' | 'gemini' | 'openrouter'

interface GenerateOptions {
  provider?: AIProvider
  apiKey: string
  model?: string
  systemPrompt: string
  userPrompt: string
  temperature?: number
}

export async function generateAIReply(options: GenerateOptions): Promise<string> {
  const { provider = 'openai', apiKey, model, systemPrompt, userPrompt, temperature = 0.9 } = options

  if (provider === 'openai' || provider === 'openrouter') {
    const baseURL = provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1'
      : 'https://api.openai.com/v1'
    const defaultModel = provider === 'openrouter' ? 'google/gemini-2.0-flash-001' : 'gpt-4o-mini'

    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || defaultModel,
        temperature,
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data.choices[0].message.content.trim()
  }

  if (provider === 'gemini') {
    const geminiModel = model || 'gemini-2.0-flash-001'
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature, maxOutputTokens: 200 }
        })
      }
    )
    const data = await res.json()
    return data.candidates[0].content.parts[0].text.trim()
  }

  throw new Error('Unsupported provider')
}
