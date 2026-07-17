<script lang="ts">
	import type { Prediction } from '$lib/types';
	import { formatTime, formatAST } from '$lib/utils/time';

	let { prediction }: { prediction: Prediction } = $props();

	let confidenceColor = $derived(
		prediction.confidence > 70 ? 'text-green-600' :
		prediction.confidence > 40 ? 'text-yellow-600' :
		prediction.confidence > 0 ? 'text-red-600' :
		'text-red-800'
	);

	let barColor = $derived(
		prediction.confidence > 70 ? 'bg-green-500' :
		prediction.confidence > 40 ? 'bg-yellow-500' :
		'bg-red-500'
	);

	let barWidth = $derived(Math.max(0, Math.min(100, prediction.confidence)));
</script>

<div class="bg-white rounded-xl p-4 shadow-sm space-y-3">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs text-gray-500 uppercase font-medium">Voraussichtliche Ankunft</p>
			<p class="text-xl font-bold text-dhl-dark">
				{formatTime(prediction.etaTime)}
			</p>
			<p class="text-xs text-orange-500 font-medium">🕐 {formatAST(prediction.etaTime)}</p>
		</div>
		<div class="text-right">
			<p class="text-xs text-gray-500 uppercase font-medium">Pünktlichkeit</p>
			<p class="text-2xl font-black {confidenceColor}">{prediction.confidence}%</p>
		</div>
	</div>

	<!-- Confidence bar -->
	<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
		<div
			class="h-full rounded-full transition-all duration-700 {barColor}"
			style="width: {barWidth}%"
		></div>
	</div>

	{#if prediction.driftMinutes > 0}
		<p class="text-xs text-red-500">
			⚠️ Andi ist {prediction.driftMinutes} Min. hinter dem Zeitplan
		</p>
	{/if}

	{#if prediction.isLate}
		<p class="text-xs text-red-600 font-medium">
			📍 Erwartete Verspätung: ~{Math.round((prediction.etaTime.getTime() - Date.now()) / 60_000)} Min.
		</p>
	{/if}
</div>
