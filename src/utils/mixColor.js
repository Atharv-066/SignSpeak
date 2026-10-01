// Interpolates between the "idle" (no gesture) and "confirming" (gesture
// held) colors based on hold progress (0-100). This makes color a live
// confidence signal rather than decoration — the readout genuinely gets
// warmer as a gesture is about to be confirmed.
const IDLE = [110, 168, 255]; // cool blue
const CONFIRM = [255, 138, 92]; // warm coral

export function mixColor(pct) {
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const r = Math.round(IDLE[0] + (CONFIRM[0] - IDLE[0]) * t);
  const g = Math.round(IDLE[1] + (CONFIRM[1] - IDLE[1]) * t);
  const b = Math.round(IDLE[2] + (CONFIRM[2] - IDLE[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
