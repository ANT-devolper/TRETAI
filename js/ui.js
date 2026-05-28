export const dom = {
  canvas: document.getElementById('board'),
  nextCanvas: document.getElementById('next'),
  holdCanvas: document.getElementById('hold'),
  scoreEl: document.getElementById('score'),
  linesEl: document.getElementById('lines'),
  levelEl: document.getElementById('level'),
  bestEl: document.getElementById('best'),
  overlay: document.getElementById('overlay'),
  overlayText: document.getElementById('overlayText'),
  overlayDetail: document.getElementById('overlayDetail'),
  restartBtn: document.getElementById('restartBtn'),
  panel: document.querySelector('.panel'),
  musicBtn: document.getElementById('musicBtn'),
};

export const ctx = dom.canvas.getContext('2d');
export const nextCtx = dom.nextCanvas.getContext('2d');
export const holdCtx = dom.holdCanvas.getContext('2d');

export function renderStats(score, lines, level) {
  dom.scoreEl.textContent = score;
  dom.linesEl.textContent = lines;
  dom.levelEl.textContent = level;
}

export function renderBest(best) {
  dom.bestEl.textContent = best;
}

export function showOverlay(text, withRestart = false, detail = null) {
  dom.overlayText.textContent = text;
  dom.overlay.classList.add('show');
  dom.restartBtn.classList.toggle('show', withRestart);
  if (detail) {
    dom.overlayDetail.textContent = detail;
    dom.overlayDetail.classList.add('show');
  } else {
    dom.overlayDetail.textContent = '';
    dom.overlayDetail.classList.remove('show');
  }
}

export function hideOverlay() {
  dom.overlay.classList.remove('show');
  dom.restartBtn.classList.remove('show');
  dom.overlayDetail.textContent = '';
  dom.overlayDetail.classList.remove('show');
}

export function renderMusicState({ playing }) {
  if (!dom.musicBtn) return;
  dom.musicBtn.textContent = playing ? '⏸ Pausar' : '▶ Tocar';
  dom.musicBtn.dataset.state = playing ? 'playing' : 'paused';
}
