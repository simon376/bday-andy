import { initializeApp } from 'firebase/app';
import {
	getFirestore,
	collection,
	doc,
	addDoc,
	updateDoc,
	onSnapshot,
	Timestamp
} from 'firebase/firestore';
import type { AndiEvent, Step } from './types';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const eventsCollection = collection(db, 'events');

export function generateId(): string {
	return crypto.randomUUID().slice(0, 8);
}

export async function createEvent(
	event: Omit<AndiEvent, 'id' | 'createdAt' | 'status' | 'andyLeftAt' | 'andyLocation'>
): Promise<string> {
	const docRef = await addDoc(eventsCollection, {
		...event,
		createdAt: Timestamp.now(),
		status: 'announced',
		andyLeftAt: null,
		andyLocation: null
	});
	return docRef.id;
}

export function subscribeToEvent(
	eventId: string,
	callback: (event: AndiEvent | null) => void
): () => void {
	const docRef = doc(db, 'events', eventId);
	return onSnapshot(docRef, (snapshot) => {
		if (snapshot.exists()) {
			callback({ id: snapshot.id, ...snapshot.data() } as AndiEvent);
		} else {
			callback(null);
		}
	});
}

export async function completeStep(
	eventId: string,
	steps: Step[],
	stepIndex: number
): Promise<void> {
	const docRef = doc(db, 'events', eventId);
	const updatedSteps = [...steps];
	updatedSteps[stepIndex] = {
		...updatedSteps[stepIndex],
		completedAt: Timestamp.now()
	};

	const allCompleted = updatedSteps.every((s) => s.completedAt !== null);
	const anyCompleted = updatedSteps.some((s) => s.completedAt !== null);

	await updateDoc(docRef, {
		steps: updatedSteps,
		status: allCompleted ? 'in_transit' : anyCompleted ? 'preparing' : 'announced',
		...(allCompleted ? { andyLeftAt: Timestamp.now() } : {})
	});
}

export async function uncompleteStep(
	eventId: string,
	steps: Step[],
	stepIndex: number
): Promise<void> {
	const docRef = doc(db, 'events', eventId);
	const updatedSteps = [...steps];
	updatedSteps[stepIndex] = {
		...updatedSteps[stepIndex],
		completedAt: null
	};

	const anyCompleted = updatedSteps.some((s) => s.completedAt !== null);

	await updateDoc(docRef, {
		steps: updatedSteps,
		status: anyCompleted ? 'preparing' : 'announced',
		andyLeftAt: null
	});
}

export async function updateEventSteps(eventId: string, steps: Step[]): Promise<void> {
	const docRef = doc(db, 'events', eventId);
	await updateDoc(docRef, { steps });
}

export async function markDelivered(eventId: string): Promise<void> {
	const docRef = doc(db, 'events', eventId);
	await updateDoc(docRef, { status: 'delivered' });
}

export async function updateLocation(eventId: string, lat: number, lng: number): Promise<void> {
	const docRef = doc(db, 'events', eventId);
	await updateDoc(docRef, { andyLocation: { lat, lng } });
}

export { Timestamp };
