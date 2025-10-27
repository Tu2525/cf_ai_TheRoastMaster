# AI Roast Master

Ever wondered what an AI _really_ thinks of you? Now you can find out.

The **AI Roast Master** is an AI-powered bot that uses Google's Gemini Vision API to take one good look at your webcam feed and serve up a hilarious, personalized roast. To add insult to injury, it analyzes the roast it just wrote to pick the perfect contextual sound effect and plays it back with automatic text-to-speech.

This project was built for the **Cloudflare 2026 AI Internship program** and runs entirely on the Cloudflare developer platform.

## Features

- **AI Vision Analysis**: Uses Gemini Vision to analyze your appearance, expression, and surroundings to generate a _truly_ personal roast.
- **Smart Comedic Timing**: An AI model analyzes the roast's content to select the perfect contextual sound effect from a curated library of 9 sounds.
- **Automatic Text-to-Speech**: Roasts are spoken aloud using the browser's native Web Speech API for instant feedback.
- **Real-time Webcam**: Instantly capture and analyze images with a single click.
- **100% Cloudflare Stack**: Built on Workers, Pages, and R2 for a serverless, globally-performant, and infinitely scalable application.

## Architecture

- **Frontend**: A sleek SvelteKit UI deployed on **Cloudflare Pages**.
- **Backend API**: A serverless **Cloudflare Worker** that handles image processing and orchestrates the AI API calls.
- **Media Storage**: Sound effects are hosted in a **Cloudflare R2** bucket for low-latency, high-speed delivery.
- **The "Brain"**: Google's **Gemini 2.5 Flash** for a powerful, single-call vision-and-text generation model.

## Quick Deploy

### Prerequisites

1. **Cloudflare Account**: You'll need one to deploy.
2. **Wrangler CLI**: The official Cloudflare CLI.

```
npm install -g wrangler
```

3. **Node.js**: Version 18+ is recommended.
4. **Git**: For cloning the repository.

### 1. Clone & Setup

```
git clone <my url>
```

### 2. Configure Wrangler

Log in to your Cloudflare account from your terminal:

```
wrangler auth login
```

### 3. Set up Gemini API Key

