// Gemeinsame Effekte: Konfetti und Warten auf Animationen.

// Wartet auf das Ende einer Animation, spätestens nach der geplanten Dauer
// (falls der Browser im Hintergrund keine Frames zeichnet).
export const played = (anim, ms) => Promise.race([anim.finished, new Promise((r) => setTimeout(r, ms + 150))]);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const COLORS = ['#FF6FA8', '#FFD54F', '#4FC3F7', '#81C784', '#BA68C8', '#FF8A65'];

// Konfetti, das im Container von oben nach unten fällt.
export function confetti(container, count = 44) {
  const height = container.clientHeight;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.background = COLORS[i % COLORS.length];
    piece.style.left = `${Math.random() * 100}%`;
    container.append(piece);
    const drift = (Math.random() - 0.5) * 160;
    const duration = 1800 + Math.random() * 1400;
    const delay = Math.random() * 400;
    const anim = piece.animate(
      [
        { transform: 'translate(0, -30px) rotate(0deg)' },
        { transform: `translate(${drift}px, ${height + 40}px) rotate(${Math.random() * 900}deg)` },
      ],
      { duration, delay, easing: 'cubic-bezier(.2,.5,.4,1)', fill: 'both' }
    );
    played(anim, duration + delay).then(() => piece.remove());
  }
}
