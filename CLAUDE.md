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
├── style.css               # all styles (no inline)
├── CLAUDE.md
├── package.json            # devDeps only (Playwright)
├── playwright.config.js
├── scripts/
│   └── serve.js            # zero-dep static server (Node http) used in dev and E2E
├── js/
│   ├── main.js             # entry point (init audio, start game)
│   ├── constants.js        # COLS, ROWS, COLORS, SHAPES, scoring, audio, shortcuts
│   ├── piece.js            # makePiece, randomPiece, rotate (pure)
│   ├── board.js            # newBoard, collides, merge, clearLines, computeGhostY (pure)
│   ├── scoring.js          # lineScore, levelFromLines, dropIntervalForLevel (pure)
│   ├── render.js           # canvas drawing primitives (pure, take ctx + data)
│   ├── ui.js               # DOM references, canvas ctx, renderStats, showOverlay, etc.
│   ├── resize.js           # pure computeLayout(vw, vh); default reads from document
│   ├── input.js            # bindKeyboard with declarative KEY_MAP
│   ├── audio.js            # init, toggle, duck, armOnFirstGesture, onStateChange
│   └── game.js             # orchestrator: mutable state + loop + wiring
├── tests/                  # unit (node --test)
│   ├── piece.test.js
│   ├── board.test.js
│   ├── scoring.test.js
│   └── resize.test.js
└── e2e/                    # Playwright
    ├── audio-mock.js       # helper: replaces window.Audio with MockAudio
    ├── smoke.spec.js
    ├── gameplay.spec.js
    ├── pause.spec.js
    ├── music.spec.js
    ├── persistence.spec.js
    └── layout.spec.js
```

### Layers

- **Pure** (no state, no DOM): `piece.js`, `board.js`, `scoring.js`, `render.js`, `resize.js`.
- **Isolated side effects**: `ui.js` (DOM), `audio.js` (HTMLAudioElement + localStorage), `input.js` (event listeners).
- **Orchestration**: `game.js` is the only module with mutable game state. `audio.js` keeps its own encapsulated state.
- **Bootstrap**: `main.js`.

## Features

- Classic Tetris: 7 tetrominoes, rotation with wall kicks, ghost piece, hold, soft/hard drop.
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
18. **Conventional Commits.** Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`.
19. **Message includes motivation.** Commit body explains the "why" of the change, not just the "what".
20. **Do not add co-authorship.** Do not apply `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
21. **Never `git push` without an explicit request.** Local commits may be created when the user asks to commit, but pushing to `origin` only happens when the user explicitly says "push", "pusha", "envia", "publica" or equivalent. When in doubt, ask first.

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
