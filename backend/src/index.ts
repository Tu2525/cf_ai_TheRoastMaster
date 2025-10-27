import { DurableObject } from "cloudflare:workers";

/**
 * AI Roast Master Backend
 * This Worker uses Google Gemini API to analyze images and generate roasts
 */

import sounds from '../sounds.json';

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
			const soundList = sounds.map(s => `${s.name}: ${s.description}`).join('\n');
			const visionPrompt = `You are a blunt, honest, yet funny tech hiring manager, you make check how the user looks and make a remark about their looks, settings or clothing in a humorous way, keep it short.

Also, choose the most appropriate sound effect from this list based on the roast you give:

${soundList}

Respond with the roast first, then on a new line "Sound: [filename]"`;

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
			const fullText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text 
				|| "Looking good... I guess? Sound: Alert.mp3";

			// Parse roast and sound
			const parts = fullText.split('Sound: ');
			const roastText = parts[0].trim();
			const selectedSound = parts[1]?.trim() || 'Alert.mp3';

			// Ensure selected sound exists
			const soundExists = sounds.some(s => s.name === selectedSound);
			const finalSound = soundExists ? selectedSound : 'Alert.mp3';

			return addCorsHeaders(new Response(JSON.stringify({
				roast_text: roastText,
				audio_file: `https://pub-2e1d977b8e1344cf949f6a4c8dc4cb35.r2.dev/${finalSound}`
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
