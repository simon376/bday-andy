<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}
	});
</script>

<svelte:head>
	<title>Andi Tracker</title>
	<meta name="description" content="Paket-Tracking für Andi — wird er pünktlich sein?" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-gray-50 font-sans">
	{@render children()}
</div>
