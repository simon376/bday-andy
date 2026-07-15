<script lang="ts">
	import type { AndiEvent } from '$lib/types';
	import { getEscalation } from '$lib/utils/escalation';
	import { getLateness } from '$lib/utils/prediction';

	let { event }: { event: AndiEvent } = $props();

	let lateness = $derived(getLateness(event));
	let escalation = $derived(getEscalation(lateness));

	let trackingNumber = $derived(
		`AST-${event.createdAt?.toDate().getFullYear() ?? '2026'}-ANDI-${(event.id ?? '').slice(0, 4).toUpperCase()}`
	);

	let showEil = $derived(lateness > 0);
</script>

<div class="relative rounded-xl p-4 border-2 border-dashed transition-all duration-500 {escalation.bgClass} {escalation.animationClass}
	{lateness > 30 ? 'border-red-400' : lateness > 0 ? 'border-orange-300' : 'border-dhl-dark/30'}">

	<!-- Barcode decoration -->
	<div class="absolute top-2 right-3 flex gap-px opacity-30" aria-hidden="true">
		{#each Array(12) as _, i}
			<div class="h-6 {escalation.textClass}" style="width: {1 + (i % 3)}px; background: currentColor"></div>
		{/each}
	</div>

	<!-- EILSENDUNG stamp -->
	{#if showEil}
		<div class="absolute -top-2 -right-2 rotate-12 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
			{lateness > 60 ? '⚠️ VERMISST' : lateness > 30 ? 'VERSPÄTET' : 'EILSENDUNG'}
		</div>
	{/if}

	<div class="flex items-center justify-between pr-8">
		<div>
			<p class="text-[10px] font-medium opacity-60 uppercase tracking-widest {escalation.textClass}">Sendungsnr.</p>
			<p class="font-mono font-bold text-sm {escalation.textClass}">{trackingNumber}</p>
		</div>
		<div class="text-right">
			<p class="text-[10px] font-medium opacity-60 uppercase tracking-widest {escalation.textClass}">Status</p>
			<p class="font-bold text-sm {escalation.textClass}">{escalation.message}</p>
		</div>
	</div>

	<!-- Absender/Empfänger row -->
	<div class="flex justify-between mt-3 pt-2 border-t border-current/10">
		<div>
			<p class="text-[9px] uppercase tracking-wider opacity-50 {escalation.textClass}">Absender</p>
			<p class="text-xs font-medium {escalation.textClass}">Andis Couch 🛋️</p>
		</div>
		<div class="text-right">
			<p class="text-[9px] uppercase tracking-wider opacity-50 {escalation.textClass}">Empfänger</p>
			<p class="text-xs font-medium {escalation.textClass}">{event.location || 'Die Party 🎉'}</p>
		</div>
	</div>
</div>
