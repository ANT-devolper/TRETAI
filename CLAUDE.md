# TRETAI

Tetris game in vanilla JavaScript, modular via ES Modules, served as a static site.

## Stack

- HTML5, CSS3, JavaScript ES Modules — no framework, no bundler.
- Canvas 2D for board and preview rendering.
- Static deploy on GitHub Pages (repo root).
- Test tooling in `devDependencies` (does not affect runtime/deploy):
  - Native `node --test` for unit tests (zero dep)
  - Playwright for E2E

## Structure

```
TRETAI/
├── index.html              # markup + <link style.css> + <script type="module" src="js/main.js">
├── favicon.svg             # SVG favicon (purple T tetromino)
├── style.css               # all styles (no inline)
├── CLAUDE.md
├── package.json            # devDeps only (Playwright)
├── playwright.config.js
├── scripts/
│   └── serve.js            # zero-dep static server (Node http) used in dev and E2E
├── js/
│   ├── main.js             # entry point (init audio, start game)
│   ├── constants.js        # COLS, ROWS, COLORS, SHAPES, scoring, audio, shortcuts
│   ├── piece.js            # makePiece, rotate (pure)
│   ├── bag.js              # shuffleBag, newBag, nextType — 7-bag randomizer (pure)
│   ├── board.js            # newBoard, collides, merge, clearLines, computeGhostY (pure)
│   ├── scoring.js          # lineScore, levelFromLines, dropIntervalForLevel (pure)
│   ├── combo.js            # advanceCombo, comboBonus, comboParticleCount, comboToneFreq (pure)
│   ├── modes.js            # MODES data + getMode/modeIds/isModeComplete (pure) — game modes
│   ├── time.js             # formatTime(ms) → m:ss.cc (pure) — sprint stopwatch
│   ├── render.js           # canvas drawing primitives (pure, take ctx + data)
│   ├── ui.js               # DOM references, canvas ctx, renderStats, showOverlay, etc.
│   ├── resize.js           # pure computeLayout(vw, vh); default reads from document
│   ├── input.js            # bindKeyboard with declarative KEY_MAP
│   ├── audio.js            # init, toggle, duck, armOnFirstGesture, onStateChange
│   ├── particles.js        # createBurst, stepParticles (pure) — line-clear effect
│   ├── trails.js           # createDropTrail, stepTrails (pure) — hard-drop trail effect
│   ├── themes.js           # THEMES data + getTheme/themeIds (pure) — palettes
│   ├── theme.js            # selected-theme persistence (localStorage) + clampThemeId
│   ├── highscore.js        # high-score persistence (localStorage) + isNew
│   ├── besttime.js         # per-mode best-time persistence (localStorage) + isBetter
│   ├── volume.js           # master-volume persistence (localStorage) + clampVolume
│   ├── visited.js          # first-visit flag persistence (localStorage)
│   └── game.js             # orchestrator: mutable state + loop + wiring
├── tests/                  # unit (node --test)
│   ├── piece.test.js
│   ├── bag.test.js
│   ├── board.test.js
│   ├── scoring.test.js
│   ├── combo.test.js
│   ├── resize.test.js
│   ├── particles.test.js
│   ├── trails.test.js
│   ├── themes.test.js
│   ├── highscore.test.js
│   ├── volume.test.js
│   ├── besttime.test.js
│   ├── modes.test.js
│   └── time.test.js
└── e2e/                    # Playwright
    ├── audio-mock.js       # helper: replaces window.Audio with MockAudio
    ├── fixtures.js         # helper: seed visited flag + auto-pick Zen after navigation
    ├── smoke.spec.js
    ├── gameplay.spec.js
    ├── pause.spec.js
    ├── music.spec.js
    ├── persistence.spec.js
    ├── layout.spec.js
    ├── hard-drop-trail.spec.js
    ├── combo-sfx.spec.js
    ├── perfect-clear.spec.js
    ├── highscore.spec.js
    ├── highscore-gameover.spec.js
    ├── restart-enter.spec.js
    ├── sfx-mute.spec.js
    ├── volume.spec.js
    ├── tutorial.spec.js
    ├── theme.spec.js
    ├── mode-select.spec.js
    └── sprint.spec.js
```

### Layers

- **Pure** (no state, no DOM): `piece.js`, `bag.js`, `board.js`, `scoring.js`, `combo.js`, `render.js`, `resize.js`, `particles.js`, `trails.js`, `themes.js`, `modes.js`, `time.js`.
- **Isolated side effects**: `ui.js` (DOM), `audio.js` (HTMLAudioElement + localStorage), `input.js` (event listeners), `theme.js`/`highscore.js`/`volume.js`/`visited.js`/`besttime.js` (localStorage).
- **Orchestration**: `game.js` is the only module with mutable game state. `audio.js` keeps its own encapsulated state.
- **Bootstrap**: `main.js`.

