<script lang="ts">
	import { onMount } from 'svelte';

	const colors = ['#FFCC00', '#F5A623', '#E8860A', '#FFD700', '#FF8C00', '#FFC200'];

	interface Particle {
		id: number;
		x: number;
		color: string;
		size: number;
		duration: number;
		delay: number;
		drift: number;
		rotation: number;
	}

	let particles: Particle[] = [];

	onMount(() => {
		particles = Array.from({ length: 30 }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			color: colors[Math.floor(Math.random() * colors.length)],
			size: 6 + Math.random() * 8,
			duration: 2 + Math.random() * 1.5,
			delay: Math.random() * 1.2,
			drift: (Math.random() - 0.5) * 60,
			rotation: Math.random() * 360
		}));
	});
</script>

<div class="confetti-container" aria-hidden="true">
	{#each particles as p (p.id)}
		<div
			class="particle"
			style="
				left: {p.x}%;
				width: {p.size}px;
				height: {p.size}px;
				background-color: {p.color};
				animation-duration: {p.duration}s;
				animation-delay: {p.delay}s;
				--drift: {p.drift}px;
				--rot: {p.rotation}deg;
			"
		></div>
	{/each}
</div>

<style>
	.confetti-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		top: -12px;
		border-radius: 2px;
		opacity: 0;
		animation: fall linear forwards;
	}

	@keyframes fall {
		0% {
			transform: translateY(0) translateX(0) rotate(0deg);
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(320px) translateX(var(--drift)) rotate(calc(var(--rot) + 360deg));
			opacity: 0.8;
		}
	}
</style>
