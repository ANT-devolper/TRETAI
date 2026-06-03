// Pure stopwatch formatting: milliseconds -> "m:ss.cc" (minutes, seconds,
// centiseconds), truncating toward zero like a counting-up clock.
export function formatTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  const pad = (n) => String(n).padStart(2, '0');
  return `${minutes}:${pad(seconds)}.${pad(centis)}`;
}