## Features

- Classic Tetris: 7 tetrominoes, rotation with wall kicks, ghost piece, hold, soft/hard drop.
- **Game modes**: a mode-select menu opens on every load (the first-visit tutorial hands off to it). **Zen** is the endless mode (score forever, level/speed climb). **40 Linhas** is a timed sprint — clear 40 lines as fast as possible at a fixed speed, ending in a `VITÓRIA!` overlay that records a per-mode best time (smaller is better). Modes are pure data in `modes.js` (`MODES`, `getMode`, `modeIds`, `isModeComplete`) declaring `goalLines`/`timed`/`levelProgression`/`startLevel`, so new modes are just data entries. The HUD adapts per mode (`configureHudForMode`): the Tempo box shows only when timed, Nível only when the level climbs, Linhas shows `n / goal`, and Recorde shows best time (sprint) or high score (zen). The stopwatch (`time.js` `formatTime`) accumulates only while unpaused; best times persist via `besttime.js` (key `BEST_TIME_KEY_PREFIX + modeId`). A floating ⚑ button (mirroring the ⚙ gear, opposite corner) reopens the menu mid-run to switch modes or resume; the initial menu forces a choice (no Fechar, `Esc` ignored).
- **7-bag randomizer**: pieces are dealt from a shuffled bag of all 7 types, refilled when empty, so every window of 7 pieces contains exactly one of each — no droughts, no long repeats.
- 500 ms lock delay when a piece touches the ground; the timer resets on each successful move/rotation so the player can slide and spin it into place. Hard drop still locks instantly; soft drop on a grounded piece is a no-op.
- Hard drop visual trail: each filled cell of the dropped piece leaves a rectangle covering the path it travelled, drawn in the piece color with a translucent white wash on top and fading out in ~200 ms.
- Score, line count, level (speeds up `dropInterval`).
- **Combo**: consecutive line-clearing locks build a combo, reset by any lock that clears nothing. From ×2 on it rewards the player with a classic bonus (`50 × (combo-1) × level` added to the line score), a pulsing "COMBO ×N" banner, growing screen shake + color flash, boosted line-clear particles, and an extra ascending square-wave tone layered on the line SFX. Pure logic lives in `combo.js` (`advanceCombo`, `comboBonus`, `comboParticleCount`, `comboToneFreq`).
- **Perfect Clear**: a lock that clears lines and leaves the board completely empty triggers a Perfect Clear — a classic bonus on top of the line/combo score (`PERFECT_CLEAR_BONUS` table `1→800, 2→1200, 3→1800, 4→2000`, all `× level`), a golden pulsing "PERFECT CLEAR" banner, and a triumphant ascending arpeggio layered on the line SFX. Pure logic: `isBoardEmpty` (`board.js`) detects the empty board, `perfectClearBonus` (`scoring.js`) computes the reward.
- Drop scoring: soft drop scores 1 point per cell descended, hard drop 2 points per cell (classic Tetris guideline), applied in `game.js`.
- Pause and game over overlay with "Play again" button; on game over, `Enter` also restarts (no-op while a game is in progress) and the overlay shows a hint pointing to both ways to restart.
- **No-scroll** layout (vertical/horizontal locked), adaptive to any viewport — `CELL` recomputed on `resize`.
- Ambient lofi music via SomaFM Groove Salad stream with:
  - Play/pause button on the panel + `M` shortcut.
  - Pausing the game (`P`/`Esc`) also pauses the stream; resuming starts it again.
  - Reduced volume (duck) on game over.
  - Armed after first interaction due to autoplay policy.
  - Mute via `M` is session-only; reload always starts armed.
