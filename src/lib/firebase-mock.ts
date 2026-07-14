import type { AndiEvent, Step } from './types';

// Mock Timestamp class that is structurally compatible with Firebase's Timestamp
export class Timestamp {
	readonly seconds: number;
	readonly nanoseconds: number;

	constructor(seconds: number, nanoseconds: number) {
		this.seconds = seconds;
		this.nanoseconds = nanoseconds;
	}

	toDate(): Date {
		return new Date(this.seconds * 1000 + this.nanoseconds / 1e6);
	}

	toMillis(): number {
		return this.seconds * 1000 + this.nanoseconds / 1e6;
	}

	isEqual(other: { seconds: number; nanoseconds: number }): boolean {
		return this.seconds === other.seconds && this.nanoseconds === other.nanoseconds;
	}

	valueOf(): string {
		return `${this.seconds}.${String(this.nanoseconds).padStart(9, '0')}`;
	}

	static now(): Timestamp {
		const ms = Date.now();
		return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1_000_000);
	}

	static fromDate(date: Date): Timestamp {
		const ms = date.getTime();
		return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1_000_000);
	}

	static fromMillis(ms: number): Timestamp {
		return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1_000_000);
	}
}

// ---------------------------------------------------------------------------
// In-memory store with localStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'bday-andy-events';

function loadFromStorage(): Map<string, AndiEvent> {
	const map = new Map<string, AndiEvent>();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const entries: [string, SerializedEvent][] = JSON.parse(raw);
			for (const [id, data] of entries) {
				map.set(id, deserializeEvent(data));
			}
		}
	} catch { /* ignore */ }
	return map;
}

