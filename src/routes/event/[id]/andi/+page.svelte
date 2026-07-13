<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { subscribeToEvent, completeStep, uncompleteStep, updateEventSteps, markDelivered } from '$lib/firebase';
	import { calculatePrediction, getLateness } from '$lib/utils/prediction';
	import { getEscalation } from '$lib/utils/escalation';
	import { formatTime, formatCountdown } from '$lib/utils/time';
	import { requestNotificationPermission, notifyReminder } from '$lib/utils/notifications';
	import { startTracking, stopTracking } from '$lib/utils/geolocation';
	import { SUGGESTED_STEPS, type AndiEvent, type Step } from '$lib/types';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import PredictionDisplay from '$lib/components/PredictionDisplay.svelte';

	let event: AndiEvent | null = $state(null);
	let loading = $state(true);
	let showSuggestions = $state(false);
	let newStepLabel = $state('');
	let newStepDuration = $state(10);
	let trackingStarted = $state(false);

	onMount(() => {
		requestNotificationPermission();
		return () => stopTracking();
	});

	let prediction = $derived(event ? calculatePrediction(event) : null);
	let eventTime = $derived(event?.eventTime.toDate() ?? new Date());
	let lateness = $derived(event ? getLateness(event) : 0);
	let escalation = $derived(getEscalation(lateness));
	let countdown = $state('');

	$effect(() => {
		const eventId = page.params.id;
		const unsubscribe = subscribeToEvent(eventId, (e) => {
			event = e;
			loading = false;
		});
		return unsubscribe;
	});

	$effect(() => {
		const interval = setInterval(() => {
			countdown = formatCountdown(eventTime);
		}, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (event?.status === 'in_transit' && !trackingStarted) {
			trackingStarted = startTracking(page.params.id);
		}
	});

	async function toggleStep(index: number) {
		if (!event?.id) return;
		if (event.steps[index].completedAt) {
			await uncompleteStep(event.id, event.steps, index);
		} else {
			await completeStep(event.id, event.steps, index);
		}
	}

	async function addSuggestedStep(label: string, duration: number) {
		if (!event?.id) return;
		const newStep: Step = {
			id: crypto.randomUUID().slice(0, 8),
			label,
			durationMinutes: duration,
			completedAt: null
		};
		const lastUncompleted = event.steps.findLastIndex((s) => !s.completedAt);
		const insertIndex = lastUncompleted >= 0 ? lastUncompleted : event.steps.length - 1;
		const updated = [...event.steps];
		updated.splice(insertIndex, 0, newStep);
		await updateEventSteps(event.id, updated);
		showSuggestions = false;
	}

	async function addCustomStep() {
		if (!newStepLabel.trim() || !event?.id) return;
		await addSuggestedStep(newStepLabel.trim(), newStepDuration);
		newStepLabel = '';
		newStepDuration = 10;
	}

	async function removeStep(index: number) {
		if (!event?.id) return;
		const updated = event.steps.filter((_, i) => i !== index);
		await updateEventSteps(event.id, updated);
	}

	async function handleDelivered() {
		if (!event?.id) return;
		await markDelivered(event.id);
	}
</script>

<div class="max-w-lg mx-auto p-4 py-8 space-y-4">
	{#if loading}
		<div class="text-center py-20">
			<p class="text-gray-400 text-lg">Laden...</p>
		</div>
	{:else if !event}
		<div class="text-center py-20">
			<p class="text-red-500 text-lg">❌ Event nicht gefunden</p>
		</div>
	{:else}
		<!-- Header with escalation -->
		<div class="rounded-xl p-4 transition-all duration-500 {escalation.bgClass} {escalation.animate ? 'animate-pulse' : ''}">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg font-bold {escalation.textClass}">{event.name}</h1>
					{#if event.location}
						<p class="text-sm opacity-80 {escalation.textClass}">📍 {event.location}</p>
					{/if}
				</div>
				<div class="text-right">
					<p class="text-2xl font-black font-mono {escalation.textClass}">{countdown}</p>
					<p class="text-xs opacity-70 {escalation.textClass}">bis {formatTime(eventTime)}</p>
				</div>
			</div>
		</div>

		<StatusBar {event} />

		{#if prediction}
			<PredictionDisplay {prediction} />
		{/if}

		{#if event.status === 'delivered'}
			<div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
				<p class="text-4xl mb-2">🎉</p>
				<p class="text-xl font-bold text-green-700">Du bist da!</p>
			</div>
		{:else if event.status === 'in_transit'}
			<div class="bg-white rounded-xl p-6 shadow-sm text-center space-y-4">
				<p class="text-lg font-medium text-dhl-dark">🚗 Du bist unterwegs!</p>
				<button
					onclick={handleDelivered}
					class="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-600 transition-colors"
				>
					✅ Angekommen!
				</button>
			</div>
		{:else}
			<!-- Checklist -->
			<div class="bg-white rounded-xl p-4 shadow-sm">
				<h2 class="text-sm font-medium text-gray-500 uppercase mb-3">Deine To-Do-Liste</h2>
				<div class="space-y-2">
					{#each event.steps as step, i}
						<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
							<button
								onclick={() => toggleStep(i)}
								class="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
									{step.completedAt ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-dhl-yellow'}"
							>
								{#if step.completedAt}
									<span class="text-white text-sm">✓</span>
								{/if}
							</button>
							<span class="flex-1 {step.completedAt ? 'text-gray-400 line-through' : 'text-dhl-dark font-medium'}">
								{step.label}
							</span>
							<span class="text-xs text-gray-400">{step.durationMinutes}'</span>
							{#if !step.completedAt}
								<button
									onclick={() => removeStep(i)}
									class="text-red-300 hover:text-red-500 text-sm px-1"
								>
									✕
								</button>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Add step -->
				<div class="mt-4 pt-4 border-t border-gray-100">
					<button
						onclick={() => (showSuggestions = !showSuggestions)}
						class="text-sm text-dhl-dark font-medium hover:underline"
					>
						{showSuggestions ? '− Schließen' : '+ Schritt hinzufügen'}
					</button>

					{#if showSuggestions}
						<div class="mt-3 space-y-2">
							<!-- Suggestions -->
							<div class="flex flex-wrap gap-2">
								{#each SUGGESTED_STEPS as suggestion}
									<button
										onclick={() => addSuggestedStep(suggestion.label, suggestion.durationMinutes)}
										class="text-xs bg-gray-100 hover:bg-dhl-yellow/30 px-3 py-1.5 rounded-full transition-colors"
									>
										{suggestion.label} ({suggestion.durationMinutes}')
									</button>
								{/each}
							</div>

							<!-- Custom step -->
							<div class="flex gap-2 mt-3">
								<input
									type="text"
									bind:value={newStepLabel}
									placeholder="Eigener Schritt..."
									class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
								/>
								<input
									type="number"
									bind:value={newStepDuration}
									min="1"
									max="120"
									class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
								/>
								<button
									onclick={addCustomStep}
									disabled={!newStepLabel.trim()}
									class="px-3 py-2 bg-dhl-yellow text-dhl-dark rounded-lg text-sm font-medium disabled:opacity-50"
								>
									+
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div class="text-center pt-4">
			<a href="{base}/event/{page.params.id}" class="text-xs text-gray-400 hover:text-gray-600">
				← Freunde-Ansicht
			</a>
		</div>
	{/if}
</div>
