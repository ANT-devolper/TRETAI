import { DEFAULT_VOLUME, DUCK_VOLUME, STORAGE_KEY_MUTED } from './constants.js';

let audioEl = null;
let userPaused = false;
let armed = false;
const stateListeners = [];

function loadUserPaused() {
  try {
    return localStorage.getItem(STORAGE_KEY_MUTED) === '1';
  } catch {
    return false;
  }
}

function saveUserPaused(value) {
  try {
    localStorage.setItem(STORAGE_KEY_MUTED, value ? '1' : '0');
  } catch {}
}

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
  userPaused = loadUserPaused();
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
  saveUserPaused(userPaused);
}

export function duck(on) {
  if (!audioEl) return;
  audioEl.volume = on ? DUCK_VOLUME : DEFAULT_VOLUME;
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