function saveToStorage(): void {
	try {
		const entries: [string, SerializedEvent][] = [];
		for (const [id, event] of events) {
			entries.push([id, serializeEvent(event)]);
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	} catch { /* ignore */ }
}

const events: Map<string, AndiEvent> = typeof localStorage !== 'undefined' ? loadFromStorage() : new Map();
const subscribers = new Map<string, Set<(event: AndiEvent | null) => void>>();

// ---------------------------------------------------------------------------
// BroadcastChannel – keeps multiple browser tabs in sync
// ---------------------------------------------------------------------------

const CHANNEL_NAME = 'bday-andy-mock';
let channel: BroadcastChannel | null = null;

interface BroadcastMessage {
	type: 'update';
	eventId: string;
	data: SerializedEvent | null;
}

interface SerializedTimestamp {
	_type: 'Timestamp';
	seconds: number;
	nanoseconds: number;
}

interface SerializedStep extends Omit<Step, 'completedAt'> {
	completedAt: SerializedTimestamp | null;
}

interface SerializedEvent extends Omit<AndiEvent, 'eventTime' | 'createdAt' | 'andyLeftAt' | 'steps'> {
	eventTime: SerializedTimestamp;
	createdAt: SerializedTimestamp;
	andyLeftAt: SerializedTimestamp | null;
	steps: SerializedStep[];
}

function getChannel(): BroadcastChannel | null {
	if (typeof BroadcastChannel === 'undefined') return null;
	if (!channel) {
		channel = new BroadcastChannel(CHANNEL_NAME);
		channel.onmessage = (e: MessageEvent<BroadcastMessage>) => {
			const { type, eventId, data } = e.data;
			if (type === 'update' && eventId) {
				if (data === null) {
					events.delete(eventId);
				} else {
					events.set(eventId, deserializeEvent(data));
				}
				notifySubscribers(eventId);
			}
		};
	}
	return channel;
}

// ---------------------------------------------------------------------------
// Serialisation helpers (Timestamp is not JSON-serialisable)
// ---------------------------------------------------------------------------

function serializeTimestamp(ts: Timestamp | null | undefined): SerializedTimestamp | null {
	if (ts == null) return null;
	return { _type: 'Timestamp', seconds: ts.seconds, nanoseconds: ts.nanoseconds };
}

function deserializeTimestamp(data: SerializedTimestamp | null | undefined): Timestamp | null {
	if (data == null) return null;
	return new Timestamp(data.seconds, data.nanoseconds);
}

function serializeEvent(event: AndiEvent): SerializedEvent {
	return {
		...event,
		eventTime: serializeTimestamp(event.eventTime as Timestamp)!,
		createdAt: serializeTimestamp(event.createdAt as Timestamp)!,
		andyLeftAt: serializeTimestamp(event.andyLeftAt as Timestamp | null),
		steps: event.steps.map((step) => ({
			...step,
			completedAt: serializeTimestamp(step.completedAt as Timestamp | null)
		}))
	};
}

function deserializeEvent(data: SerializedEvent): AndiEvent {
	return {
		...data,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		eventTime: deserializeTimestamp(data.eventTime)! as any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		createdAt: deserializeTimestamp(data.createdAt)! as any,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		andyLeftAt: deserializeTimestamp(data.andyLeftAt) as any,
		steps: data.steps.map((step) => ({
			...step,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			completedAt: deserializeTimestamp(step.completedAt) as any
		}))
	};
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function notifySubscribers(eventId: string): void {
	const subs = subscribers.get(eventId);
	if (!subs) return;
	const event = events.get(eventId) ?? null;
	subs.forEach((cb) => cb(event));
}

function broadcastUpdate(eventId: string, data: SerializedEvent | null): void {
	saveToStorage();
	getChannel()?.postMessage({ type: 'update', eventId, data } satisfies BroadcastMessage);
}

// ---------------------------------------------------------------------------
// Public API (mirrors firebase.ts)
// ---------------------------------------------------------------------------

export function generateId(): string {
	return crypto.randomUUID().slice(0, 8);
}

export async function createEvent(
	event: Omit<AndiEvent, 'id' | 'createdAt' | 'status' | 'andyLeftAt' | 'andyLocation'>
): Promise<string> {
	const id = generateId();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const newEvent: AndiEvent = {
		...event,
		id,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		createdAt: Timestamp.now() as any,
		status: 'announced',
		andyLeftAt: null,
		andyLocation: null
	};
	events.set(id, newEvent);
	notifySubscribers(id);
	broadcastUpdate(id, serializeEvent(newEvent));
	return id;
}

export function subscribeToEvent(
	eventId: string,
	callback: (event: AndiEvent | null) => void
): () => void {
	// Ensure channel is listening so updates from other tabs reach us
	getChannel();

	if (!subscribers.has(eventId)) {
		subscribers.set(eventId, new Set());
	}
	subscribers.get(eventId)!.add(callback);

	// Immediately deliver current state
	callback(events.get(eventId) ?? null);

	return () => {
		subscribers.get(eventId)?.delete(callback);
	};
}

export async function completeStep(
	eventId: string,
	steps: Step[],
	stepIndex: number
): Promise<void> {
	const event = events.get(eventId);
	if (!event) return;

	const updatedSteps = [...steps];
	updatedSteps[stepIndex] = {
		...updatedSteps[stepIndex],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		completedAt: Timestamp.now() as any
	};

	const allCompleted = updatedSteps.every((s) => s.completedAt !== null);
	const anyCompleted = updatedSteps.some((s) => s.completedAt !== null);

	const updatedEvent: AndiEvent = {
		...event,
		steps: updatedSteps,
		status: allCompleted ? 'in_transit' : anyCompleted ? 'preparing' : 'announced',
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		...(allCompleted ? { andyLeftAt: Timestamp.now() as any } : {})
	};

	events.set(eventId, updatedEvent);
	notifySubscribers(eventId);
	broadcastUpdate(eventId, serializeEvent(updatedEvent));
}

export async function uncompleteStep(
	eventId: string,
	steps: Step[],
	stepIndex: number
): Promise<void> {
	const event = events.get(eventId);
	if (!event) return;

	const updatedSteps = [...steps];
	updatedSteps[stepIndex] = {
		...updatedSteps[stepIndex],
		completedAt: null
	};

	const anyCompleted = updatedSteps.some((s) => s.completedAt !== null);

	const updatedEvent: AndiEvent = {
		...event,
		steps: updatedSteps,
		status: anyCompleted ? 'preparing' : 'announced',
		andyLeftAt: null
	};

	events.set(eventId, updatedEvent);
	notifySubscribers(eventId);
	broadcastUpdate(eventId, serializeEvent(updatedEvent));
}

export async function updateEventSteps(eventId: string, steps: Step[]): Promise<void> {
	const event = events.get(eventId);
	if (!event) return;

	const updatedEvent: AndiEvent = { ...event, steps };
	events.set(eventId, updatedEvent);
	notifySubscribers(eventId);
	broadcastUpdate(eventId, serializeEvent(updatedEvent));
}

export async function markDelivered(eventId: string): Promise<void> {
	const event = events.get(eventId);
	if (!event) return;

	const updatedEvent: AndiEvent = { ...event, status: 'delivered' };
	events.set(eventId, updatedEvent);
	notifySubscribers(eventId);
	broadcastUpdate(eventId, serializeEvent(updatedEvent));
}

export async function updateLocation(eventId: string, lat: number, lng: number): Promise<void> {
	const event = events.get(eventId);
	if (!event) return;

	const updatedEvent: AndiEvent = { ...event, andyLocation: { lat, lng } };
	events.set(eventId, updatedEvent);
	notifySubscribers(eventId);
	broadcastUpdate(eventId, serializeEvent(updatedEvent));
}

export function getAllEvents(): AndiEvent[] {
	return Array.from(events.values());
}
