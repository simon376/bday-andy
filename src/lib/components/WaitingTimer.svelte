<script lang="ts">
	import { getComparison } from '$lib/utils/comparisons';

	let { eventTime }: { eventTime: Date } = $props();

	let waitingMinutes = $state(0);
	let comparison = $derived(getComparison(waitingMinutes));

	$effect(() => {
		const interval = setInterval(() => {
			const diff = (Date.now() - eventTime.getTime()) / 60_000;
			waitingMinutes = Math.max(0, Math.round(diff));
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

{#if waitingMinutes > 0}
	<div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
		<p class="text-sm text-red-600 font-medium">Wartezeit</p>
		<p class="text-2xl font-black text-red-700">{waitingMinutes} Min.</p>
		<p class="text-sm text-red-500/80 mt-2 italic">{comparison}</p>
	</div>
{/if}
