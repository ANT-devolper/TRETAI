import { COLS, ROWS } from './constants.js';

export function computeLayout(vw, vh) {
  if (vw === undefined) vw = document.documentElement.clientWidth;
  if (vh === undefined) vh = document.documentElement.clientHeight;
  const panelWidth = Math.max(140, Math.min(200, vw * 0.18));
  const gap = Math.max(8, Math.min(24, vw * 0.015));
  const pad = Math.max(8, Math.min(20, vh * 0.015)) * 2 + 4;
  const availW = vw - panelWidth - gap - pad - 8;
  const availH = vh - pad - 8;
  const cellByW = Math.floor(availW / COLS);
  const cellByH = Math.floor(availH / ROWS);
  const cell = Math.max(10, Math.min(cellByW, cellByH));
  const previewSize = Math.max(60, Math.min(120, panelWidth - 24));
  const previewCell = Math.floor(previewSize / 5);
  return { cell, previewSize, previewCell, panelWidth };
}