Get your Google AI API key from [Google AI Studio](https://aistudio.google.com/app/api-keys "null").

```
# Set the secret in your backend Worker
cd backend
wrangler secret put GEMINI_API_KEY
# Paste your API key when prompted
```

### 4. Create R2 Bucket & Upload Sounds

This app uses 9 sound effects that the AI chooses from. You need to upload them to your own R2 bucket.

First, create the bucket (replace `my-roast-bucket` with your unique name):

```
wrangler r2 bucket create my-roast-bucket
```

Then, upload all the sound files (this assumes you're in the `backend` directory):

```
# Replace 'my-roast-bucket' with your bucket name
wrangler r2 object put my-roast-bucket/Alert.mp3 --file ../Sounds/Alert.mp3
wrangler r2 object put my-roast-bucket/boom.mp3 --file ../Sounds/boom.mp3
wrangler r2 object put my-roast-bucket/ClownSliding.mp3 --file ../Sounds/ClownSliding.mp3
wrangler r2 object put my-roast-bucket/FAAHHH.mp3 --file ../Sounds/FAAHHH.mp3
wrangler r2 object put my-roast-bucket/kitchennightmare.mp3 --file ../Sounds/kitchennightmare.mp3
wrangler r2 object put my-roast-bucket/OhioScream.mp3 --file ../Sounds/OhioScream.mp3
wrangler r2 object put my-roast-bucket/OhMyGod.mp3 --file ../Sounds/OhMyGod.mp3
wrangler r2 object put my-roast-bucket/wotthehell.mp3 --file ../Sounds/wotthehell.mp3
wrangler r2 object put my-roast-bucket/ZeldaFloat.mp3 --file ../Sounds/ZeldaFloat.mp3
```

### 5. Configure R2 Public Access

You'll need a public URL for your R2 bucket.

1. Go to your Cloudflare Dashboard → R2 → Your Bucket → Settings.
2. Find the "Public URL" section and either **Allow Access** on your `r2.dev` domain or connect a custom domain. Note your public URL.
3. We also need to set a bucket policy to allow public reads.

Add this policy to your bucket's "Settings" page (under "Bucket Policy"):

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

_Don't forget to replace `YOUR_BUCKET_NAME` with your actual bucket name._

### 6. Update Sound URLs

In `backend/src/index.ts`, update the `audio_file` URL to point to your public R2 bucket URL.

```
// Example:
audio_file: `https://your-public-r2-url.com/${finalSound}`
```

### 7. Deploy Backend

```
cd backend
wrangler deploy
```

### 8. Deploy Frontend

```
cd ../frontend
npm install
npm run build
npx wrangler pages deploy build
```

## Usage

1. Open the deployed frontend URL provided by the Pages deploy.
2. Allow camera access when your browser prompts you.
3. Click "Roast Me!" to capture and analyze your image.
4. Listen to your custom-generated roast, complete with a perfectly timed sound effect.

## Development

### Local Development

You can run both the backend and frontend locally for development.

```
# In your 'backend' directory
wrangler dev
```

```
# In a new terminal, in your 'frontend' directory
npm run dev
```

### Project Structure

```
├── backend/
│   ├── src/index.ts   # Main Cloudflare Worker logic (API, AI orchestration)
│   ├── sounds.json    # Sound effect definitions for the AI
│   └── wrangler.jsonc # Worker configuration
├── frontend/
│   ├── src/
│   │   ├── routes/+page.svelte  # The main UI page
│   │   └── lib/Webcam.svelte    # Webcam component
│   └── svelte.config.js         # SvelteKit config (using static adapter)
└── Sounds/
    └── ... (9 .mp3 files)
```

## Initial Plans

The plan I had in mind was to make a "Roast-a-pedia" where, I going to eventually fine-tune it to an LLM, but the entire situation would have been 10x complicated for a simple project.


## AI Design Rationale

This section details the AI-related design choices for this project and outlines how it could be expanded using more of Cloudflare's AI and stateful services, as suggested in the internship prompt.

### LLM (Large Language Model)

- **Current Implementation**: Google Gemini 2.5 Flash.
- **Rationale**: I chose Gemini's vision model because it provides a powerful, all-in-one solution. It can perform image analysis, text generation (the roast), and structured JSON output (the sound effect choice) in a single, fast API call. This simplified the backend orchestration significantly and was ideal for a rapid prototype.
- **Potential Enhancement**: The clear next step would be to move all AI processing onto Cloudflare's infrastructure. I would replace the external API call with **Workers AI**. The flow would be to first use a Workers AI vision model (like `resnet-50`) to get image embeddings, then pass those embeddings along with a text prompt to a powerful LLM like **`llama-3-8b-instruct`** for the roast generation. This would reduce latency, make me able to introduce a proper [RAG](https://www.wikiwand.com/en/articles/Retrieval-augmented_generation) system and keep all data within the Cloudflare ecosystem.

### Workflow / Coordination

- **Current Implementation**: A single **Cloudflare Worker**.
- **Rationale**: For this application, the logic is a simple request-response flow: User uploads image -> Worker calls AI -> Worker returns JSON. A single Worker is the most efficient, low-latency, and simplest tool for this job.
- **Potential Enhancement**: If the app grew more complex, I would move this logic to **Cloudflare Workflows**. For example, a workflow could manage a multi-step process: 1) Run the image through a Workers AI moderation model. 2) If clear, get image embeddings. 3) Pass embeddings and a prompt to Llama. 4) Get the text and pass it to a _second_ AI call to choose the sound. Workflows would be perfect for orchestrating this chain and handling retries.

### User Input

- **Current Implementation**: Webcam capture on a **Cloudflare Pages** frontend.
- **Rationale**: This is the most direct and engaging way for a "roast bot" to get input. It's visual, personal, and simple for the user.
- **Potential Enhancement**: A chat interface (also on Pages) would be a great addition, allowing users to get text-only roasts. For a more advanced feature, I would use **Cloudflare Realtime** to stream audio from the user's microphone, transcribe it with a Workers AI speech-to-text model, and allow for voice-based roasts.

### Memory / State

- **Current Implementation**: Stateless.
- **Rationale**: The app is currently a fun, one-shot demo. Each roast is independent, which requires no state, ensures maximum scalability, and the least amount of cost on my end.
- **Potential Enhancement**: This is the biggest area for improvement. I would use **Durable Objects** to add memory. A Durable Object, tied to a user's session or login, could store their "roast history." This would allow the AI to remember past roasts (to avoid repeats) and even track user preferences. I also considered building a [RAG](https://www.wikiwand.com/en/articles/Retrieval-augmented_generation) system using **Vectorize** to give the AI memory of _all_ past roasts, helping it generate more novel or context-aware content.

### Text-to-Speech

- **Current Implementation**: Browser's Web Speech API.
- **Rationale**: This is a client-side, zero-cost, and zero-latency solution. It's universally supported and requires no backend resources, and having a robotic voice give you awful roasts is funny.
- **Potential Enhancement**: The downside is that the voice varies by browser and OS. I would use a **Workers AI** text-to-speech model. The workflow would be: 1) AI generates roast text. 2) Worker sends text to the TTS model. 3) The resulting audio is cached permanently in **R2**. This would provide a consistent, high-quality "voice" for the bot, served at the edge, thought about using NeuTTS but, would have needed a server for it, again too much cost for a one-shot project.