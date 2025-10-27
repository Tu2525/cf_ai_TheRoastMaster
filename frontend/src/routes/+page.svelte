<script lang="ts">
	import Webcam from '$lib/Webcam.svelte';

	let webcamComponent: Webcam;
	let videoElement: HTMLVideoElement | null = null;
	let roastText: string = '';
	let isLoading: boolean = false;
	let audioElement: HTMLAudioElement | null = null;
	let isSpeaking: boolean = false;
	let ttsAudio: HTMLAudioElement | null = null;

	const WORKER_URL = 'https://backend.theroastbot.workers.dev';

	async function handleRoastMe() {
		if (!webcamComponent) return;

		isLoading = true;
		roastText = '';

		try {
			// Capture frame from webcam
			const blob = await webcamComponent.captureFrame();
			if (!blob || blob.size === 0) {
				roastText = 'Failed to capture image from webcam';
				return;
			}

			// Send to backend
			const response = await fetch(WORKER_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'image/jpeg'
				},
				body: blob
			});

			if (!response.ok) {
				throw new Error('Failed to get roast from backend');
			}

			const data = await response.json();
			roastText = data.roast_text;

			// Play audio if provided
			if (data.audio_file && audioElement) {
				audioElement.src = data.audio_file;
				audioElement.play().catch(err => console.error('Error playing audio:', err));
			}

			// Automatically speak the roast
			setTimeout(() => {
				speakRoastAutomatic(data.roast_text);
			}, 500);
		} catch (error) {
			roastText = 'Error: ' + (error as Error).message;
			console.error('Error:', error);
		} finally {
			isLoading = false;
		}
	}

	function speakRoast() {
		// Remove markdown formatting for TTS
		const plainText = roastText
			.replace(/\*\*/g, '')
			.replace(/\*/g, '')
			.replace(/`/g, '')
			.replace(/__/g, '')
			.replace(/_/g, '')
			.replace(/\n/g, ' ');

		const utterance = new SpeechSynthesisUtterance(plainText);
		utterance.rate = 1;
		utterance.pitch = 1;
		utterance.volume = 1;

		utterance.onstart = () => {
			isSpeaking = true;
		};

		utterance.onend = () => {
			isSpeaking = false;
		};

		utterance.onerror = () => {
			isSpeaking = false;
		};

		speechSynthesis.speak(utterance);
	}

	function speakRoastAutomatic(text: string) {
		// Remove markdown formatting for TTS
		const plainText = text
			.replace(/\*\*/g, '')
			.replace(/\*/g, '')
			.replace(/`/g, '')
			.replace(/__/g, '')
			.replace(/_/g, '')
			.replace(/\n/g, ' ');

		isSpeaking = true;

		// Use Web Speech API
		fallbackToWebSpeech(plainText);
	}

	function fallbackToWebSpeech(text: string) {
		try {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1;
			utterance.pitch = 1;
			utterance.volume = 1;

			utterance.onstart = () => {
				isSpeaking = true;
			};

			utterance.onend = () => {
				isSpeaking = false;
			};

			utterance.onerror = () => {
				isSpeaking = false;
				console.error('Speech synthesis error');
			};

			speechSynthesis.speak(utterance);
		} catch (error) {
			console.error('Web Speech API error:', error);
			isSpeaking = false;
		}
	}

	function stopSpeaking() {
		speechSynthesis.cancel();
		isSpeaking = false;
	}

	function markdownToHtml(markdown: string): string {
		let html = markdown
			// Code blocks
			.replace(/```[\s\S]*?```/g, (match) => {
				const code = match.replace(/```/g, '').trim();
				return `<pre><code>${escapeHtml(code)}</code></pre>`;
			})
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') //bold
			.replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
			
			.replace(/`(.+?)`/g, '<code>$1</code>') // Inline code
			
			.replace(/### (.+?)(\n|$)/g, '<h3>$1</h3>') // Headings
			.replace(/## (.+?)(\n|$)/g, '<h2>$1</h2>') 
			.replace(/# (.+?)(\n|$)/g, '<h1>$1</h1>')
			.replace(/\n\n/g, '</p><p>') // Paragraphs
			.replace(/\n/g, '<br>'); // Line breaks
		
		return `<p>${html}</p>`;
	}

	function escapeHtml(text: string): string {
		const map: { [key: string]: string } = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, (m) => map[m]);
	}
</script>

<main>
	<h1>AI Roast Master</h1>
	<p class="subtitle">Prepare to be roasted by AI!</p>

	<div class="webcam-section">
		<Webcam bind:this={webcamComponent} bind:videoElement />
	</div>

	<div class="controls">
		<button on:click={handleRoastMe} disabled={isLoading || isSpeaking} class="roast-button">
			{isLoading ? 'Roasting...' : 'Roast Me!'}
		</button>
	</div>

	{#if roastText}
		<div class="roast-display">
			<h2>Your Roast:</h2>
			<div class="roast-content">
				{@html markdownToHtml(roastText)}
			</div>
			<div class="roast-controls">
			</div>
		</div>
	{/if}

	<audio bind:this={audioElement}></audio>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		color: white;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	.subtitle {
		font-size: 1.2rem;
		margin-bottom: 2rem;
		opacity: 0.9;
	}

	.webcam-section {
		margin: 2rem 0;
	}

	.controls {
		margin: 2rem 0;
	}

	.roast-button {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		border: none;
		color: white;
		padding: 1rem 3rem;
		font-size: 1.5rem;
		font-weight: bold;
		border-radius: 50px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.roast-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
	}

	.roast-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.roast-display {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 12px;
		padding: 2rem;
		margin-top: 2rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.roast-display h2 {
		margin-top: 0;
		color: #ffd700;
	}
</style>

