const PASSIVE_AGGRESSIVE: { minutes: number; text: string }[] = [
	{ minutes: 1, text: 'Andi ist jetzt offiziell unpünktlich. Überraschung.' },
	{ minutes: 3, text: '"Bin gleich da" — Andi, vor 3 Minuten.' },
	{ minutes: 5, text: 'Andi ist jetzt so spät wie ein DPD-Paket.' },
	{ minutes: 8, text: 'Dein Essen wird kalt. Andis Ausreden auch.' },
	{ minutes: 10, text: 'Wenn Andi ein Zug wäre, hätte die DB sich entschuldigt.' },
	{ minutes: 15, text: 'Andi hat jetzt eine Verspätung wie der BER eine Bauverzögerung.' },
	{ minutes: 20, text: 'Dein Uber wäre schneller gewesen. Und der steht im Stau.' },
	{ minutes: 25, text: 'Andi: Der einzige Mensch, bei dem "5 Minuten" eine Zeitzone ist.' },
	{ minutes: 30, text: 'Herzlichen Glückwunsch! Du wartest jetzt offiziell eine halbe Stunde.' },
	{ minutes: 40, text: 'An diesem Punkt ist es Performance-Kunst.' },
	{ minutes: 45, text: 'Andi wäre ein schlechter Pizzalieferant. "30 Minuten oder gratis" — LOL.' },
	{ minutes: 60, text: 'Eine Stunde. Andi hat offiziell die Zeitzone gewechselt.' },
	{ minutes: 75, text: 'Wenn Andi eine Lieferung wäre, hättest du dein Geld zurückbekommen.' },
	{ minutes: 90, text: 'Andi ist jetzt so spät, dass die Nachbarn fragen, ob alles ok ist.' },
	{ minutes: 120, text: 'Zwei Stunden. Das ist kein Zu-Spät-Kommen mehr, das ist ein Statement.' },
	{ minutes: 180, text: 'Vielleicht kommt er morgen? Optimismus ist wichtig.' }
];

const EXCUSES: string[] = [
	'"Bin in 5 Minuten da!"',
	'"Bin schon im Auto!"',
	'"Muss nur noch schnell duschen!"',
	'"Hab den Bus verpasst, nehm den nächsten!"',
	'"Mein Wecker hat nicht geklingelt!" (um 18 Uhr)',
	'"Ich finde meinen Schlüssel nicht!"',
	'"Musste noch kurz was essen!"',
	'"War noch kurz beim Rewe!"',
	'"Bin quasi schon da!"',
	'"Noch eine Station!"',
	'"Die Bahn hatte Verspätung!" (er fährt Auto)',
	'"Sorry, hab die Zeit vergessen!"',
	'"Musste noch schnell Handy laden!"',
	'"Komm sofort, bieg nur noch um die Ecke!" (3 km entfernt)',
	'"Bin gerade losgelaufen!" (sitzt noch auf der Couch)',
	'"Hab deine Nachricht grad erst gesehen!" (war 2h online)',
	'"Kurze Frage: was war nochmal die Adresse?" (zum 3. Mal)',
	'"Bin in 10!" (÷ 3 = Andi-Minuten)',
	'"Sitze im Stau!" (es ist Sonntag)',
	'"Musste nochmal umdrehen, hab was vergessen!"'
];

const ANDI_RATINGS: string[] = [
	'⭐ — "Paket kam nie an. Fahrer hat wohl Netflix geschaut."',
	'⭐ — "Lieferzeitfenster: irgendwann zwischen heute und nie."',
	'⭐ — "Tracking sagte \'unterwegs\'. Das war vor 2 Stunden."',
	'⭐ — "Sendung vermisst. Wie meine Geduld."',
	'⭐ — "Würde 0 Sterne geben, wenn ich könnte."',
	'⭐⭐ — "Kam an. An einem anderen Tag als versprochen."',
	'⭐ — "\'Express-Lieferung\' bestellt. Briefpost wäre schneller gewesen."'
];

const FUN_FACTS: string[] = [
	'Fun Fact: Andis durchschnittliche Verspätung reicht für einen Kurzfilm.',
	'Fun Fact: Wenn "Andi-Zeit" eine Zeitzone wäre, läge sie hinter Samoa.',
	'Fun Fact: Andi wäre der einzige DHL-Fahrer, bei dem Kunden aufs Paket warten UND alt werden.',
	'Fun Fact: In der Zeit, die Andi zu spät ist, hat die Erde sich schon ein Stück weitergedreht. Buchstäblich.',
	'Fun Fact: Andis Pünktlichkeit und Einhörner haben eins gemeinsam.',
	'Fun Fact: Wenn Andi ein GPS hätte, würde es "Neuberechnung..." in Endlosschleife zeigen.',
	'Fun Fact: Die Deutsche Bahn hat bessere Pünktlichkeitsstatistiken. Denk mal drüber nach.'
];

export function getPassiveAggressiveTime(minutes: number): string {
	let best = PASSIVE_AGGRESSIVE[0];
	for (const entry of PASSIVE_AGGRESSIVE) {
		if (entry.minutes <= minutes) best = entry;
		else break;
	}
	return best.text;
}

export function getRandomExcuse(seed: number): string {
	return EXCUSES[seed % EXCUSES.length];
}

export function getAndiRating(seed: number): string {
	return ANDI_RATINGS[seed % ANDI_RATINGS.length];
}

export function getFunFact(seed: number): string {
	return FUN_FACTS[seed % FUN_FACTS.length];
}
