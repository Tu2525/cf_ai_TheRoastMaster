# AI Prompts for the AI Roast Master

This file documents the key prompts used to generate the code for the AI Roast Master project. The primary model used was GPT-4.1 after an initial planning and brainstorming session.

### **Phase 0: Initial Brainstorming & Planning**

**Prompt 0a (Project Idea):**

> "I have an assignment to build an AI app on Cloudflare using an LLM, a workflow, user input, and state. Would a chatbot with a facecam that sees the user, roasts them, and plays sounds be a creative and funny idea?"

**Prompt 0b (Workflow Plan):**

> "Okay, I like that idea. Give me a detailed Workflow plan for the 'AI Roast Master' and explain how the data will flow between the services."

**Prompt 0c (Data Sourcing):**

> "This bot needs a 'memory' of jokes. How can I get the prewritten jokes for the roast-a-pedia?"

**Prompt 0d (Full Project Plan):**

> "This is great. Now, give me a complete project plan with all the tasks on how to build it. Please separate the tasks into Backend and Frontend categories."

### **Phase 1: Project Setup & Structure**

**Prompt 1 (SvelteKit Frontend):**

> "I'm starting a new project for the Cloudflare internship. I need a SvelteKit frontend in a folder named `frontend`. Configure it to use `@sveltejs/adapter-cloudflare` so I can deploy it directly to Cloudflare Pages. Please provide the exact `svelte.config.js` file."

**Prompt 2 (Cloudflare Worker Backend):**

> "Now, create a `backend` folder and initialize a Cloudflare Worker inside it. I need the `src/index.ts` to be set up to handle a `POST` request, accept a JSON body (for a base64 image), and return a JSON response. Make sure it includes CORS headers to allow requests from any origin."

**Prompt 3 (Wrangler Config):**

> "I need to configure the `backend` worker. Can you generate a `wrangler.jsonc` file? It needs to bind an R2 bucket with the binding name `R2_BUCKET` for my sound effects."

### **Phase 2: Frontend Development (SvelteKit)**

**Prompt 4 (Webcam Component):**

> "For the `frontend`, create a Svelte component in `src/lib/Webcam.svelte`. It needs to request camera access when it mounts and display the live video in a `<video>` element. It also needs a public method called `captureFrameAsBase64()` that I can call from the parent page. This method should draw the current video frame to a canvas and return a base64 string of the image."

**Prompt 5 (Main UI Page Logic):**

> "Let's create the main UI in `frontend/src/routes/+page.svelte`. It should:
> 
> 1. Import and display the `Webcam.svelte` component.
>     
> 2. Have a 'Roast Me!' button and a loading spinner.
>     
> 3. When the button is clicked, it should call the `captureFrameAsBase64()` method on the webcam component.
>     
> 4. It should then `POST` this base64 image string to our backend worker's API.
>     
> 5. It needs to display the `roast_text` from the JSON response and play the `sound_url` (which will be a full URL from R2) using a new `Audio` object.
>     
> 6. When the `roast_text` is received, it must also be spoken aloud using the browser's `window.speechSynthesis` API."
>     

### **Phase 3: Backend AI Logic (Cloudflare Worker)**

**Prompt 6 (Sound Definitions):**

> "I have 9 sound effects. I need a `sounds.json` file for my backend worker to read. For each sound, I need a simple `name` (the filename, e.g., 'boom.mp3') and a `description` of what it sounds like or what emotion it conveys, so an AI can understand the context. Can you generate this file structure for me?"

**Prompt 7 (The Core AI Orchestration):**

> "This is the most important prompt for my `backend/src/index.ts`. I need the full worker code. It must:
> 
> 1. Get the `GEMINI_API_KEY` from the worker's secrets.
>     
> 2. Read the `sounds.json` file and store the list of sounds and their descriptions.
>     
> 3. Receive the base64 image string from the `POST` request.
>     
> 4. Call the Google Gemini Vision API (using a modern, fast model like `gemini-2.5-flash-preview-09-2025`).
>     
> 5. The prompt to Gemini must be very specific. It needs to:
>     
>     - Act as a 'witty, hilarious, and slightly mean roast comic.'
>         
>     - Look at the user's image, their expression, and their surroundings.
>         
>     - Generate a single-paragraph, personalized roast.
>         
>     - After writing the roast, it must _analyze its own roast_ and choose which sound _name_ from the list in `sounds.json` would be the funniest and most contextually appropriate.
>         
>     - It must return _only_ a valid JSON object with two keys: `roast_text` (the string) and `sound_name` (the chosen filename, e.g., 'boom.mp3').
>         
> 6. Finally, the worker needs to take the `sound_name` from the AI's response, build the full public R2 URL for it (I'll hardcode my R2 public URL), and return the final JSON `{ "roast_text": "...", "sound_url": "..." }` to the frontend."
>