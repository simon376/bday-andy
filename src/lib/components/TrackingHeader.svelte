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
</script>

<div class="rounded-xl p-4 transition-all duration-500 {escalation.bgClass} {escalation.animationClass}">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs font-medium opacity-70 {escalation.textClass}">Sendungsnummer</p>
			<p class="font-mono font-bold text-sm {escalation.textClass}">{trackingNumber}</p>
		</div>
		<div class="text-right">
			<p class="text-xs font-medium opacity-70 {escalation.textClass}">Status</p>
			<p class="font-bold text-sm {escalation.textClass}">{escalation.message}</p>
		</div>
	</div>
</div>
