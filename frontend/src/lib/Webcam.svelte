<script lang="ts">
	import { onMount } from 'svelte';

	export let videoElement: HTMLVideoElement | null = null;
	let stream: MediaStream | null = null;
	let error: string = '';

	onMount(async () => {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { width: 1280, height: 720 }
			});
			if (videoElement) {
				videoElement.srcObject = stream;
			}
		} catch (err) {
			error = 'Failed to access camera: ' + (err as Error).message;
			console.error('Error accessing camera:', err);
		}

		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	});

	export function captureFrame(): Blob | null {
		if (!videoElement) return null;

		const canvas = document.createElement('canvas');
		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;

		const ctx = canvas.getContext('2d');
		if (!ctx) return null;

		ctx.drawImage(videoElement, 0, 0);

		return new Promise((resolve) => {
			canvas.toBlob((blob) => {
				resolve(blob);
			}, 'image/jpeg', 0.95);
		});
	}
</script>

<div class="webcam-container">
	{#if error}
		<div class="error">{error}</div>
	{/if}
	<video bind:this={videoElement} autoplay playsinline class="video-feed" />
</div>

<style>
	.webcam-container {
		position: relative;
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.video-feed {
		width: 100%;
		height: auto;
		display: block;
		transform: scaleX(-1); /* Mirror the video */
	}

	.error {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(255, 0, 0, 0.9);
		color: white;
		padding: 1rem;
		border-radius: 8px;
		z-index: 10;
	}
</style>
