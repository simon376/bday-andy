# Konzept

Kurzreferenz für die App-Mechanik. Für Deploy-Fragen siehe
[DEPLOYMENT.md](DEPLOYMENT.md).

## Datenmodell

Ein Event-Dokument enthält alles (`src/lib/types.ts`):

```
AndiEvent
├── name, eventTime, location, travelMinutes
├── status: "announced" | "preparing" | "in_transit" | "delivered"
├── steps: [{ label, durationMinutes, completedAt }]
├── andyLeftAt, andyLocation
```

Gespeichert entweder in `localStorage` (Demo-Modus, `firebase-mock.ts`) oder
in Firestore (`firebase-real.ts`) — welcher Modus aktiv ist, entscheidet
`src/lib/firebase.ts` anhand von `VITE_FIREBASE_API_KEY`.

## Kern-Flows

- **Event erstellen** (`/create`): Freund legt Name, Zeit, Ort, Checkliste an
  → Weiterleitung zur Share-Seite mit Links für Freunde und Andi.
- **Andi-View** (`/event/[id]/andi`): Checkliste abhaken, Schritte aus
  Vorschlägen hinzufügen, "Losgehen" → Status wechselt zu `in_transit`.
- **Freunde-View** (`/event/[id]`): Live-Status, ETA-Prognose,
  Eskalations-UI, Wartezeit-Humor.

## Pünktlichkeits-Prognose

`src/lib/utils/prediction.ts`: ETA = jetzt + offene Schritte × Dauer +
Pendelzeit + bisherige Verzögerungen (Drift). Konfidenz startet bei 100 %
und sinkt mit der prognostizierten Verspätung — kann ins Negative gehen,
wenn Andi wirklich zu spät ist (Absicht, kein Bug).

## Eskalationsstufen

`src/lib/utils/escalation.ts`: 5 Stufen von "Im Zeitplan" (0 min) bis "Panic"
(60+ min, rotierende Nachrichten wie "NASA SUCHT PER SATELLIT").

## Humor-Bausteine

`src/lib/utils/comparisons.ts` (witzige Wartezeit-Vergleiche) und
`src/lib/utils/humor.ts` (passiv-aggressive Sprüche, Ausreden-Generator,
Fake-Bewertungen, Fun Facts) — rotieren in der Freunde-View während des
Wartens.

## AST — Andi Standard Time

Running Gag: jede von Andi genannte Zeit + 47 Minuten Realität
(`src/lib/utils/time.ts`, `AST_OFFSET_MINUTES`). Wird bei ETA und
Zieluhrzeit als zweite Zeitangabe eingeblendet.
