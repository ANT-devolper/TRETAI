export const dom = {
  canvas: document.getElementById('board'),
  nextCanvas: document.getElementById('next'),
  holdCanvas: document.getElementById('hold'),
  scoreEl: document.getElementById('score'),
  linesEl: document.getElementById('lines'),
  levelEl: document.getElementById('level'),
  overlay: document.getElementById('overlay'),
  overlayText: document.getElementById('overlayText'),
  restartBtn: document.getElementById('restartBtn'),
  panel: document.querySelector('.panel'),
};

export const ctx = dom.canvas.getContext('2d');
export const nextCtx = dom.nextCanvas.getContext('2d');
export const holdCtx = dom.holdCanvas.getContext('2d');

export function renderStats(score, lines, level) {
  dom.scoreEl.textContent = score;
  dom.linesEl.textContent = lines;
  dom.levelEl.textContent = level;
}

export function showOverlay(text, withRestart = false) {
  dom.overlayText.textContent = text;
  dom.overlay.classList.add('show');
  dom.restartBtn.classList.toggle('show', withRestart);
}

export function hideOverlay() {
  dom.overlay.classList.remove('show');
  dom.restartBtn.classList.remove('show');
}
