# 📦 Andi Tracker

Ein Gag-Geburtstagsgeschenk: eine DHL-Style Sendungsverfolgung für den chronisch
unpünktlichen Andi. Freunde sehen live seinen Vorbereitungsstatus, eine
eskalierende UI wenn er zu spät ist, und witzige Wartezeit-Vergleiche.

**Live:** https://simon376.github.io/bday-andy/

Für die App-Konzepte (Datenmodell, Eskalationsstufen, Kern-Flows) siehe
[docs/CONCEPT.md](docs/CONCEPT.md). Für den aktuellen Deploy-Status und was
noch fehlt, siehe [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Entwickeln

```sh
npm install
npm run dev
```

## Bauen

```sh
npm run build
npm run preview   # Production-Build lokal testen
```

## Deployment

Automatisch via GitHub Actions bei jedem Push auf `main` →
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) für Details und offene Punkte
(z. B. PWA-Icons, optionale Firebase-Anbindung für geräteübergreifendes
Live-Sync).
