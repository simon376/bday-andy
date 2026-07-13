export type EscalationLevel = 'calm' | 'warning' | 'danger' | 'critical' | 'panic';

export interface EscalationState {
	level: EscalationLevel;
	message: string;
	bgClass: string;
	textClass: string;
	animate: boolean;
	animationClass: string;
}

export function getEscalation(latenessMinutes: number): EscalationState {
	if (latenessMinutes <= 0) {
		return {
			level: 'calm',
			message: 'Sendung unterwegs',
			bgClass: 'bg-dhl-yellow',
			textClass: 'text-dhl-dark',
			animate: false,
			animationClass: ''
		};
	}

	if (latenessMinutes <= 10) {
		return {
			level: 'warning',
			message: 'Leichte Verzögerung',
			bgClass: 'bg-escalation-warning',
			textClass: 'text-white',
			animate: false,
			animationClass: ''
		};
	}

	if (latenessMinutes <= 30) {
		return {
			level: 'danger',
			message: 'ERHEBLICHE VERZÖGERUNG',
			bgClass: 'bg-escalation-danger',
			textClass: 'text-white',
			animate: false,
			animationClass: ''
		};
	}

	if (latenessMinutes <= 60) {
		return {
			level: 'critical',
			message: 'SENDUNG VERMISST',
			bgClass: 'bg-escalation-critical',
			textClass: 'text-white',
			animate: true,
			animationClass: 'animate-pulse-red'
		};
	}

	return {
		level: 'panic',
		message: 'INTERPOL WURDE INFORMIERT',
		bgClass: 'bg-escalation-panic',
		textClass: 'text-red-500',
		animate: true,
		animationClass: 'animate-shake'
	};
}
