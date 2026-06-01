import {
  COMBO_MIN_TO_SHOW,
  COMBO_BONUS_PER_LEVEL,
  COMBO_PARTICLE_BOOST,
  COMBO_PARTICLE_MAX,
  COMBO_TONE_BASE,
  COMBO_TONE_SEMITONES,
  COMBO_TONE_MAX_STEPS,
} from './constants.js';

// Avança o contador de combo num lock: encadeia se limpou linha, zera se não.
export function advanceCombo(combo, cleared) {
  return cleared > 0 ? combo + 1 : 0;
}

// Bônus clássico somado ao lineScore, válido a partir do combo ×2.
export function comboBonus(combo, level) {
  if (combo < COMBO_MIN_TO_SHOW) return 0;
  return COMBO_BONUS_PER_LEVEL * (combo - 1) * level;
}

// Escala a contagem de partículas por célula conforme o combo (com teto).
// Abaixo de ×2 devolve a base, preservando o comportamento atual.
export function comboParticleCount(base, combo) {
  if (combo < COMBO_MIN_TO_SHOW) return base;
  const scaled = Math.round(base * (1 + COMBO_PARTICLE_BOOST * (combo - 1)));
  return Math.min(scaled, COMBO_PARTICLE_MAX);
}

// Frequência do tom extra: sobe por semitons a cada elo, saturando no teto.
export function comboToneFreq(combo) {
  const steps = Math.min(Math.max(combo - COMBO_MIN_TO_SHOW, 0), COMBO_TONE_MAX_STEPS);
  return COMBO_TONE_BASE * 2 ** ((steps * COMBO_TONE_SEMITONES) / 12);
}
