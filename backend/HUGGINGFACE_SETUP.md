# How to Get Your Hugging Face Token

## Step 1: Create Account
1. Go to https://huggingface.co/
2. Click "Sign Up" (top right)
3. Create a free account

## Step 2: Generate Token
1. Once logged in, go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Give it a name (e.g., "roast-master")
4. Select "Read" access type
5. Click "Generate"
6. **Copy the token** (it starts with `hf_...`)

## Step 3: Add Token to Worker
```powershell
cd backend
wrangler secret put HUGGINGFACE_TOKEN
```
When prompted, paste your token

## Step 4: Test Your Token
You can test if your token works by running:
```powershell
curl -X POST https://api-inference.huggingface.co/models/google/flan-t5-base `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{"inputs": "Hello, how are you?"}'
```

If it works, you'll get a JSON response back!

## Models We're Using (All Free):
- **Text Generation**: `google/flan-t5-large` - Fast and reliable
- **Image Captioning**: `Salesforce/blip-image-captioning-base` - Describes images

Both models are completely free to use with the Inference API!
