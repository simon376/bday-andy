export const AST_OFFSET_MINUTES = 47;

export function formatTime(date: Date): string {
	return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function toAST(date: Date): Date {
	return new Date(date.getTime() + AST_OFFSET_MINUTES * 60_000);
}

export function formatAST(date: Date): string {
	return formatTime(toAST(date)) + ' AST';
}

export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes} Min.`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`;
}

export function formatCountdown(targetDate: Date): string {
	const now = new Date();
	const diff = targetDate.getTime() - now.getTime();

	if (diff <= 0) return 'Überfällig';

	const hours = Math.floor(diff / 3_600_000);
	const minutes = Math.floor((diff % 3_600_000) / 60_000);
	const seconds = Math.floor((diff % 60_000) / 1_000);

	if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
