# Anziehspass

Eine kleine Anzieh-App für Kinder ab ca. 3 Jahren: Figur wählen, Hüte, Brillen, Kleider,
Schuhe und Spielsachen antippen, Foto machen. Komplett ohne Text, ohne Werbung, ohne
Internet (nach dem ersten Öffnen) und ohne Datensammlung. Alles bleibt auf dem Gerät.

Technisch ist es eine Web-App (PWA) aus reinem HTML, CSS und JavaScript, ohne Build-Schritt.

## Installation auf Android

1. Den Link (GitHub Pages, siehe unten) in **Chrome** öffnen.
2. Menü **⋮** → **«App installieren»** bzw. **«Zum Startbildschirm hinzufügen»**.
3. Die App hat jetzt ein eigenes Symbol, läuft ohne Browserleiste und funktioniert offline.

## Bedienung

| Symbol | Funktion |
|---|---|
| Figur antippen | Schweinchen, Welpe oder Häschen auswählen |
| 👒 👓 👗 🧣 👟 🧸 | Kategorie wählen (Kopf, Augen, Kleider, Hals und Rücken, Schuhe, Spielsachen) |
| Teil unten antippen | anziehen; nochmals antippen = ausziehen |
| Teil an der Figur antippen | ausziehen |
| 🎲 | zufällig anziehen |
| 🧹 | alles ausziehen |
| 📷 | Look speichern: das Foto fliegt in die Galerie 🖼️ |
| 🖼️ | Galerie; Bild antippen = Look wieder anziehen |
| ▶️ (in der Galerie) | **Modenschau**: alle Looks laufen nacheinander über den Laufsteg, mit Fanfare und Konfetti. Antippen = nächster Look |
| 🏠 | zurück |

**Elternmenü:** In der Galerie **lange auf ein Bild drücken**. Dort kannst du das Bild
herunterladen, teilen (z.B. per WhatsApp) oder löschen.

Es gibt 55 Teile. Pro Slot trägt die Figur genau ein Teil: Ein neuer Hut ersetzt den alten.
Schleife und Hut, Flügel und Ballon oder Medaille und Kleid lassen sich aber kombinieren.

## Lokal starten

```bash
python -m http.server 8080
```

Dann <http://localhost:8080> öffnen.

## Veröffentlichen mit GitHub Pages

1. Repository auf GitHub pushen.
2. Auf GitHub: **Settings → Pages → Build and deployment → Source: «Deploy from a branch»**,
   Branch `main`, Ordner `/ (root)`.
3. Nach ca. 1 Minute läuft die App unter `https://<benutzername>.github.io/<repo-name>/`.

## Neue Teile hinzufügen

Alle Teile stehen in [js/items.js](js/items.js).

**Emoji-Bild als Teil** (z.B. eine Mütze):

1. SVG aus dem [Noto-Emoji-Repository](https://github.com/googlefonts/noto-emoji/tree/main/2D/svg)
   nach `assets/emoji/` kopieren.
2. Eintrag in `ITEMS` ergänzen, z.B.
   `{ id: 'beanie', cat: 'head', slot: 'head', emoji: '1f9e2', anchor: 'head', size: 1, ay: 0.8 }`
   - `anchor`: `head`, `ear`, `eyes`, `neck`, `hand`, `back` oder `['footL', 'footR']`
   - `size`: Grösse relativ zum Andockpunkt
   - `ax` / `ay`: welcher Punkt des Bildes (0–1) auf dem Andockpunkt sitzt
   - `flip: true`: Bild spiegeln
   - `per: { rabbit: { dy: -5 } }`: Feinkorrektur für eine einzelne Figur
3. Den Dateinamen in [sw.js](sw.js) bei `EMOJI` ergänzen und `VERSION` hochzählen.

**Selbst gezeichnete Mützen, Helme und Brillen** (`art`) sind SVG in einer 128×128-Box und
werden wie Emojis über `anchor`, `size`, `ax`/`ay` platziert.

**Selbst gezeichnete Kleider** (`svg`) sind SVG-Pfade im Koordinatensystem der Figur (400 × 520).
Da alle Figuren denselben Körper haben, passen sie automatisch auf alle drei.

**Neue Figur:** in [js/figures.js](js/figures.js) eine Kopf-Funktion und einen Eintrag in
`FIGURES` (Farben und Andockpunkte für Kopf, Ohr und Augen) hinzufügen.

**Wichtig nach jeder Änderung:** In [sw.js](sw.js) `VERSION` hochzählen (z.B. `v3`),
damit installierte Apps die neue Version laden.

## Lizenzen

- Figuren, Kleider und Code: selbst erstellt für dieses Projekt.
- Emoji-Grafiken in `assets/emoji/`: [Google Noto Emoji](https://github.com/googlefonts/noto-emoji),
  Apache License 2.0 (siehe [assets/emoji/LICENSE.txt](assets/emoji/LICENSE.txt)).

Die Figuren sind an den Zeichenstil bekannter Kinderserien angelehnt, aber eigene Zeichnungen.
Die App ist für den privaten Gebrauch gedacht.
