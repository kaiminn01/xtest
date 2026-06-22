# X Test — Multi-Account Social Manager

Manage multiple X accounts with AI-powered content generation, scheduling, and voice profiles.

## Setup

### 1. Clone and install
```bash
git clone <your-repo>
cd xtest
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Copy your Project URL and anon key from Settings → API

### 3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Features
- ✅ Login / signup
- ✅ Add multiple X accounts (each with own AI config)
- ✅ Voice profiles per account (tone, topics, examples, avoid list)
- ✅ AI content generation (OpenAI / Gemini / OpenRouter)
- ✅ Post composer — tweet or reply mode
- ✅ Schedule posts with date/time picker
- ✅ Post queue — draft, scheduled, posted views
- ✅ Analytics per account
- ✅ Mark posts as posted
- ✅ Delete posts

## How posting works
This app manages your content queue. When you click "Post Now":
- It opens X in your browser at the compose/reply page
- You paste and send manually (or use your xquik extension)

Scheduled posts: use X's native scheduler — click schedule in the composer on X.
