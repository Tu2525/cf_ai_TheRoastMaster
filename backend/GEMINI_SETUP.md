# Google Gemini API Setup

## Step 1: Get Your FREE Gemini API Key

1. **Go to**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click**: "Create API Key"
4. **Select**: Create API key in new project (or choose existing project)
5. **Copy** the API key (starts with `AIza...`)

## Step 2: Add the API Key as a Secret

```powershell
cd backend
wrangler secret put GEMINI_API_KEY
```
When prompted, paste your Gemini API key.

## Step 3: For Local Development

Create a `.dev.vars` file in the backend folder:
```
GEMINI_API_KEY=your_api_key_here
```

## Models Used (Both FREE):
- **Text**: `gemini-pro` - Fast text generation
- **Vision**: `gemini-1.5-flash` - Image understanding + text generation

## Free Tier Limits:
- 60 requests per minute
- 1,500 requests per day
- Completely free for personal projects!

## Test Your API Key:
```powershell
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" `
  -H "Content-Type: application/json" `
  -d '{"contents":[{"parts":[{"text":"Say hello!"}]}]}'
```
