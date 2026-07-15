import type { Timestamp } from 'firebase/firestore';

export interface Step {
	id: string;
	label: string;
	durationMinutes: number;
	completedAt: Timestamp | null;
}

export interface AndiEvent {
	id?: string;
	name: string;
	eventTime: Timestamp;
	location: string;
	travelMinutes: number;
	createdAt: Timestamp;
	status: 'announced' | 'preparing' | 'in_transit' | 'delivered';
	steps: Step[];
	andyLeftAt: Timestamp | null;
	andyLocation: { lat: number; lng: number } | null;
}

export interface Prediction {
	etaMinutes: number;
	etaTime: Date;
	confidence: number;
	driftMinutes: number;
	isLate: boolean;
}

export const DEFAULT_STEPS: Omit<Step, 'id' | 'completedAt'>[] = [
	{ label: 'Duschen', durationMinutes: 15 },
	{ label: 'Essen', durationMinutes: 20 },
	{ label: 'Anziehen', durationMinutes: 10 },
	{ label: 'Losgehen', durationMinutes: 5 }
];

export const SUGGESTED_STEPS: Omit<Step, 'id' | 'completedAt'>[] = [
	{ label: 'Netflix-Episode fertig schauen', durationMinutes: 25 },
	{ label: 'Handy laden', durationMinutes: 15 },
	{ label: 'Noch schnell einkaufen', durationMinutes: 30 },
	{ label: 'Haare stylen', durationMinutes: 10 },
	{ label: 'Wohnung aufräumen', durationMinutes: 20 },
	{ label: 'Kaffee trinken', durationMinutes: 10 },
	{ label: 'Outfit wechseln', durationMinutes: 5 },
	{ label: 'Nochmal aufs Klo', durationMinutes: 5 },
	{ label: 'Geschenk einpacken', durationMinutes: 15 },
	{ label: 'Spotify-Playlist erstellen', durationMinutes: 10 },
	{ label: 'Auto volltanken', durationMinutes: 15 },
	{ label: 'Power Nap', durationMinutes: 20 },
	{ label: 'Schlüssel suchen', durationMinutes: 10 },
	{ label: 'Letzte TikTok-Runde', durationMinutes: 15 }
];
