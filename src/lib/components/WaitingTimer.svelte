<script lang="ts">
	import { getComparison, getAllApplicableComparisons } from '$lib/utils/comparisons';

	let { eventTime }: { eventTime: Date } = $props();

	let waitingMinutes = $state(0);
	let comparisonIndex = $state(0);
	let allComparisons = $derived(getAllApplicableComparisons(waitingMinutes));
	let comparison = $derived(allComparisons[comparisonIndex % allComparisons.length] ?? '');

	$effect(() => {
		const interval = setInterval(() => {
			const diff = (Date.now() - eventTime.getTime()) / 60_000;
			waitingMinutes = Math.max(0, Math.round(diff));
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (allComparisons.length <= 1) return;
		const interval = setInterval(() => {
			comparisonIndex++;
		}, 8000);
		return () => clearInterval(interval);
	});

	function formatWaiting(mins: number): string {
		if (mins < 60) return `${mins} Min.`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`;
	}
</script>

{#if waitingMinutes > 0}
	<div class="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-2">
		<p class="text-xs text-red-600/70 uppercase font-medium tracking-wide">Wartezeit</p>
		<p class="text-3xl font-black text-red-700">{formatWaiting(waitingMinutes)}</p>
		{#if comparison}
			<p class="text-sm text-red-500/80 italic transition-opacity duration-500">
				💡 {comparison}
			</p>
		{/if}
	</div>
{/if}
