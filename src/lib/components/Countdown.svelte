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

{#if !isOverdue}
	<div class="bg-white rounded-xl p-4 shadow-sm text-center">
		<div class="flex items-center justify-between">
			<div class="text-left">
				<p class="text-xs text-gray-500 uppercase font-medium">Vereinbart für</p>
				<p class="text-xl font-bold text-dhl-dark">{formatTime(targetDate)}</p>
				<p class="text-xs text-orange-500 font-medium">🕐 heißt auf Andi-Zeit eigentlich {formatAST(targetDate)}</p>
			</div>
			<div class="text-right">
				<p class="text-xs text-gray-500 uppercase font-medium">Countdown</p>
				<p class="text-xl font-bold font-mono text-dhl-dark">{displayText}</p>
			</div>
		</div>
	</div>
{/if}
