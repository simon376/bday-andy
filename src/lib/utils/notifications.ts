let permissionGranted = false;

export async function requestNotificationPermission(): Promise<boolean> {
	if (!('Notification' in window)) return false;
	if (Notification.permission === 'granted') {
		permissionGranted = true;
		return true;
	}
	if (Notification.permission === 'denied') return false;

	const result = await Notification.requestPermission();
	permissionGranted = result === 'granted';
	return permissionGranted;
}

export function sendNotification(title: string, body: string) {
	if (!permissionGranted || Notification.permission !== 'granted') return;
	new Notification(title, {
		body,
		icon: '/icon-192.png',
		badge: '/icon-192.png'
	});
}

export function notifyStatusChange(status: string) {
	const messages: Record<string, string> = {
		preparing: '🚿 Andi hat angefangen sich vorzubereiten!',
		in_transit: '🚗 Andi ist losgelaufen!',
		delivered: '🎉 Andi ist angekommen!'
	};
	const msg = messages[status];
	if (msg) sendNotification('Andi Tracker', msg);
}

export function notifyReminder(minutesLeft: number) {
	sendNotification(
		'⏰ Andi Tracker Reminder',
		`Du musst in ${minutesLeft} Minuten losgehen!`
	);
}
