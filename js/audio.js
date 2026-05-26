import {
  DEFAULT_VOLUME, DUCK_VOLUME,
  SFX_VOLUME, LINE_CLEAR_NOTES,
} from './constants.js';

let audioEl = null;
let userPaused = false;
let armed = false;
let sfxCtx = null;
const stateListeners = [];

function emit() {
  const snapshot = { playing: isPlaying() };
  for (const cb of stateListeners) cb(snapshot);
}

function tryPlay() {
  if (!audioEl) return;
  const p = audioEl.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

export function init(url) {
  if (audioEl) return;
  audioEl = new Audio(url);
  audioEl.loop = true;
  audioEl.preload = 'none';
  audioEl.volume = DEFAULT_VOLUME;
  audioEl.addEventListener('play', emit);
  audioEl.addEventListener('pause', emit);
  audioEl.addEventListener('error', () => {
    console.warn('Falha ao carregar stream lofi');
    emit();
  });
}

export function isPlaying() {
  return Boolean(audioEl && !audioEl.paused);
}

export function toggle() {
  if (!audioEl) return;
  if (isPlaying()) {
    audioEl.pause();
    userPaused = true;
  } else {
    tryPlay();
    userPaused = false;
  }
}

export function duck(on) {
  if (!audioEl) return;
  audioEl.volume = on ? DUCK_VOLUME : DEFAULT_VOLUME;
}

export function pauseForGame() {
  if (!audioEl) return;
  audioEl.pause();
}

export function resumeForGame() {
  if (!audioEl || userPaused) return;
  tryPlay();
}

export function armOnFirstGesture() {
  if (armed || !audioEl) return;
  armed = true;
  const trigger = (e) => {
    if (e.key === 'm' || e.key === 'M') return;
    document.removeEventListener('keydown', trigger);
    if (!userPaused) tryPlay();
  };
  document.addEventListener('keydown', trigger);
}

export function onStateChange(cb) {
  stateListeners.push(cb);
}

function getSfxCtx() {
  if (sfxCtx) return sfxCtx;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  try {
    sfxCtx = new AC();
  } catch {
    return null;
  }
  return sfxCtx;
}

function playTone(ctx, frequency, startTime, duration) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(SFX_VOLUME, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playLineClearSfx(lines) {
  if (userPaused) return;
  const notes = LINE_CLEAR_NOTES[lines];
  if (!notes) return;
  const ctx = getSfxCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const now = ctx.currentTime;
  for (const [freq, offset, duration] of notes) {
    playTone(ctx, freq, now + offset, duration);
  }
}
