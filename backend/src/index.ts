import { DurableObject } from "cloudflare:workers";

/**
 * AI Roast Master Backend
 * This Worker uses Google Gemini API to analyze images and generate roasts
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class MyDurableObject extends DurableObject {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

// Helper function to add CORS headers
function addCorsHeaders(response: Response): Response {
	const newResponse = new Response(response.body, response);
	newResponse.headers.set('Access-Control-Allow-Origin', '*');
	newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
	return newResponse;
}

// List of roast templates for variety
const roastTemplates = [
	"Wow, {description}. That's certainly... a choice.",
	"I've seen a lot in my time, but {description}? That's something special.",
	"Looking at you with {description} - bold strategy, let's see if it pays off.",
	"{description}... Did you lose a bet or is this your natural state?",
	"So we're just out here with {description} and calling it a day? Okay then.",
];

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return addCorsHeaders(new Response(null, { status: 204 }));
		}

		// Only accept POST requests
		if (request.method !== 'POST') {
			return addCorsHeaders(new Response('Method not allowed', { status: 405 }));
		}

		try {
			// Check for Gemini API key
			if (!env.GEMINI_API_KEY) {
				return addCorsHeaders(new Response(JSON.stringify({
					error: 'GEMINI_API_KEY not configured. Please set it as a secret.'
				}), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}));
			}

			const url = new URL(request.url);
			
			// Text-only mode for testing
			if (url.pathname === '/text') {
				const body: any = await request.json();
				const description = body.text || "something random";

				// Generate a roast using Gemini
				const roastPrompt = `You are a witty comedian. Create a funny, lighthearted roast based on: "${description}". Keep it short (2 sentences max), clever, and never mean-spirited.`;

				const geminiResponse = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							contents: [{
								role: 'user',
								parts: [{
									text: roastPrompt
								}]
							}]
						}),
					}
				);

				if (!geminiResponse.ok) {
					const errorText = await geminiResponse.text();
					console.error('Gemini API error:', errorText);
					return addCorsHeaders(new Response(JSON.stringify({
						error: 'Gemini API error',
						status: geminiResponse.status,
						details: errorText,
						note: 'Check your API key or quota. Also ensure model name and API version are correct.'
					}), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					}));
				}

				const geminiData: any = await geminiResponse.json();
				const roastText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text 
					|| roastTemplates[Math.floor(Math.random() * roastTemplates.length)].replace('{description}', description);

				return addCorsHeaders(new Response(JSON.stringify({
					roast_text: roastText,
					sound_effect: null,
					description: description
				}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}));
			}

			// Image mode - use Gemini Vision
			const imageData = await request.arrayBuffer();
			
			if (!imageData || imageData.byteLength === 0) {
				return addCorsHeaders(new Response(JSON.stringify({
					error: 'No image data provided'
				}), { 
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}));
			}

			// Convert image to base64
			const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageData)));

			// Use Gemini Pro Vision to analyze and roast
			const visionPrompt = "You are a witty comedian. Look at this image and create a funny, lighthearted roast about what you see. Keep it short (2-3 sentences), clever, and never mean-spirited. Focus on appearance, clothing, expression, or setting.";

			const geminiResponse = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						contents: [{
							role: 'user',
							parts: [
								{
									text: visionPrompt
								},
								{
									inline_data: {
										mime_type: "image/jpeg",
										data: base64Image
									}
								}
							]
						}]
					}),
				}
			);

			if (!geminiResponse.ok) {
				const errorText = await geminiResponse.text();
				console.error('Gemini Vision API error:', errorText);
				throw new Error(`Gemini Vision API failed: ${geminiResponse.status} - ${errorText}`);
			}

			const geminiData: any = await geminiResponse.json();
			const roastText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text 
				|| "Looking good... I guess?";

			return addCorsHeaders(new Response(JSON.stringify({
				roast_text: roastText,
				sound_effect: null,
				description: "Image analyzed by Gemini Vision"
			}), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}));

		} catch (error: any) {
			console.error('Error processing roast:', error);
			return addCorsHeaders(new Response(JSON.stringify({
				error: 'Failed to generate roast',
				details: error.message
			}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}));
		}
	},
} satisfies ExportedHandler<Env>;
