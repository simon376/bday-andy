# Deployment-Status & Was noch zu tun ist

## Aktueller Stand

Die App ist **bereits live und funktionsfähig** auf GitHub Pages:

**https://simon376.github.io/bday-andy/**

Jeder Push auf `main` löst automatisch einen Build + Deploy aus
(`.github/workflows/deploy.yml`). Kein manueller Schritt nötig.

Die App läuft komplett ohne eigenen Server — reines static hosting. Alle
Event-Daten werden aktuell **im Browser des jeweiligen Geräts** gespeichert
(`localStorage`), nicht in einer echten Datenbank. Das ist der wichtigste
Punkt, den man verstehen muss, bevor man die App im echten Leben nutzt.

---

## ⚠️ Wichtigste Einschränkung: kein geräteübergreifendes Sync

**So funktioniert es aktuell:**
- Wer das Event erstellt, hat es in seinem Browser gespeichert.
- Der Freunde-Link und der Andi-Link funktionieren nur, wenn die Person, die
  draufklickt, **denselben Browser auf demselben Gerät** benutzt wie die
  Person, die das Event erstellt hat (dank `localStorage` + `BroadcastChannel`
  für Tab-Sync).
- Schickt man den Link an eine andere Person auf ihrem eigenen Handy, sieht
  die Person **"Sendung nicht gefunden"** — weil deren Browser das Event nicht
  kennt.

**Das heißt:** Für den eigentlichen Use-Case (Andi tippt auf seinem Handy,
Freunde schauen auf ihren Handys zu) ist das **noch nicht ausreichend**. Dafür
muss Firebase eingerichtet werden (siehe unten).

Zum reinen Testen/Vorführen auf einem Gerät reicht der aktuelle Stand.

---

## Schritt für Schritt: Firebase für echtes Multi-Device-Sync einrichten

Das ist der einzige Schritt, der noch fehlt, um die App wirklich mit mehreren
Leuten auf verschiedenen Handys nutzen zu können. Alles läuft weiterhin über
GitHub Pages — Firebase braucht keinen eigenen Server, es ist reine
Client-Firebase-SDK-Nutzung.

### 1. Firebase-Projekt erstellen

1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. "Projekt hinzufügen" → Name z. B. `andi-tracker`
3. Google Analytics kann deaktiviert werden (nicht benötigt)

### 2. Firestore-Datenbank aktivieren

1. Im Firebase-Projekt: **Build → Firestore Database → Datenbank erstellen**
2. Modus: **Testmodus** wählen (offene Regeln, läuft nach 30 Tagen ab — siehe
   Schritt 4 für dauerhafte Regeln)
3. Standort: `eur3 (europe-west)` oder eine andere Region deiner Wahl

### 3. Web-App registrieren und Config abholen

1. Im Firebase-Projekt: Zahnrad-Symbol → **Projekteinstellungen**
2. Unten bei "Meine Apps" → **Web-App hinzufügen** (</> Symbol)
3. Nickname vergeben (z. B. `andi-tracker-web`), Firebase Hosting **nicht**
   aktivieren (wir nutzen GitHub Pages)
4. Der angezeigte `firebaseConfig`-Block enthält alle Werte, die du brauchst:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

### 4. Firestore Security Rules setzen

