<script lang="ts">
	import { formatCountdown, formatTime, formatAST } from '$lib/utils/time';

	let { targetDate }: { targetDate: Date } = $props();

	let displayText = $state('');
	let isOverdue = $derived(new Date() > targetDate);

	$effect(() => {
		displayText = formatCountdown(targetDate);
		const interval = setInterval(() => {
			displayText = formatCountdown(targetDate);
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="text-center">
	{#if isOverdue}
		<p class="text-sm text-red-500 font-medium">Überfällig seit</p>
		<p class="text-3xl font-black text-red-600 font-mono">{displayText}</p>
	{:else}
		<p class="text-sm text-gray-500">Ankunft erwartet um</p>
		<p class="text-2xl font-bold text-dhl-dark">{formatTime(targetDate)}</p>
		<p class="text-xs text-gray-400">{formatAST(targetDate)}</p>
		<p class="text-lg font-mono text-dhl-dark/80 mt-1">in {displayText}</p>
	{/if}
</div>
