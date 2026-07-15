<script lang="ts">
	import { base } from '$app/paths';
	import { createEvent, Timestamp } from '$lib/firebase';
	import { DEFAULT_STEPS, type Step } from '$lib/types';

	let name = $state('');
	let date = $state('');
	let time = $state('');
	let location = $state('');
	let travelMinutes = $state(15);
	let isSubmitting = $state(false);

	let steps: { label: string; durationMinutes: number }[] = $state(
		DEFAULT_STEPS.map((s) => ({ ...s }))
	);

	function addStep() {
		steps.push({ label: '', durationMinutes: 10 });
	}

	function removeStep(index: number) {
		steps.splice(index, 1);
	}

	async function handleSubmit() {
		if (!name || !date || !time) return;

		isSubmitting = true;
		try {
			const eventTime = Timestamp.fromDate(new Date(`${date}T${time}`));
			const eventSteps: Step[] = steps
				.filter((s) => s.label.trim())
				.map((s) => ({
					id: crypto.randomUUID().slice(0, 8),
					label: s.label,
					durationMinutes: s.durationMinutes,
					completedAt: null
				}));

			const eventId = await createEvent({
				name,
				eventTime,
				location,
				travelMinutes,
				steps: eventSteps
			});

			window.location.href = `${base}/event/${eventId}/share`;
		} catch (error) {
			console.error('Failed to create event:', error);
			alert(`Fehler: ${error}`);
			isSubmitting = false;
		}
	}
</script>

<div class="max-w-lg mx-auto p-6 py-10">
	<a href="{base}/" class="text-dhl-dark/60 hover:text-dhl-dark text-sm mb-4 block">&larr; Zurück</a>

	<h1 class="text-2xl font-bold text-dhl-dark mb-6">📦 Neues Event erstellen</h1>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 mb-1">Event-Name</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				placeholder="Grillabend bei Max"
				required
				class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
			/>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="date" class="block text-sm font-medium text-gray-700 mb-1">Datum</label>
				<input
					id="date"
					type="date"
					bind:value={date}
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
				/>
			</div>
			<div>
				<label for="time" class="block text-sm font-medium text-gray-700 mb-1">Uhrzeit</label>
				<input
					id="time"
					type="time"
					bind:value={time}
					required
					class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
				/>
			</div>
		</div>

		<div>
			<label for="location" class="block text-sm font-medium text-gray-700 mb-1">Ort</label>
			<input
				id="location"
				type="text"
				bind:value={location}
				placeholder="Bei Max, Musterstr. 12"
				class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
			/>
		</div>

		<div>
			<label for="travel" class="block text-sm font-medium text-gray-700 mb-1">
				Pendelzeit (Minuten)
			</label>
			<input
				id="travel"
				type="number"
				bind:value={travelMinutes}
				min="0"
				max="180"
				class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
			/>
		</div>

		<div>
			<div class="flex items-center justify-between mb-2">
				<span class="block text-sm font-medium text-gray-700">Andis To-Do-Liste</span>
				<button
					type="button"
					onclick={addStep}
					class="text-sm text-dhl-dark font-medium hover:underline"
				>
					+ Schritt hinzufügen
				</button>
			</div>

			<div class="space-y-3">
				{#each steps as step, i}
					<div class="flex gap-2 items-center">
						<input
							type="text"
							bind:value={step.label}
							placeholder="Was muss Andi tun?"
							class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
						/>
						<input
							type="number"
							bind:value={step.durationMinutes}
							min="1"
							max="120"
							class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-dhl-yellow focus:border-transparent"
						/>
						<span class="text-xs text-gray-500">Min.</span>
						<button
							type="button"
							onclick={() => removeStep(i)}
							class="text-red-400 hover:text-red-600 text-lg px-1"
						>
							&times;
						</button>
					</div>
				{/each}
			</div>
		</div>

		<button
			type="submit"
			disabled={isSubmitting || !name || !date || !time}
			class="w-full bg-dhl-yellow text-dhl-dark font-bold py-4 px-6 rounded-xl text-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isSubmitting ? 'Wird erstellt...' : 'Event erstellen'}
		</button>
	</form>
</div>
