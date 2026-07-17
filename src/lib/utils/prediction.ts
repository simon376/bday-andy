import type { AndiEvent, Prediction, Step } from '$lib/types';

export function calculatePrediction(event: AndiEvent): Prediction {
	const now = new Date();
	const eventTime = event.eventTime.toDate();

	let etaTime: Date;
	let driftMinutes = 0;

	if (event.status === 'delivered') {
		etaTime = now;
	} else if (event.status === 'in_transit') {
		const leftAt = event.andyLeftAt?.toDate() ?? now;
		etaTime = new Date(leftAt.getTime() + event.travelMinutes * 60_000);
	} else {
		const drift = calculateDrift(event.steps);
		driftMinutes = Math.round(drift);
		const remainingMinutes = getRemainingMinutes(event.steps);
		const totalMinutes = remainingMinutes + event.travelMinutes + drift;
		etaTime = new Date(now.getTime() + totalMinutes * 60_000);
	}

	// How many minutes the predicted arrival is expected to miss the deadline by.
	// Positive = late, negative/zero = on time or early.
	const projectedLatenessMinutes = (etaTime.getTime() - eventTime.getTime()) / 60_000;
	const isLate = projectedLatenessMinutes > 0;

	// Confidence starts at 100% and drops 2 points per minute of projected lateness.
	// Deliberately allowed to go negative once things are bad enough — this is a
	// joke app, not a logistics platform.
	const confidence =
		projectedLatenessMinutes <= 0 ? 100 : Math.round(100 - projectedLatenessMinutes * 2);

	return {
		etaMinutes: Math.round((etaTime.getTime() - now.getTime()) / 60_000),
		etaTime,
		confidence,
		driftMinutes,
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
