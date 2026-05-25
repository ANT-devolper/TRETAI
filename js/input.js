import { SCROLL_KEYS } from './constants.js';

const KEY_MAP = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowUp: 'rotate',
  x: 'rotate',
  X: 'rotate',
  ' ': 'hardDrop',
  c: 'hold',
  C: 'hold',
  p: 'pause',
  P: 'pause',
  Escape: 'pause',
  m: 'toggleMusic',
  M: 'toggleMusic',
};

export function bindKeyboard(handlers) {
  document.addEventListener('keydown', (e) => {
    if (SCROLL_KEYS.includes(e.key)) e.preventDefault();
    const action = KEY_MAP[e.key];
    if (action && handlers[action]) handlers[action]();
  }, { passive: false });
}
