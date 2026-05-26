# TRETAI

A modern, no-build Tetris built with vanilla JavaScript ES Modules, HTML5 Canvas and CSS — served as a static site on GitHub Pages.

The goal of TRETAI is to be a faithful, fun, responsive implementation of classic Tetris with zero runtime dependencies: open the page, press a key, and play. Every piece of game logic is written as pure functions so it can be reasoned about and unit-tested in isolation, while DOM, canvas and audio side effects are kept at the edges of the codebase.

## Features

- Classic Tetris rules: 7 tetrominoes, rotation with wall kicks, ghost piece, hold slot, soft and hard drop.
- 500 ms lock delay when a piece touches the ground; the timer resets on each successful move/rotation, so the player can slide and spin pieces into place. Hard drop still locks instantly.
- Score, line count, level progression — `dropInterval` shortens as the level rises.
- Pause and game over overlays with a "Play again" button.
- No-scroll, viewport-locked layout. The `CELL` size is recomputed on every `resize`, so the board fits any screen without breakpoints.
- Ambient lofi music streamed from SomaFM Groove Salad:
  - Toggle via panel button or the `M` shortcut.
  - Pausing the game (`P` / `Esc`) also pauses the stream; resuming starts it again.
  - Volume ducks on game over.
  - Armed after the first user interaction to respect autoplay policies.
  - Mute via `M` is session-only — a reload always starts armed.

### Controls

| Key       | Action       |
|-----------|--------------|
| ← →       | Move         |
| ↓         | Soft drop    |
| ↑ / X     | Rotate       |
| Space     | Hard drop    |
| C         | Hold         |
| P / Esc   | Pause        |
| M         | Music on/off |

## Stack

- HTML5, CSS3, JavaScript ES Modules — no framework, no bundler.
- Canvas 2D for the board and the next/hold previews.
- Static deploy on GitHub Pages directly from the repository root.
- Test tooling (in `devDependencies` only, never shipped):
  - Native `node --test` for unit tests.
  - Playwright for E2E.

## Project structure

```
TRETAI/
├── index.html              # markup + <link style.css> + <script type="module" src="js/main.js">
├── style.css               # all styles (no inline)
├── CLAUDE.md
├── README.md
├── package.json            # devDeps only (Playwright)
├── playwright.config.js
├── scripts/
│   └── serve.js            # zero-dep static server used in dev and E2E
├── js/
│   ├── main.js             # entry point (init audio, start game)
│   ├── constants.js        # COLS, ROWS, COLORS, SHAPES, scoring, audio, shortcuts
│   ├── piece.js            # makePiece, randomPiece, rotate (pure)
│   ├── board.js            # newBoard, collides, merge, clearLines, computeGhostY (pure)
│   ├── scoring.js          # lineScore, levelFromLines, dropIntervalForLevel (pure)
│   ├── render.js           # canvas drawing primitives (pure, take ctx + data)
│   ├── ui.js               # DOM references, canvas ctx, renderStats, showOverlay
│   ├── resize.js           # pure computeLayout(vw, vh); default reads from document
│   ├── input.js            # bindKeyboard with declarative KEY_MAP
│   ├── audio.js            # init, toggle, duck, armOnFirstGesture, onStateChange
│   └── game.js             # orchestrator: mutable state + loop + wiring
├── tests/                  # unit (node --test)
└── e2e/                    # Playwright specs
```

### Architectural layers

- **Pure** (no state, no DOM): `piece.js`, `board.js`, `scoring.js`, `render.js`, `resize.js`.
- **Isolated side effects**: `ui.js` (DOM), `audio.js` (HTMLAudioElement + localStorage), `input.js` (event listeners).
- **Orchestration**: `game.js` is the only module with mutable game state. `audio.js` keeps its own encapsulated state.
- **Bootstrap**: `main.js`.

## Running locally

ES Modules require an HTTP/HTTPS origin — opening `index.html` directly via `file://` will not work.

```bash
# option 1: bundled zero-dep server
npm start
# serves at http://localhost:4173

# option 2: VS Code Live Server extension
# click "Go Live"

# option 3: Python
python3 -m http.server 8000
```

## Running the tests

```bash
npm install                # first time: installs Playwright in devDeps
npx playwright install     # downloads the browser (first time only)

npm test                   # unit tests (node --test)
npm run test:watch         # unit in watch mode
npm run test:coverage      # unit with coverage report
npm run test:e2e           # E2E (Playwright headless)
npm run test:e2e:ui        # E2E with the interactive UI
npm run test:all           # unit + E2E
```

The Playwright `webServer` boots `scripts/serve.js` automatically before E2E runs.

## Deploy

Automatic deploy via **GitHub Pages**, serving the root of `main`. Every `git push` to `main` publishes.

GitHub setup:

1. Repository → **Settings** → **Pages**.
2. **Source**: `Deploy from a branch`.
3. **Branch**: `main` / `/ (root)` → **Save**.

No build step, no custom workflow, no `vercel.json` — the site is served as-is from the repository root.

## Contributing

Before opening a PR:

- Run `npm test` whenever you touch a pure module (`piece`, `board`, `scoring`, `resize`).
- Run `npm run test:e2e` before any non-trivial change that affects rendering, input, audio or layout.
- Follow Conventional Commits (`feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`) and explain the motivation in the commit body.
- Keep documentation, commits and code comments in English.

The full development guidelines live in [CLAUDE.md](./CLAUDE.md).
