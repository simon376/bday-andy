<script lang="ts">
	import { base } from '$app/paths';
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

	<p class="mt-6 text-sm text-gray-400">Andi Standard Time (AST): UTC+47min</p>
</div>
