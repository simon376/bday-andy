<script lang="ts">
	import { base } from '$app/paths';
	import { getAllEvents } from '$lib/firebase';
	import { formatTime } from '$lib/utils/time';
	import type { AndiEvent } from '$lib/types';

	const statusLabels: Record<AndiEvent['status'], string> = {
		announced: '📋 Angekündigt',
		preparing: '🚿 Wird vorbereitet',
		in_transit: '🚗 Unterwegs',
		delivered: '✅ Zugestellt'
	};

	let events = $state(getAllEvents());
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
	<div class="bg-dhl-yellow rounded-2xl p-8 shadow-lg max-w-md w-full">
		<h1 class="text-4xl font-black text-dhl-dark mb-2">📦 Andi Tracker</h1>
		<p class="text-dhl-dark/70 text-lg mb-8">Sendungsverfolgung für chronisch Unpünktliche</p>

		<a
			href="{base}/create"
			class="block w-full bg-dhl-dark text-dhl-yellow font-bold py-4 px-6 rounded-xl text-lg hover:bg-gray-800 transition-colors"
		>
			Neues Event erstellen
		</a>
	</div>

	{#if events.length > 0}
		<div class="mt-8 max-w-md w-full space-y-3">
			<h2 class="text-sm font-medium text-gray-500 uppercase">Deine Events</h2>
			{#each events as event}
				<a
					href="{base}/event/{event.id}"
					class="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
				>
					<div class="flex items-center justify-between">
						<div>
							<p class="font-bold text-dhl-dark">{event.name}</p>
							<p class="text-sm text-gray-500">
								{event.eventTime.toDate().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
								· {formatTime(event.eventTime.toDate())}
							</p>
						</div>
						<span class="text-sm">{statusLabels[event.status]}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<div class="mt-6 max-w-md text-sm text-gray-400">
		<p class="font-medium">🕐 Was ist AST?</p>
		<p>
			<strong>Andi Standard Time</strong> — jede Zeit, die Andi nennt, plus 47 Minuten
			Realität. Wenn Andi "bin um 18 Uhr da" sagt, meint er 18:47 AST.
		</p>
	</div>
</div>
