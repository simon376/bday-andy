/**
 * Unified Firebase entry-point.
 *
 * If VITE_FIREBASE_API_KEY is not set the app runs in demo/local mode using an
 * in-memory store (firebase-mock.ts) that syncs across browser tabs via
 * BroadcastChannel.
 */

// Use static imports — Vite tree-shakes the unused branch at build time.
// In dev mode without Firebase config, firebase-real will fail to init but
// we never call into it because we gate on the env var below.
import * as mock from './firebase-mock';

const useMock = !import.meta.env.VITE_FIREBASE_API_KEY;

let real: typeof mock | null = null;

async function getReal() {
	if (!real) {
		real = await import('./firebase-real');
	}
	return real;
}

export const Timestamp = useMock ? mock.Timestamp : mock.Timestamp;

export const generateId = mock.generateId;

export async function createEvent(
	...args: Parameters<typeof mock.createEvent>
): ReturnType<typeof mock.createEvent> {
	if (useMock) return mock.createEvent(...args);
	return (await getReal()).createEvent(...args);
}

export function subscribeToEvent(
	...args: Parameters<typeof mock.subscribeToEvent>
): ReturnType<typeof mock.subscribeToEvent> {
	if (useMock) return mock.subscribeToEvent(...args);
	// For the real implementation, we need to handle this synchronously
	// since subscribeToEvent returns an unsubscribe function immediately
	let unsubscribe: (() => void) | null = null;
	let cancelled = false;
	getReal().then((r) => {
		if (!cancelled) {
			unsubscribe = r.subscribeToEvent(...args);
		}
	});
	return () => {
		cancelled = true;
		unsubscribe?.();
	};
}

export async function completeStep(
	...args: Parameters<typeof mock.completeStep>
): ReturnType<typeof mock.completeStep> {
	if (useMock) return mock.completeStep(...args);
	return (await getReal()).completeStep(...args);
}

export async function uncompleteStep(
	...args: Parameters<typeof mock.uncompleteStep>
): ReturnType<typeof mock.uncompleteStep> {
	if (useMock) return mock.uncompleteStep(...args);
	return (await getReal()).uncompleteStep(...args);
}

export async function updateEventSteps(
	...args: Parameters<typeof mock.updateEventSteps>
): ReturnType<typeof mock.updateEventSteps> {
	if (useMock) return mock.updateEventSteps(...args);
	return (await getReal()).updateEventSteps(...args);
}

export async function markDelivered(
	...args: Parameters<typeof mock.markDelivered>
): ReturnType<typeof mock.markDelivered> {
	if (useMock) return mock.markDelivered(...args);
	return (await getReal()).markDelivered(...args);
}

export async function updateLocation(
	...args: Parameters<typeof mock.updateLocation>
): ReturnType<typeof mock.updateLocation> {
	if (useMock) return mock.updateLocation(...args);
	return (await getReal()).updateLocation(...args);
}

export function getAllEvents(): ReturnType<typeof mock.getAllEvents> {
	if (useMock) return mock.getAllEvents();
	return [];
}
