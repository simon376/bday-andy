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

<div class="bg-white rounded-xl p-4 shadow-sm text-center">
	{#if isOverdue}
		<p class="text-xs text-red-500/70 uppercase font-medium tracking-wide">Überfällig seit</p>
		<p class="text-3xl font-black text-red-600 font-mono mt-1">{displayText}</p>
	{:else}
		<div class="flex items-center justify-between">
			<div class="text-left">
				<p class="text-xs text-gray-500 uppercase font-medium">Erwartet um</p>
				<p class="text-xl font-bold text-dhl-dark">{formatTime(targetDate)}</p>
				<p class="text-xs text-gray-400">{formatAST(targetDate)}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-gray-500 uppercase font-medium">Countdown</p>
				<p class="text-xl font-bold font-mono text-dhl-dark">{displayText}</p>
			</div>
		</div>
	{/if}
</div>
