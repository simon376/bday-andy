<script lang="ts">
	import type { AndiEvent } from '$lib/types';

	let { event }: { event: AndiEvent } = $props();

	const STATUSES = [
		{ key: 'announced', label: 'Angekündigt', icon: '📋' },
		{ key: 'preparing', label: 'Wird vorbereitet', icon: '🚿' },
		{ key: 'in_transit', label: 'In Zustellung', icon: '🚗' },
		{ key: 'delivered', label: 'Zugestellt', icon: '✅' }
	] as const;

	let currentIndex = $derived(STATUSES.findIndex((s) => s.key === event.status));
</script>

<div class="bg-white rounded-xl p-4 shadow-sm">
	<div class="flex items-center justify-between relative">
		<!-- Progress line -->
		<div class="absolute top-5 left-8 right-8 h-1 bg-gray-200 rounded-full">
			<div
				class="h-full bg-dhl-yellow rounded-full transition-all duration-700"
				style="width: {(currentIndex / (STATUSES.length - 1)) * 100}%"
			></div>
			<!-- Moving package indicator -->
			{#if currentIndex < STATUSES.length - 1}
				<div
					class="absolute -top-3 transition-all duration-700 text-lg"
					style="left: calc({(currentIndex / (STATUSES.length - 1)) * 100}% - 8px)"
				>
					📦
				</div>
			{/if}
		</div>

		{#each STATUSES as status, i}
			<div class="flex flex-col items-center z-10 relative">
				<div
					class="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500
						{i <= currentIndex ? 'bg-dhl-yellow scale-110' : 'bg-gray-200'}"
				>
					{status.icon}
				</div>
				<span class="text-xs mt-2 font-medium text-center max-w-[70px]
					{i <= currentIndex ? 'text-dhl-dark' : 'text-gray-400'}">
					{status.label}
				</span>
			</div>
		{/each}
	</div>
</div>
