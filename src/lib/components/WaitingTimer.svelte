<script lang="ts">
	import { getAllApplicableComparisons } from '$lib/utils/comparisons';
	import { getPassiveAggressiveTime, getRandomExcuse, getAndiRating, getFunFact } from '$lib/utils/humor';

	let { eventTime }: { eventTime: Date } = $props();

	let waitingMinutes = $state(0);
	let rotationIndex = $state(0);
	let allComparisons = $derived(getAllApplicableComparisons(waitingMinutes));
	let passiveAggressive = $derived(getPassiveAggressiveTime(waitingMinutes));
	let excuse = $derived(getRandomExcuse(rotationIndex));
	let rating = $derived(getAndiRating(rotationIndex));
	let funFact = $derived(getFunFact(rotationIndex));

	let rotatingItems = $derived([
		...allComparisons.map(c => `⏱️ ${c}`),
		`💬 Andi sagt gerade: ${excuse}`,
		`📦 Andi als Lieferdienst: ${rating}`,
		`🤓 ${funFact}`
	]);
	let currentItem = $derived(rotatingItems[rotationIndex % rotatingItems.length] ?? '');

	$effect(() => {
		const interval = setInterval(() => {
			const diff = (Date.now() - eventTime.getTime()) / 60_000;
			waitingMinutes = Math.max(0, Math.round(diff));
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (rotatingItems.length <= 1) return;
		const interval = setInterval(() => {
			rotationIndex++;
		}, 6000);
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
	<div class="bg-red-50 border border-red-200 rounded-xl p-5 text-center space-y-3">
		<p class="text-xs text-red-600/70 uppercase font-medium tracking-wide">Wartezeit</p>
		<p class="text-3xl font-black text-red-700">{formatWaiting(waitingMinutes)}</p>
		<p class="text-sm font-medium text-red-600/90">{passiveAggressive}</p>
		{#if currentItem}
			<p class="text-xs text-red-500/70 italic border-t border-red-100 pt-2 mt-2">
				{currentItem}
			</p>
		{/if}
	</div>
{/if}
