// Game modes are pure data, mirroring themes.js: each mode declares how a run
// behaves so adding a new mode is just another entry here. The orchestrator
// (game.js) reads these flags instead of hard-coding mode-specific branches.
//   goalLines        — lines to clear to win, or null for an endless run
//   timed            — whether the run is timed (drives the on-screen clock)
//   levelProgression — whether level/speed climb with score (false keeps it fixed)
//   startLevel       — level the run begins at (and stays at when fixed)
export const MODES = {
  zen: {
    id: 'zen',
    name: 'Zen',
    description: 'Sem limites. Faça a maior pontuação.',
    goalLines: null,
    timed: false,
    levelProgression: true,
    startLevel: 1,
  },
  sprint: {
    id: 'sprint',
    name: '40 Linhas',
    description: 'Limpe 40 linhas o mais rápido possível.',
    goalLines: 40,
    timed: true,
    levelProgression: false,
    startLevel: 1,
  },
};

export const DEFAULT_MODE_ID = 'zen';

export function getMode(id) {
  return MODES[id] || MODES[DEFAULT_MODE_ID];
}

export function modeIds() {
  return Object.keys(MODES);
}

// Win condition: an endless mode (goalLines null) is never complete.
export function isModeComplete(mode, lines) {
  return mode.goalLines != null && lines >= mode.goalLines;
}