- **First-visit tutorial**: on the very first visit (no `tretai.visited` flag in `localStorage`) a "Como jogar" welcome screen — a full-screen modal mirroring the theme menu — opens with the game paused, listing the essential controls and the goal, plus a "Começar a jogar" button. Clicking it or pressing `Esc` dismisses the modal, marks the visit, and opens the mode-select menu. It never reappears afterwards (the panel's "Controles" box stays as the permanent reference).
- **Theme switcher**: a settings gear (⚙) floating in the viewport's top-right corner pauses the game and opens a menu to pick a theme. Themes available: **Clássico** (the original cyan-on-black look), **Game Boy** (monochrome DMG green), **Neon** (synthwave), **Sunset** (vaporwave) and **Pastel** (light mode). Switching repaints both the canvas (piece colors + board background/grid, plus a per-theme ghost color so it stays visible on light boards) and the whole DOM (panel/background accents); the choice persists across reloads. While the menu is open the game stays paused: `P` is ignored, `Esc` closes the menu (resuming the game, like the Fechar button), and selecting a theme also closes the menu and resumes.

### Controls

| Key         | Action              |
|-------------|---------------------|
| ← →         | Move                |
| ↓           | Soft drop           |
| ↑ / X       | Rotate              |
| Space       | Hard drop           |
| C           | Hold                |
| P / Esc     | Pause               |
| M           | Music on/off        |
| Enter       | Restart (game over) |

The floating ⚑ button (top-left) opens the mode-select menu at any time; the ⚙
gear (top-right) opens the theme menu. `Esc` closes whichever menu is open
(resuming the run if one is in progress).

## Development guidelines

### Pair workflow (XP)

We work as an XP pair: **Claude is the driver** (writes code and tests), **the
user is the navigator and quality owner** (sets direction, reviews, decides
acceptance). These rules govern how we collaborate; the sections below govern
the code itself.

A. **Stop and ask on design forks; stay autonomous on the rest.** Pause and
   present options before coding whenever a choice is genuinely the navigator's:
   ambiguous requirements, public API or module-boundary changes, new
   dependencies (none are allowed — see rule 10), data/storage format or key
   changes, anything hard to reverse, or scope that grows beyond what was asked.
   Outside those forks — implementation details, test writing, naming, routine
   refactors, and commits — proceed without asking. When in doubt, ask with a
   recommended option rather than guessing.

B. **Smallest thing that works.** Build only what the current task needs; do not
   add abstraction, configuration, or features for hypothetical futures (YAGNI).
   Keep the diff minimal and focused — a small reviewable change beats a clever
   broad one. If you spot a worthwhile larger refactor, name it as a follow-up
   instead of folding it in.

C. **Make the navigator's review easy.** When you hand work back, state in one
   or two lines: what changed and why, what to test manually (if anything), and
   any risk or assumption you made. Keep refactor commits separate from
   behavior-changing commits so each diff has a single intent.

D. **Definition of Done** — a change is done only when all of these hold:
   1. The relevant tests pass (`npm test` for pure modules; E2E when DOM/audio/
      integration changed — rules 22–28).
   2. New behavior was driven red→green, with the failing test observed first
      (rule 31).
   3. No dead code, no leftover debug logging, no unused state (rule 9 + the
      dedup discipline in the changelog).
   4. The commit follows Conventional Commits with a motivation in the body
      (rules 17–19).
   5. `CHANGELOG.md` gets a new section for any meaningful change, and `CLAUDE.md`
      is updated if a guideline, structure, or feature changed.

### Architecture

1. **Pure functions whenever possible.** Game logic (piece, board, scoring) and rendering take data as arguments and do not access global state or DOM.
2. **Centralized mutable state.** Only `game.js` holds the game state. `audio.js` keeps its own encapsulated state. No other module should introduce state.
3. **Constants in `constants.js`.** Magic numbers, URLs, localStorage keys and key maps live here.
4. **DOM only in `ui.js`.** No `document.getElementById` or `querySelector` outside this module (exception: `resize.js` for `clientWidth/Height`).
5. **Declarative input.** New shortcuts go into `KEY_MAP` in `input.js` and get a handler in the `bindKeyboard` call in `game.js`.

### Code style

6. **No inline styles, no `<style>` or `<script>` in HTML.** Styles in `style.css`, JS in `js/*.js`.
7. **Responsive layout via `clamp()` and viewport math.** No fixed breakpoints.
8. **Page locked without scroll.** `html, body { overflow: hidden }` + `preventDefault` on arrows/space/PageUp/Down/Home/End in `input.js`.
9. **Comments only when the "why" is not obvious.** Clear names replace "what" comments.
10. **No external dependencies.** Everything native to the browser.

### Audio

11. **Public stream only.** SomaFM is licensed for public listening; do not hotlink services that forbid it (lofi.cafe, Lofi Girl, etc.).
12. **Respect the autoplay policy.** Sound only fires after a user gesture — use `armOnFirstGesture`.
13. **Preferences in `localStorage` with `try/catch`.** Private mode may block access; never break the app.

### Deploy

14. **GitHub Pages straight from root.** No build command.
15. **ES Modules require HTTP/HTTPS.** In local dev, use Live Server or `python3 -m http.server`. Never open via `file://`.
16. **Relative paths.** `./constants.js`, `js/main.js`, `style.css` — work on any host (root or subpath).

### Commits, PRs and documentation

17. **Everything in English.** Commit messages, PR titles and descriptions, README, CLAUDE.md, code comments and any other documentation are written in English. No exceptions.
18. **Conventional Commits.** Format `type(scope): description`, imperative mood, lowercase, no trailing period. Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`, `perf`, `build`, `ci`, `revert`. Scope is optional. Breaking changes add `!` after the type/scope and a `BREAKING CHANGE:` footer.
19. **Message includes motivation.** Commit body explains the "why" of the change, not just the "what".
20. **Do not add co-authorship.** Do not apply `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
21. **Commit autonomously; never `git push` without an explicit request.** Once a change meets the Definition of Done (workflow rule D), commit it without asking (typically at each green or after a refactor, so history reads as small working steps) — committing is implementation, not a design fork (workflow rule A). Work directly on `main` — no per-task branches. Pushing to `origin` only happens when the user explicitly says "push", "pusha", "envia", "publica" or equivalent. When in doubt about pushing, ask first.

### Tests

22. **Every pure function needs a unit test.** New behavior in any module of the Pure layer (`piece.js`, `bag.js`, `board.js`, `scoring.js`, `combo.js`, `resize.js`, `particles.js`, `trails.js`, `themes.js`, `modes.js`, `time.js`) requires a matching case under `tests/`. The lone exception is `render.js`: it is pure but draws to a canvas, so its output is verified by E2E pixel-sampling specs (rule 23) rather than unit tests.
23. **DOM, audio and integration → E2E.** Do not try to emulate DOM in Node; use Playwright under `e2e/` for real flows.
24. **Test behavior, not implementation.** Assertions on input→output or observable state (DOM, `localStorage`); never on internal module details.
25. **Refactor for testability when useful.** If a pure function gets trapped behind side effects, extract the pure part to accept parameters (e.g., `computeLayout(vw, vh)`).
26. **Mocks at the right level.** Mock `Math.random`, `Date.now`, `localStorage`, `window.Audio` when needed; do not mock the module under test.
27. **Tests in English.** Names describe the case, not a generic "should". UI strings used inside selectors and assertions stay in their original language because they come from the rendered DOM.
28. **Run `npm test` before commits that touch a pure module; `npm run test:e2e` before significant PRs.**
29. **Runtime stays zero-dep.** Test tooling lives exclusively in `devDependencies`. GitHub Pages ignores it.
30. **`node_modules/`, `playwright-report/`, `test-results/` are in `.gitignore`.**
31. **Red→green for new features.** Write the failing test BEFORE the implementation, in the right layer (unit for pure code, E2E for DOM/integration). Run it and confirm it fails for the expected reason, then write the minimum code to turn it green. If for some reason a test is added after the code is already green, demonstrate it catches regressions by temporarily reverting the relevant impl and showing the test goes red — a test that has never been observed failing proves nothing.
32. **Force determinism in E2E.** When a test needs a specific game state (game over, line clear, level transition), inject determinism via `page.addInitScript` — override `Math.random`, seed `localStorage`, or mock `window.Audio` — and then drive the input loop. Don't rely on random piece sequences to "eventually" reach the state. Example: `e2e/highscore-gameover.spec.js` fixes `Math.random = () => 0` so a fixed 7-bag order and a generous run of hard drops deterministically game-over the board.

## How to run locally

```bash
# option 1: bundled server (zero dep)
npm start
# opens at http://localhost:4173

# option 2: Live Server (VS Code extension)
# click "Go Live"

# option 3: Python
python3 -m http.server 8000
```

Does not work via `file://` because of ES Modules.

## How to run tests

```bash
npm install                # first time: installs Playwright in devDeps
npx playwright install     # downloads the browser (first time only)

npm test                   # unit tests (node --test)
npm run test:watch         # unit in watch mode
npm run test:coverage      # unit with coverage report
npm run test:e2e           # E2E (Playwright headless)
npm run test:e2e:ui        # E2E with interactive UI for debugging
npm run test:all           # unit + E2E
```

The Playwright webServer automatically starts `scripts/serve.js` before E2E tests.

## How to deploy

Automatic deploy via **GitHub Pages** serving the root of `main`. Every `git push` to `main` publishes.

GitHub configuration:

1. Repository → **Settings** → **Pages**.
2. **Source**: `Deploy from a branch`.
3. **Branch**: `main` / `/ (root)` → **Save**.

No build step, no custom workflow, no `vercel.json` — the site is served as-is from the root.

## Project history

Detailed milestone-by-milestone history lives in [`CHANGELOG.md`](./CHANGELOG.md).
Add a new section there for every meaningful change (see the Definition of Done).

Short arc so far: inline prototype → responsive no-scroll layout → split files →
ES Modules by responsibility → ambient SomaFM music with ducking → test
infrastructure (`node --test` + Playwright) → gameplay depth (lock delay, hard-drop
trail, 7-bag randomizer, level-pacing rebalance) → polish and persistence (favicon,
high score, master volume, theme switcher) → behavior-preserving dedup refactor and
a scale-to-fit responsive HUD.