Im Firebase-Projekt: **Build → Firestore Database → Regeln**. Für dieses
Gag-Projekt (kein Login, jeder mit Link darf lesen/schreiben) reicht:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if true;
    }
  }
}
```

⚠️ Das ist bewusst offen — jeder mit der Firebase-Projekt-ID könnte theoretisch
Events lesen/schreiben. Für ein privates Geburtstagsgeschenk ist das
akzeptabel, für einen ernsthaften Einsatz nicht.

### Kann das ungewollt Geld kosten?

**Nein.** Solange kein Billing-Konto mit dem Firebase-Projekt verknüpft wird,
bleibt es auf dem kostenlosen **Spark-Plan** — der verlangt keine Kreditkarte
und kein Zahlungsmittel ist hinterlegt. Ohne Zahlungsmittel kann Google
technisch gar nicht abrechnen.

Wird das Tageskontingent überschritten (50.000 Lesevorgänge/Tag, 1 GiB
Speicher), werden weitere Anfragen **einfach abgelehnt** — die App zeigt dann
Fehler, aber es entstehen keine Kosten. Ein Upgrade auf den kostenpflichtigen
**Blaze-Plan** passiert nicht automatisch, sondern nur wenn man aktiv in der
Firebase Console ein Billing-Konto hinterlegt. Solange das nicht passiert
(und in diesem Projekt nicht nötig ist), ist es strukturell ausgeschlossen,
dass Kosten anfallen — schlimmstenfalls geht die App kurz offline statt
Rechnungen zu erzeugen.

### 5. Config lokal eintragen (zum Testen)

```sh
cp .env.example .env
```

Trage die Werte aus Schritt 3 in `.env` ein. `npm run dev` nutzt dann
automatisch Firebase statt dem localStorage-Mock (siehe
`src/lib/firebase.ts` — schaltet basierend auf `VITE_FIREBASE_API_KEY` um).

### 6. Config für den GitHub-Actions-Deploy hinterlegen

Damit der **deployte** Build auch Firebase nutzt, müssen die Werte als
GitHub Secrets hinterlegt werden:

1. Im Repo auf GitHub: **Settings → Secrets and variables → Actions**
2. Für jeden Wert aus der `firebaseConfig` ein Secret anlegen:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. `.github/workflows/deploy.yml` im Build-Step erweitern, damit die Secrets
   als Env-Variablen durchgereicht werden:
   ```yaml
   - name: Build
     env:
       BASE_PATH: '/${{ github.event.repository.name }}'
       VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
       VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
       VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
       VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
       VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
       VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
     run: npm run build
   ```
4. Push auf `main` → nächster Deploy nutzt Firebase, Events sind dann für
   alle sichtbar, egal welches Gerät.

**Kosten:** Firebase Spark-Plan (kostenlos) reicht bei weitem —
1 GiB Speicher, 50.000 Lesevorgänge/Tag. Für ein einmaliges
Geburtstags-Event völlig ausreichend.

---

## Kleinere offene Punkte (kosmetisch, kein Blocker)

### PWA-Icons fehlen

`static/manifest.json` verweist auf `/icon-192.png` und `/icon-512.png` —
diese Dateien existieren aktuell nicht in `static/`. Ohne sie:
- Die App ist trotzdem als PWA installierbar
- Aber es wird ein Standard-Browser-Icon statt eines eigenen App-Icons
  angezeigt

**Fix:** Zwei PNG-Dateien (192×192 und 512×512 px) nach `static/icon-192.png`
und `static/icon-512.png` legen. Ein 📦-Emoji auf gelbem Hintergrund reicht
völlig.

### Browser-Notifications und Geolocation

Beide Features sind bereits implementiert und funktionieren rein
client-seitig (kein Server nötig):
- **Notifications**: Nur solange die Seite/PWA offen ist (kein Push vom
  Server — das würde einen Backend-Trigger brauchen, den wir bewusst
  weggelassen haben).
- **Geolocation**: Andis Standort wird an Firestore geschrieben, sobald er
  "Losgehen" abhakt — funktioniert nur mit eingerichtetem Firebase
  (siehe oben). Ohne Firebase bleibt es wirkungslos, weil ohnehin niemand
  anderes den Standort sehen könnte.

Kein Handlungsbedarf, außer man will die Features tatsächlich nutzen — dann
ist Firebase (siehe oben) die Voraussetzung.

---

## Zusammenfassung: Was muss ich jetzt tun?

- **Nur vorführen/testen auf einem Gerät?** → Nichts. Ist schon live und
  funktioniert.
- **Wirklich mit Andi + mehreren Freunden auf verschiedenen Handys nutzen?**
  → Firebase einrichten (Schritte 1–6 oben, ca. 15 Minuten).
- **App-Icon soll nicht generisch aussehen?** → Zwei PNGs in `static/` legen
  (optional, 5 Minuten).
