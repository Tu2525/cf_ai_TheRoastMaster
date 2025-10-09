Project Plan: The AI Roast Master (Backend & Frontend)
A step-by-step guide to building the AI Roast Master application on the Cloudflare stack, organized by backend and frontend responsibilities.

Part 1: Project-Wide Setup
Goal: Initialize the project structure, development environment, and version control.

[ ] Task 1: Environment & CLI

[ ] Log in to the Cloudflare CLI: wrangler login.

[ ] Task 2: Project Structure & Version Control

[ ] Create the main project directory: mkdir coludlareintern && cd coludlareintern.

[ ] In the root coludlareintern folder, initialize a Git repository: git init.

[ ] Create a corresponding repository on GitHub.

Part 2: Backend Tasks (Worker, AI, and State)
Goal: Build the serverless API and data pipeline that powers the application's intelligence. This covers the LLM, Workflow, and Memory/State requirements.

[ ] Task 1: Initialize Backend & Cloudflare Services (State/Memory)

[ ] Initialize the Worker backend: wrangler init backend.

[ ] Create a new Vectorize index in the Cloudflare dashboard.

[ ] Create a new R2 bucket in the Cloudflare dashboard.

[ ] Task 2: Data Population (State/Memory)

[ ] Generate or collect 200-300 jokes and structure them in a jokes.json file.

[ ] Write a one-time Node.js script to read jokes.json, generate an embedding for each joke, and upload it to your Vectorize index.

[ ] Find and download .mp3 sound effect files and upload them to your R2 bucket.

[ ] Task 3: Configure Worker Bindings

[ ] Open backend/wrangler.toml.

[ ] Add bindings for AI, your Vectorize Index, and your R2 Bucket.

[ ] Task 4: Implement Core AI Logic (LLM & Workflow)

[ ] In backend/src/index.ts:

[ ] Set up the Worker to handle POST requests and CORS headers.

[ ] Write the function to receive image data from the request body.

[ ] Add the code to call the Workers AI Vision model.

[ ] Add the code to query your Vectorize index using the labels from the vision model (RAG).

[ ] Add the code to assemble the final detailed prompt for Llama 3.

[ ] Add the code to call the Llama 3 model to get the roast.

[ ] Ensure the Worker returns a structured JSON object: { "roast_text": "...", "sound_effect": "..." }.

Part 3: Frontend Tasks (SvelteKit on Pages)
Goal: Build the user-facing interface for capturing webcam video and interacting with the AI. This covers the User Input requirement.

[ ] Task 1: Initialize Frontend

[ ] Initialize the SvelteKit frontend: npm create svelte@latest frontend.

[ ] Navigate into the frontend folder.

[ ] Install the Cloudflare adapter: npm i -D @sveltejs/adapter-cloudflare.

[ ] Update svelte.config.js to use the Cloudflare adapter.

[ ] Task 2: Build UI Components

[ ] In frontend/src/lib/, create a Webcam.svelte component.

[ ] Add logic to request camera access (onMount) and display the feed in a <video> element.

[ ] Edit the main page at frontend/src/routes/+page.svelte to import and use the Webcam.svelte component.

[ ] Add a "Roast Me!" button and a display area for the AI's response text.

[ ] Task 3: Implement Client-Side Logic

[ ] In +page.svelte, create a function that runs on button click.

[ ] This function should:

[ ] Capture a frame from the webcam.

[ ] Convert the frame to a Blob.

[ ] POST the Blob to your deployed Worker's URL using fetch.

[ ] Handle the JSON response to display the roast text.

[ ] Play the corresponding audio file from your R2 bucket.

Part 4: Final Integration & Deployment
Goal: Connect all pieces, deploy the application, and document the project.

[ ] Task 1: Test Locally

[ ] Run the backend locally: cd backend && wrangler dev.

[ ] Run the frontend locally: cd frontend && npm run dev.

[ ] Test the complete end-to-end flow to ensure everything works together.

[ ] Task 2: Deploy

[ ] Deploy your Worker: cd backend && wrangler deploy.

[ ] Connect your GitHub repository to Cloudflare Pages to set up CI/CD for the frontend.

[ ] Task 3: Document

[ ] Create a high-quality README.md in your project's root directory.

[ ] Include a link to the live demo, a project description, and an architecture overview.