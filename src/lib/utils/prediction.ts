import type { AndiEvent, Prediction, Step } from '$lib/types';

export function calculatePrediction(event: AndiEvent): Prediction {
	const now = new Date();
	const eventTime = event.eventTime.toDate();

	if (event.status === 'delivered') {
		return { etaMinutes: 0, etaTime: now, confidence: 100, driftMinutes: 0, isLate: false };
	}

	if (event.status === 'in_transit') {
		const etaMinutes = event.travelMinutes;
		const leftAt = event.andyLeftAt?.toDate() ?? now;
		const etaTime = new Date(leftAt.getTime() + etaMinutes * 60_000);
		const isLate = etaTime > eventTime;
		return { etaMinutes, etaTime, confidence: 70, driftMinutes: 0, isLate };
	}

	const drift = calculateDrift(event.steps);
	const remainingMinutes = getRemainingMinutes(event.steps);
	const totalMinutes = remainingMinutes + event.travelMinutes + drift;

	const etaTime = new Date(now.getTime() + totalMinutes * 60_000);
	const isLate = etaTime > eventTime;

	const bufferMinutes = (eventTime.getTime() - now.getTime()) / 60_000;
	const confidence = Math.max(0, Math.min(100, Math.round((1 - drift / Math.max(bufferMinutes, 1)) * 100)));

	return {
		etaMinutes: Math.round(totalMinutes),
		etaTime,
		confidence,
		driftMinutes: Math.round(drift),
		isLate
	};
}

function calculateDrift(steps: Step[]): number {
	let drift = 0;
	let lastCompletionTime: Date | null = null;

	for (const step of steps) {
		if (step.completedAt) {
			const completedAt = step.completedAt.toDate();
			if (lastCompletionTime) {
				const actualMinutes = (completedAt.getTime() - lastCompletionTime.getTime()) / 60_000;
				const overrun = actualMinutes - step.durationMinutes;
				if (overrun > 0) drift += overrun;
			}
			lastCompletionTime = completedAt;
		}
	}

	return drift;
}

function getRemainingMinutes(steps: Step[]): number {
	return steps
		.filter((s) => s.completedAt === null)
		.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function getLateness(event: AndiEvent): number {
	const now = new Date();
	const eventTime = event.eventTime.toDate();
	if (event.status === 'delivered') return 0;
	const diff = (now.getTime() - eventTime.getTime()) / 60_000;
	return Math.max(0, Math.round(diff));
}
