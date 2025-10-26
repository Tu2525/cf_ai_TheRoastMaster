# Backend Setup Instructions

## Hugging Face API Token

This backend uses Hugging Face's free Inference API instead of Cloudflare Workers AI to save costs.

### Steps to set up:

1. **Get a Hugging Face Token** (FREE):
   - Go to https://huggingface.co/
   - Sign up for a free account (if you don't have one)
   - Go to Settings > Access Tokens: https://huggingface.co/settings/tokens
   - Create a new token with "Read" access
   - Copy the token

2. **Add the token as a Cloudflare Worker secret**:
   ```powershell
   cd backend
   wrangler secret put HUGGINGFACE_TOKEN
   ```
   - Paste your Hugging Face token when prompted

3. **For local development**, create a `.dev.vars` file:
   ```powershell
   echo "HUGGINGFACE_TOKEN=your_token_here" > .dev.vars
   ```
   Replace `your_token_here` with your actual token.

4. **Deploy**:
   ```powershell
   npm run deploy
   ```

## Models Used

- **Vision Model**: `Salesforce/blip-image-captioning-large` (Free)
- **Text Model**: `mistralai/Mistral-7B-Instruct-v0.2` (Free)

Both models are available on Hugging Face's free Inference API tier.
