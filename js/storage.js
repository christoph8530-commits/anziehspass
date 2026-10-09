// Speichert Outfits und Galerie lokal im Browser. Fehler (z.B. privater Modus)
// werden ignoriert, die App läuft dann einfach ohne Speicher weiter.

const PREFIX = 'anziehspass.';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* Speicher nicht verfügbar */
  }
}
