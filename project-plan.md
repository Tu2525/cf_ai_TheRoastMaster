Project Plan: The AI Roast Master (Cloudflare + Google Gemini)
A step-by-step guide to building the AI Roast Master application using the Cloudflare stack for infrastructure and a free external AI provider.

Part 1: Project-Wide Setup
Goal: Initialize the project structure, accounts, and version control.

Task 1: Account & CLI Setup

[  x  ] Create a free Cloudflare account.

[  x  ] Create a free Google AI Studio account and get an API key.

[  x  ] Install the Cloudflare CLI: npm i -g wrangler.

[  x  ] Log in to the Cloudflare CLI: wrangler login.

Task 2: Project Structure & Version Control

[  x  ] Create the main project directory: mkdir coludlareintern && cd coludlareintern.

[  x  ] In the root coludlareintern folder, initialize a Git repository: git init.

[ ] Create a corresponding repository on GitHub.

Part 2: Backend Tasks (Cloudflare Workers)
Goal: Build the serverless API and data pipeline that powers the application's intelligence.

Task 1: Initialize Backend Services (State/Memory)

[  x  ] Initialize the Worker backend: wrangler init backend.

[ ] In the Cloudflare dashboard, create a new Vectorize index.

[ ] In the Cloudflare dashboard, create a new R2 bucket.

Task 2: Data Population (State/Memory)

[ ] Generate or collect 200-300 jokes and structure them in a jokes.json file.

[ ] Write a one-time Node.js script to:

[ ] Read jokes.json.

[ ] Use the Google Gemini API to generate an embedding for each joke.

[ ] Upload the joke text and its embedding to your Cloudflare Vectorize database.

[ ] Find and download .mp3 sound effect files and upload them to your Cloudflare R2 bucket.

Task 3: Implement Core AI Logic (LLM & Workflow)

[ ] Open backend/wrangler.toml and add bindings for your Vectorize Index and R2 Bucket.

[ ] In backend/src/index.ts:

[  x  ] Set up the Worker to handle POST requests and CORS headers.

[  x  ] Securely add your Google AI API key as a secret: wrangler secret put GEMINI_API_KEY.

[  x  ] Receive the image data from the request body.

[ ] Use the Google Gemini API to generate an embedding for a descriptive query based on the image.

[ ] Query your Cloudflare Vectorize database to retrieve relevant jokes (RAG).

[ ] Assemble the final detailed prompt for the Gemini Pro Vision model, including the user's image and the retrieved jokes.

[  x  ] Call the Gemini Pro Vision API from the worker to get the final roast text and suggested sound effect.

[  x  ] Return the response as a structured JSON object: { "roast_text": "...", "sound_effect": "..." }.

Part 3: Frontend Tasks (SvelteKit on Cloudflare Pages)
Goal: Build the user-facing interface for capturing webcam video and interacting with the AI.

Task 1: Initialize Frontend

[  x  ] Initialize the SvelteKit frontend: npm create svelte@latest frontend.

[  x  ] Navigate into the frontend folder and install the Cloudflare adapter: npm i -D @sveltejs/adapter-cloudflare.

[  x  ] Update svelte.config.js to use the Cloudflare adapter.

Task 2: Build UI Components

[  x  ] In frontend/src/lib/, create a Webcam.svelte component.

[  x  ] Add logic to request camera access (onMount) and display the feed in a <video> element.

[  x  ] Edit the main page at frontend/src/routes/+page.svelte to import and use the Webcam.svelte component.

[  x  ] Add a "Roast Me!" button and a display area for the AI's response text.

Task 3: Implement Client-Side Logic

[  x  ] In +page.svelte, create a function that runs on button click.

[  x  ] This function should:

[  x  ] Capture a frame from the webcam.

[  x  ] Convert the frame to a base64 string.

[  x  ] POST the image data to your deployed Cloudflare Worker's URL.

[  x  ] Handle the JSON response to display the roast text.

[ ] Play the corresponding audio file from your Cloudflare R2 bucket's public URL.

Part 4: Final Integration & Deployment
Goal: Connect all pieces, deploy the application, and document the project.

Task 1: Test Locally

[ ] Run your backend locally: cd backend && wrangler dev.

[ ] Run your frontend locally: cd frontend && npm run dev.

[ ] Test the complete end-to-end flow to ensure everything works together.

Task 2: Deploy

[  x  ] Deploy your Worker: cd backend && wrangler deploy.

[ ] Connect your GitHub repository to Cloudflare Pages to set up CI/CD for the frontend.

Task 3: Document

[ ] Create a high-quality README.md in your project's root directory.

[ ] Include a link to the live demo, a project description, and an architecture overview.