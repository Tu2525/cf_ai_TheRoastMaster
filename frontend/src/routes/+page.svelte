<script lang="ts">
	import Webcam from '$lib/Webcam.svelte';

	let webcamComponent: Webcam;
	let videoElement: HTMLVideoElement | null = null;
	let roastText: string = '';
	let isLoading: boolean = false;
	let audioElement: HTMLAudioElement | null = null;

	// This will be your deployed worker URL
	// For now, we'll use a placeholder - you'll update this after deploying the backend
	const WORKER_URL = 'https://your-worker-name.your-account.workers.dev';

	async function handleRoastMe() {
		if (!webcamComponent) return;

		isLoading = true;
		roastText = '';

		try {
			// Capture frame from webcam
			const blob = await webcamComponent.captureFrame();
			if (!blob) {
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

			// Play sound effect if available
			if (data.sound_effect && audioElement) {
				audioElement.src = data.sound_effect;
				audioElement.play();
			}
		} catch (error) {
			roastText = 'Error: ' + (error as Error).message;
			console.error('Error:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<main>
	<h1>🔥 AI Roast Master 🔥</h1>
	<p class="subtitle">Prepare to be roasted by AI!</p>

	<div class="webcam-section">
		<Webcam bind:this={webcamComponent} bind:videoElement />
	</div>

	<div class="controls">
		<button on:click={handleRoastMe} disabled={isLoading} class="roast-button">
			{isLoading ? '🔥 Roasting...' : '🔥 Roast Me!'}
		</button>
	</div>

	{#if roastText}
		<div class="roast-display">
			<h2>Your Roast:</h2>
			<p>{roastText}</p>
		</div>
	{/if}

	<audio bind:this={audioElement} />
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

	.roast-display p {
		font-size: 1.2rem;
		line-height: 1.6;
		text-align: left;
	}
</style>

