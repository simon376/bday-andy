<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';

	let copied = $state('');
	let canShare = $state(false);

	const eventId = $derived(page.params.id);
	const origin = $derived(typeof window !== 'undefined' ? window.location.origin : '');
	const friendsLink = $derived(`${origin}${base}/event/${eventId}`);
	const andiLink = $derived(`${origin}${base}/event/${eventId}/andi`);

	$effect(() => {
		canShare = typeof navigator !== 'undefined' && !!navigator.share;
	});

	async function copyLink(link: string, which: string) {
		await navigator.clipboard.writeText(link);
		copied = which;
		setTimeout(() => (copied = ''), 2000);
	}

	async function shareLink(link: string, title: string) {
		await navigator.share({ title, url: link });
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-6 text-center">
	<div class="max-w-md w-full space-y-6">
		<div class="bg-green-50 border border-green-200 rounded-2xl p-8">
			<p class="text-4xl mb-3">🎉</p>
			<h1 class="text-2xl font-bold text-green-800 mb-2">Event erstellt!</h1>
			<p class="text-green-700">Teile jetzt die Links mit deinen Freunden und Andi.</p>
		</div>

		<div class="bg-white rounded-xl p-5 shadow-sm text-left space-y-4">
			<div>
				<p class="text-sm font-medium text-gray-500 mb-1">👥 Link für Freunde</p>
				<div class="flex gap-2">
					<input
						type="text"
						value={friendsLink}
						readonly
						class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono truncate"
					/>
					<button
						onclick={() => copyLink(friendsLink, 'friends')}
						class="px-4 py-2 bg-dhl-yellow text-dhl-dark font-medium rounded-lg text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap"
					>
						{copied === 'friends' ? '✓ Kopiert!' : 'Kopieren'}
					</button>
					{#if canShare}
						<button
							onclick={() => shareLink(friendsLink, '📦 Andi Tracker — Sendungsverfolgung')}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
						>
							📤
						</button>
					{/if}
				</div>
			</div>

			<div>
				<p class="text-sm font-medium text-gray-500 mb-1">🏃 Link für Andi</p>
				<div class="flex gap-2">
					<input
						type="text"
						value={andiLink}
						readonly
						class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono truncate"
					/>
					<button
						onclick={() => copyLink(andiLink, 'andi')}
						class="px-4 py-2 bg-dhl-yellow text-dhl-dark font-medium rounded-lg text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap"
					>
						{copied === 'andi' ? '✓ Kopiert!' : 'Kopieren'}
					</button>
					{#if canShare}
						<button
							onclick={() => shareLink(andiLink, '📦 Andi — Deine Checkliste')}
							class="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
						>
							📤
						</button>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex gap-3">
			<a
				href="{base}/event/{eventId}"
				class="flex-1 bg-dhl-dark text-dhl-yellow font-bold py-3 px-4 rounded-xl text-center hover:bg-gray-800 transition-colors"
			>
				Zum Event →
			</a>
			<a
				href="{base}/"
				class="px-4 py-3 text-gray-500 hover:text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
			>
				Startseite
			</a>
		</div>
	</div>
</div>
