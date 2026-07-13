<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { subscribeToEvent } from '$lib/firebase';
	import { calculatePrediction, getLateness } from '$lib/utils/prediction';
	import { formatTime } from '$lib/utils/time';
	import { requestNotificationPermission, notifyStatusChange } from '$lib/utils/notifications';
	import type { AndiEvent } from '$lib/types';
	import StatusBar from '$lib/components/StatusBar.svelte';
	import TrackingHeader from '$lib/components/TrackingHeader.svelte';
	import Countdown from '$lib/components/Countdown.svelte';
	import WaitingTimer from '$lib/components/WaitingTimer.svelte';
	import PredictionDisplay from '$lib/components/PredictionDisplay.svelte';
	import Confetti from '$lib/components/Confetti.svelte';

	let event: AndiEvent | null = $state(null);
	let loading = $state(true);
	let lastStatus = $state('');

	let prediction = $derived(event ? calculatePrediction(event) : null);
	let eventTime = $derived(event?.eventTime.toDate() ?? new Date());
	let isOverdue = $derived(new Date() > eventTime && event?.status !== 'delivered');

	onMount(() => {
		requestNotificationPermission();
	});

	$effect(() => {
		const eventId = page.params.id;
		const unsubscribe = subscribeToEvent(eventId, (e) => {
			if (e && lastStatus && e.status !== lastStatus) {
				notifyStatusChange(e.status);
			}
			if (e) lastStatus = e.status;
			event = e;
			loading = false;
		});
		return unsubscribe;
	});
</script>

<div class="max-w-lg mx-auto p-4 py-8 space-y-4">
	{#if loading}
		<div class="text-center py-20">
			<p class="text-gray-400 text-lg">Sendung wird gesucht...</p>
		</div>
	{:else if !event}
		<div class="text-center py-20">
			<p class="text-red-500 text-lg">❌ Sendung nicht gefunden</p>
			<a href="{base}/" class="text-dhl-dark underline mt-4 block">Zurück zur Startseite</a>
		</div>
	{:else}
		<TrackingHeader {event} />

		<div class="bg-white rounded-xl p-4 shadow-sm">
			<h1 class="text-xl font-bold text-dhl-dark">{event.name}</h1>
			{#if event.location}
				<p class="text-sm text-gray-500">📍 {event.location}</p>
			{/if}
			<p class="text-sm text-gray-500">🕐 {formatTime(eventTime)}</p>
		</div>

		<StatusBar {event} />

		{#if event.status === 'delivered'}
			<div class="relative bg-green-50 border border-green-200 rounded-xl p-6 text-center overflow-hidden">
				<Confetti />
				<p class="text-4xl mb-2">🎉</p>
				<p class="text-xl font-bold text-green-700">Andi wurde erfolgreich zugestellt!</p>
			</div>
		{:else}
			{#if prediction}
				<PredictionDisplay {prediction} />
			{/if}

			<Countdown targetDate={eventTime} />

			{#if isOverdue}
				<WaitingTimer {eventTime} />
			{/if}

			<!-- Steps progress overview -->
			<div class="bg-white rounded-xl p-4 shadow-sm">
				<h2 class="text-sm font-medium text-gray-500 uppercase mb-3">Vorbereitungs-Fortschritt</h2>
				<div class="space-y-2">
					{#each event.steps as step}
						<div class="flex items-center gap-3">
							<div class="w-5 h-5 rounded-full border-2 flex items-center justify-center
								{step.completedAt ? 'bg-green-500 border-green-500' : 'border-gray-300'}">
								{#if step.completedAt}
									<span class="text-white text-xs">✓</span>
								{/if}
							</div>
							<span class="text-sm {step.completedAt ? 'text-gray-400 line-through' : 'text-dhl-dark'}">
								{step.label}
							</span>
							<span class="text-xs text-gray-400 ml-auto">{step.durationMinutes} Min.</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="text-center pt-4">
			<a href="{base}/event/{page.params.id}/andi" class="text-xs text-gray-400 hover:text-gray-600">
				Andi-Ansicht →
			</a>
		</div>
	{/if}
</div>
