<script lang="ts">
	import Webcam from '$lib/Webcam.svelte';

	let webcamComponent: Webcam;
	let videoElement: HTMLVideoElement | null = null;
	let roastText: string = '';
	let isLoading: boolean = false;
	let audioElement: HTMLAudioElement | null = null;
	let testMode: 'text' | 'image' = 'text';
	let textInput: string = '';

	// This will be your deployed worker URL
	// For now, we'll use a placeholder - you'll update this after deploying the backend
	const WORKER_URL = 'https://backend.theroastbot.workers.dev';

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

	async function handleTextRoast() {
		if (!textInput.trim()) {
			roastText = 'Please enter some text to roast!';
			return;
		}

		isLoading = true;
		roastText = '';

		try {
			console.log('Sending to:', WORKER_URL + '/text');
			console.log('Data:', { text: textInput });

			// Send text to backend
			const response = await fetch(WORKER_URL + '/text', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text: textInput })
			});

			console.log('Response status:', response.status);
			const data = await response.json();
			console.log('Response data:', data);

			if (data.error) {
				roastText = `Error: ${data.error}. ${data.note || ''}\n\nDetails: ${data.details || 'No details'}`;
			} else {
				roastText = data.roast_text || 'No roast generated';
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
	<h1>AI Roast Master</h1>
	<p class="subtitle">Prepare to be roasted by AI!</p>

	<div class="mode-selector">
		<button 
			class="mode-button" 
			class:active={testMode === 'text'}
			on:click={() => testMode = 'text'}
		>
			Text Mode
		</button>
		<button 
			class="mode-button" 
			class:active={testMode === 'image'}
			on:click={() => testMode = 'image'}
		>
			Camera Mode
		</button>
	</div>

	{#if testMode === 'text'}
		<div class="text-mode">
			<textarea 
				bind:value={textInput}
				placeholder="Describe yourself or enter anything you want roasted..."
				rows="4"
				disabled={isLoading}
			></textarea>
			<button on:click={handleTextRoast} disabled={isLoading} class="roast-button">
				{isLoading ? 'Roasting...' : 'Roast This!'}
			</button>
		</div>
	{:else}
		<div class="webcam-section">
			<Webcam bind:this={webcamComponent} bind:videoElement />
		</div>

		<div class="controls">
			<button on:click={handleRoastMe} disabled={isLoading} class="roast-button">
				{isLoading ? 'Roasting...' : 'Roast Me!'}
			</button>
		</div>
	{/if}

	{#if roastText}
		<div class="roast-display">
			<h2>Your Roast:</h2>
			<p>{roastText}</p>
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

	.mode-selector {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.mode-button {
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.3);
		color: white;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: bold;
		border-radius: 25px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.mode-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
	}

	.mode-button.active {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		border-color: transparent;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	.text-mode {
		max-width: 600px;
		margin: 0 auto;
	}

	textarea {
		width: 100%;
		padding: 1rem;
		font-size: 1rem;
		border-radius: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: white;
		resize: vertical;
		margin-bottom: 1rem;
		font-family: inherit;
	}

	textarea::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	textarea:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.15);
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

