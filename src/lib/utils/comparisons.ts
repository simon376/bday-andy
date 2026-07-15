interface Comparison {
	minutes: number;
	text: string;
}

const COMPARISONS: Comparison[] = [
	{ minutes: 1, text: 'In dieser Zeit hättest du dir einen Kaffee holen können.' },
	{ minutes: 2, text: 'Eine Tütensuppe wäre jetzt fertig.' },
	{ minutes: 3, text: 'Ein Ei wäre jetzt weichgekocht.' },
	{ minutes: 4, text: 'Du hättest "Happy Birthday" 12x singen können.' },
	{ minutes: 5, text: 'Du hättest eine Runde Candy Crush schaffen können.' },
	{ minutes: 7, text: 'Ein Faultier hätte 14 Meter zurückgelegt.' },
	{ minutes: 8, text: 'Eine Schnecke hätte 8 Meter geschafft. Respekt, Schnecke.' },
	{ minutes: 10, text: 'Du hättest 2 Eier hartkochen können.' },
	{ minutes: 12, text: 'Die ISS hat gerade 4.800 km zurückgelegt.' },
	{ minutes: 15, text: 'Du hättest ein Spiegelei braten UND essen können.' },
	{ minutes: 18, text: 'Ein Paketbote hätte 3 Pakete zugestellt. Einer davon war nicht Andi.' },
	{ minutes: 20, text: 'Eine Pizza wäre jetzt halb durch im Ofen.' },
	{ minutes: 25, text: 'Du hättest eine halbe Folge deiner Serie schauen können.' },
	{ minutes: 30, text: 'Du hättest zur nächsten Bushaltestelle und zurück laufen können. Zweimal.' },
	{ minutes: 35, text: 'Ein Eichhörnchen hätte 4.000 Nüsse versteckt und 3.999 vergessen.' },
	{ minutes: 40, text: 'Usain Bolt hätte einen Marathon geschafft. Fast.' },
	{ minutes: 45, text: 'Eine Tiefkühlpizza wäre fertig. Du hättest sie sogar essen können.' },
	{ minutes: 50, text: 'Du hättest eine komplette Waschmaschine durchlaufen lassen. Kurzprogramm.' },
	{ minutes: 60, text: 'Du hättest in der Zeit einen IKEA-Schrank aufbauen können. Vielleicht.' },
	{ minutes: 75, text: 'Du hättest einen Erste-Hilfe-Kurs absolvieren können. Nützlich bei so viel Warten.' },
	{ minutes: 90, text: 'Ein ganzer Film wäre durch. Credits inklusive.' },
	{ minutes: 120, text: 'Du hättest einen Kuchen backen können. Mit Glasur.' },
	{ minutes: 150, text: 'Du hättest Herr der Ringe: Die Gefährten schauen können. Extended Edition.' },
	{ minutes: 180, text: 'Ein Baby hätte laufen gelernt. Okay, vielleicht nicht. Aber fast.' },
	{ minutes: 240, text: 'Du hättest von München nach Berlin fliegen können. Hin UND zurück.' }
];

export function getComparison(waitingMinutes: number): string {
	let best = COMPARISONS[0];
	for (const c of COMPARISONS) {
		if (c.minutes <= waitingMinutes) {
			best = c;
		} else {
			break;
		}
	}
	return best.text;
}

export function getAllApplicableComparisons(waitingMinutes: number): string[] {
	return COMPARISONS.filter((c) => c.minutes <= waitingMinutes).map((c) => c.text);
}
