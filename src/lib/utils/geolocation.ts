import { updateLocation } from '$lib/firebase';

let watchId: number | null = null;

export function startTracking(eventId: string): boolean {
	if (!('geolocation' in navigator)) return false;

	watchId = navigator.geolocation.watchPosition(
		(position) => {
			updateLocation(eventId, position.coords.latitude, position.coords.longitude);
		},
		(error) => {
			console.warn('Geolocation error:', error.message);
		},
		{ enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
	);

	return true;
}

export function stopTracking() {
	if (watchId !== null) {
		navigator.geolocation.clearWatch(watchId);
		watchId = null;
	}
}

export function calculateDistance(
	lat1: number, lng1: number,
	lat2: number, lng2: number
): number {
	const R = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}
