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
│   ├── render.js           # canvas drawing primitives (pure, take ctx + data)
│   ├── ui.js               # DOM references, canvas ctx, renderStats, showOverlay, etc.
│   ├── resize.js           # pure computeLayout(vw, vh); default reads from document
│   ├── input.js            # bindKeyboard with declarative KEY_MAP
│   ├── audio.js            # init, toggle, duck, armOnFirstGesture, onStateChange
│   ├── particles.js        # createBurst, stepParticles (pure) — line-clear effect
│   ├── trails.js           # createDropTrail, stepTrails (pure) — hard-drop trail effect
│   └── game.js             # orchestrator: mutable state + loop + wiring
├── tests/                  # unit (node --test)
│   ├── piece.test.js
│   ├── bag.test.js
│   ├── board.test.js
│   ├── scoring.test.js
│   ├── resize.test.js
│   ├── particles.test.js
│   └── trails.test.js
└── e2e/                    # Playwright
    ├── audio-mock.js       # helper: replaces window.Audio with MockAudio
    ├── smoke.spec.js
    ├── gameplay.spec.js
    ├── pause.spec.js
    ├── music.spec.js
    ├── persistence.spec.js
    ├── layout.spec.js
    └── hard-drop-trail.spec.js
```

### Layers

- **Pure** (no state, no DOM): `piece.js`, `bag.js`, `board.js`, `scoring.js`, `render.js`, `resize.js`, `particles.js`, `trails.js`.
- **Isolated side effects**: `ui.js` (DOM), `audio.js` (HTMLAudioElement + localStorage), `input.js` (event listeners).
- **Orchestration**: `game.js` is the only module with mutable game state. `audio.js` keeps its own encapsulated state.
- **Bootstrap**: `main.js`.

## Features

- Classic Tetris: 7 tetrominoes, rotation with wall kicks, ghost piece, hold, soft/hard drop.
- **7-bag randomizer**: pieces are dealt from a shuffled bag of all 7 types, refilled when empty, so every window of 7 pieces contains exactly one of each — no droughts, no long repeats.
- 500 ms lock delay when a piece touches the ground; the timer resets on each successful move/rotation so the player can slide and spin it into place. Hard drop still locks instantly; soft drop on a grounded piece is a no-op.
- Hard drop visual trail: each filled cell of the dropped piece leaves a rectangle covering the path it travelled, drawn in the piece color with a translucent white wash on top and fading out in ~200 ms.
- Score, line count, level (speeds up `dropInterval`).
- Pause and game over overlay with "Play again" button.
- **No-scroll** layout (vertical/horizontal locked), adaptive to any viewport — `CELL` recomputed on `resize`.
- Ambient lofi music via SomaFM Groove Salad stream with:
  - Play/pause button on the panel + `M` shortcut.
  - Pausing the game (`P`/`Esc`) also pauses the stream; resuming starts it again.
  - Reduced volume (duck) on game over.
  - Armed after first interaction due to autoplay policy.
  - Mute via `M` is session-only; reload always starts armed.

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

## Development guidelines

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
21. **Commit autonomously; never `git push` without an explicit request.** Once a change is green and clean, commit it without asking (typically at each green or after a refactor, so history reads as small working steps). Work directly on `main` — no per-task branches. Pushing to `origin` only happens when the user explicitly says "push", "pusha", "envia", "publica" or equivalent. When in doubt about pushing, ask first.

### Tests

22. **Every pure function needs a unit test.** New behavior in `piece.js`, `board.js`, `scoring.js`, `resize.js` requires a matching case under `tests/`.
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

1. Initial Tetris implementation (HTML+CSS+JS inline).
2. Responsive layout and scroll lock (`overflow: hidden`, viewport-based cell sizing).
3. CSS and JS split into their own files (`style.css`, `script.js`).
4. Modularization into ES Modules under `js/` by responsibility.
5. Ambient lofi music via SomaFM with duck on pause/game over.
6. Test infrastructure: `node --test` for unit (43 cases), Playwright for E2E (~20 specs), zero-dep static server in `scripts/serve.js`.
7. Music coupled to game state: `P`/`Esc` actually pause the stream (previously they only lowered the volume); mute via `M` became per-session (no `localStorage`) to avoid blocking autoplay on future reloads. Smoke spec switched to `getByRole('heading')` instead of `text=` for more robust asserts.
8. Documentation and tests fully translated to English; rule 27 dropped the PT-BR exception.
9. Lock delay: pieces grounded by gravity wait 500 ms before locking, with the timer resetting on each successful move/rotation so high-level play stays controllable. Soft drop on a grounded piece is now a no-op (hard drop still locks instantly).
10. Hard drop visual trail: pressing Space now leaves a quick fading rectangle per occupied cell, drawn in the piece color with a translucent white wash layered on top. Extracted as a pure module (`js/trails.js`) mirroring the particles pipeline (`createDropTrail`/`stepTrails`), wired through `state.trails` in `game.js`, rendered by `drawTrails` in `render.js`, and tuned via `TRAIL_DURATION` (0.2 s), `TRAIL_ALPHA_START` (0.3), and `TRAIL_WHITE_ALPHA` (0.2) in `constants.js`. Covered by unit tests in `tests/trails.test.js` and an E2E pixel-sampling check in `e2e/hard-drop-trail.spec.js`.
11. Browser tab identity: added `favicon.svg` at the repo root — a flat T tetromino in the in-game purple (`#a000f0`, same as `COLORS.T`) drawn as four `<rect>`s on a 32×32 viewBox. Linked from `index.html` via `<link rel="icon" type="image/svg+xml">` and paired with `<meta name="theme-color" content="#a000f0">` so the mobile/PWA URL bar picks up the accent. SVG keeps the runtime zero-dep and scales crisp at any DPI; no PNG/ICO variants.
12. High score persisted across sessions: pulled into its own isolated module (`js/highscore.js`) mirroring the `audio.js` pattern — `localStorage` reads/writes wrapped in `try/catch` so private mode never breaks the app, plus a pure `isNew(score, previous)` predicate for unit tests. A new "Recorde" box in the panel shows the current best (loaded on `start()` into `state.best`); on game over `spawn()` checks `isNew`, writes the new value, refreshes the panel, and feeds a celebration string ("NOVO RECORDE!" + current + previous) into `showOverlay`. `showOverlay` gained an optional `detail` argument plus a `.overlay-detail` block styled with a cyan glow pulse. Storage key lives in `constants.js` as `HIGH_SCORE_KEY`. Covered by unit tests in `tests/highscore.test.js` (16 cases including localStorage failures) and end-to-end specs in `e2e/highscore.spec.js` + `e2e/highscore-gameover.spec.js`, the latter forcing a deterministic stack by overriding `Math.random` so the new-record / no-record / restart branches are all exercised.
13. 7-bag randomizer replaces the uniform `randomPiece()`: pieces are now dealt from a shuffled bag of all 7 tetrominoes, refilled and reshuffled when empty, guaranteeing every window of 7 pieces contains exactly one of each (no droughts, no long repeats). Extracted as a pure module (`js/bag.js`) with `shuffleBag` (Fisher-Yates, RNG injectable), `newBag`, and `nextType(bag, rng) → { type, bag }`. The bag lives as `state.bag` in `game.js`, threaded through a `pullPiece()` helper that replaced the three `randomPiece()` call sites in `spawn()`/`reset()`; `reset()` clears the bag so each game starts fresh. `randomPiece()` and its tests were removed. Covered by unit tests in `tests/bag.test.js` (9 cases, including the 7-pull and 14-pull window guarantees across the refill seam). `e2e/highscore-gameover.spec.js` was updated: under 7-bag, `Math.random=0` yields the fixed order `[O,T,S,Z,J,L,I]`, so the spec now drops ~60 pieces straight down (central columns never complete a line, so the stack tops out deterministically).

14. Level pacing rebalanced for a longer climb: the score-driven curve hit the max level (8) at only 18000 points, so runs reached top speed and plateaued too early. `LEVEL_SCORE_THRESHOLDS` in `constants.js` was stretched ~2.8x to `[0, 1500, 4000, 8000, 14000, 22000, 34000, 50000]` (max now at 50000) so each level lasts longer and the difficulty ramp spreads across a fuller game. Per-level speeds (`LEVEL_DROP_INTERVALS`) are unchanged — only the spacing between levels grows. `tests/scoring.test.js` updated to assert the new thresholds.

15. SFX decoupled from the music mute: pressing `M` to mute the lofi stream also silenced the line-clear sound effects, because `playLineClearSfx` in `audio.js` consulted the music-only `userPaused` flag (set by `toggle()` when the stream goes playing → paused). Since the SFX are an independent Web Audio (`AudioContext`) subsystem, the `if (userPaused) return;` guard was removed so muting the music never affects sound effects. Guarded by a new regression spec `e2e/sfx-mute.spec.js` that mutes via `M` then asserts a line-clear SFX still creates oscillators on a spying `AudioContext` (red before the fix, green after) — it stays in the suite so any future re-coupling turns it red again.
