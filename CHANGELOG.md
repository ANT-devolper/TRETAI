# Changelog

Project history for TRETAI, kept out of `CLAUDE.md` so the guidelines stay
focused on directives. Entries are milestones in chronological order, not
semantic versions.

## 1. Initial implementation
Initial Tetris implementation (HTML+CSS+JS inline).

## 2. Responsive layout
Responsive layout and scroll lock (`overflow: hidden`, viewport-based cell sizing).

## 3. File split
CSS and JS split into their own files (`style.css`, `script.js`).

## 4. ES Modules
Modularization into ES Modules under `js/` by responsibility.

## 5. Ambient music
Ambient lofi music via SomaFM with duck on pause/game over.

## 6. Test infrastructure
`node --test` for unit (43 cases), Playwright for E2E (~20 specs), zero-dep
static server in `scripts/serve.js`.

## 7. Music coupled to game state
`P`/`Esc` actually pause the stream (previously they only lowered the volume);
mute via `M` became per-session (no `localStorage`) to avoid blocking autoplay
on future reloads. Smoke spec switched to `getByRole('heading')` instead of
`text=` for more robust asserts.

## 8. English-only docs
Documentation and tests fully translated to English; the PT-BR test exception
was dropped.

## 9. Lock delay
Pieces grounded by gravity wait 500 ms before locking, with the timer resetting
on each successful move/rotation so high-level play stays controllable. Soft
drop on a grounded piece is now a no-op (hard drop still locks instantly).

## 10. Hard drop visual trail
Pressing Space now leaves a quick fading rectangle per occupied cell, drawn in
the piece color with a translucent white wash layered on top. Extracted as a
pure module (`js/trails.js`) mirroring the particles pipeline
(`createDropTrail`/`stepTrails`), wired through `state.trails` in `game.js`,
rendered by `drawTrails` in `render.js`, and tuned via `TRAIL_DURATION` (0.2 s),
`TRAIL_ALPHA_START` (0.3), and `TRAIL_WHITE_ALPHA` (0.2) in `constants.js`.
Covered by unit tests in `tests/trails.test.js` and an E2E pixel-sampling check
in `e2e/hard-drop-trail.spec.js`.

## 11. Browser tab identity
Added `favicon.svg` at the repo root — a flat T tetromino in the in-game purple
(`#a000f0`, same as `COLORS.T`) drawn as four `<rect>`s on a 32×32 viewBox.
Linked from `index.html` via `<link rel="icon" type="image/svg+xml">` and paired
with `<meta name="theme-color" content="#a000f0">` so the mobile/PWA URL bar
picks up the accent. SVG keeps the runtime zero-dep and scales crisp at any DPI;
no PNG/ICO variants.

## 12. Persisted high score
Pulled into its own isolated module (`js/highscore.js`) mirroring the `audio.js`
pattern — `localStorage` reads/writes wrapped in `try/catch` so private mode
never breaks the app, plus a pure `isNew(score, previous)` predicate for unit
tests. A new "Recorde" box in the panel shows the current best (loaded on
`start()` into `state.best`); on game over `spawn()` checks `isNew`, writes the
new value, refreshes the panel, and feeds a celebration string ("NOVO RECORDE!"
+ current + previous) into `showOverlay`. `showOverlay` gained an optional
`detail` argument plus a `.overlay-detail` block styled with a cyan glow pulse.
Storage key lives in `constants.js` as `HIGH_SCORE_KEY`. Covered by unit tests
in `tests/highscore.test.js` (16 cases including localStorage failures) and
end-to-end specs in `e2e/highscore.spec.js` + `e2e/highscore-gameover.spec.js`,
the latter forcing a deterministic stack by overriding `Math.random` so the
new-record / no-record / restart branches are all exercised.

## 13. 7-bag randomizer
Replaces the uniform `randomPiece()`: pieces are now dealt from a shuffled bag
of all 7 tetrominoes, refilled and reshuffled when empty, guaranteeing every
window of 7 pieces contains exactly one of each (no droughts, no long repeats).
Extracted as a pure module (`js/bag.js`) with `shuffleBag` (Fisher-Yates, RNG
injectable), `newBag`, and `nextType(bag, rng) → { type, bag }`. The bag lives
as `state.bag` in `game.js`, threaded through a `pullPiece()` helper that
replaced the three `randomPiece()` call sites in `spawn()`/`reset()`; `reset()`
clears the bag so each game starts fresh. `randomPiece()` and its tests were
removed. Covered by unit tests in `tests/bag.test.js` (9 cases, including the
7-pull and 14-pull window guarantees across the refill seam).
`e2e/highscore-gameover.spec.js` was updated: under 7-bag, `Math.random=0`
yields the fixed order `[O,T,S,Z,J,L,I]`, so the spec now drops ~60 pieces
straight down (central columns never complete a line, so the stack tops out
deterministically).

## 14. Level pacing rebalanced
The score-driven curve hit the max level (8) at only 18000 points, so runs
reached top speed and plateaued too early. `LEVEL_SCORE_THRESHOLDS` in
`constants.js` was stretched ~2.8x to `[0, 1500, 4000, 8000, 14000, 22000,
34000, 50000]` (max now at 50000) so each level lasts longer and the difficulty
ramp spreads across a fuller game. Per-level speeds (`LEVEL_DROP_INTERVALS`) are
unchanged — only the spacing between levels grows. `tests/scoring.test.js`
updated to assert the new thresholds.

## 15. SFX decoupled from music mute
Pressing `M` to mute the lofi stream also silenced the line-clear sound effects,
because `playLineClearSfx` in `audio.js` consulted the music-only `userPaused`
flag (set by `toggle()` when the stream goes playing → paused). Since the SFX
are an independent Web Audio (`AudioContext`) subsystem, the
`if (userPaused) return;` guard was removed so muting the music never affects
sound effects. Guarded by a new regression spec `e2e/sfx-mute.spec.js` that
mutes via `M` then asserts a line-clear SFX still creates oscillators on a
spying `AudioContext` (red before the fix, green after) — it stays in the suite
so any future re-coupling turns it red again.

## 16. Deduplication refactor (behavior-preserving)
Two repeated patterns were collapsed without changing any output. (a) In
`game.js`, the `score += X → levelFromScore → dropIntervalForLevel →
renderStats` sequence was duplicated across `softDrop`, `hardDrop` and
`lockPiece`; it now lives in a single `applyScore(points, clearedLines = 0)`
helper (`lineScore` is still evaluated at the call site against the pre-update
level). (b) In `render.js`, the beveled cell drawing (fill + light top/left
highlight, dark bottom/right shadow, black border) was duplicated between
`drawCell` and the inner loop of `drawPiecePreview`, differing only in bevel
thickness (4px vs 3px); extracted into a pixel-coordinate
`paintBevelCell(ctx, color, px, py, size, bevel)` helper. No tests changed — the
existing unit suite (82) and E2E pixel-sampling/scoring specs (31) stay green as
the regression guard. Scope was deliberately conservative: no state/loop
restructuring, and confirmed non-redundant state was left untouched (`audio.js`
`userPaused` distinguishes M-mute from game-pause, the `dim` preview arg is used
by hold).

## 17. Responsive HUD that always fits
On short viewports the side panel (score/lines/level/best/hold/next/music/
controls) was clipped by `html,body{overflow:hidden}` because, unlike the board
— whose `cell` scales down with height so it always fits — the panel kept its
natural height (`computeLayout` sized previews and the panel only from width).
Fixed with scale-to-fit, mirroring the board: a new pure
`scaleToFit(naturalHeight, availableHeight)` in `resize.js` returns
`min(1, available/natural)` (1 when it already fits, guards a zero/negative
measurement); `applyLayout()` in `game.js` measures the panel's natural height
via `measurePanelNaturalHeight()` (after sizing the canvases) and applies the
factor through `applyPanelScale()` in `ui.js`. Since `transform: scale` does not
shrink the layout box, the scale is applied via a `--panel-scale` CSS custom
property on `.panel` (`transform-origin: top center`) wrapped in a new
`.panel-fit` div whose height is pinned by JS to the board height
(`overflow: hidden`, `flex: 0 0 auto`) — so the natural panel size can no longer
grow `.game` and overflow the page. No internal scroll. As a secondary
improvement `previewSize` now also depends on `vh`
(`min(PREVIEW_MAX, panelWidth-24, floor(vh*PREVIEW_VH_FACTOR))`, floor
`PREVIEW_MIN`) so previews shrink first on medium heights before the global
scale kicks in. The pure math is unit-tested in `tests/resize.test.js`
(`scaleToFit` edge cases + vh-driven `previewSize`); the fit invariant is
guarded by E2E bounding-box assertions in `e2e/layout.spec.js` that drive a
900×360 viewport and assert the panel and the controls box stay within the
viewport (red before the fix, green after), plus a regression that
`--panel-scale` stays `1` on a tall viewport.

## 18. Master volume control
A "Volume" box in the panel holds a native `<input type="range">` (a bar with a
round thumb the player drags with the mouse) that scales **both** the music
stream and the line-clear SFX with a single master factor `m ∈ [0, 1]`. The
value is a multiplier over the existing tuned mix — music plays at
`m * DEFAULT_VOLUME` (or `m * DUCK_VOLUME` when ducked), SFX peak at
`SFX_VOLUME * m` — so `m = 1` (the default) reproduces the prior behavior exactly
and the relative music/SFX balance and ducking are preserved, just scaled.
`audio.js` gained module state (`masterVolume`, `ducked`) and a private
`applyMusicVolume()` that both `setVolume(v)` and `duck(on)` route through (duck
no longer sets `audioEl.volume` directly). Persistence lives in a new isolated
module `js/volume.js` mirroring `highscore.js`: a pure `clampVolume(v)`
(non-finite → default, else clamp to `[0,1]`) plus `read()`/`write()` wrapping
`localStorage` in `try/catch` (key `VOLUME_KEY`, default `DEFAULT_MASTER_VOLUME`
in `constants.js`). Unlike the session-only `M` mute, the volume **persists**
across reloads (it doesn't gate autoplay). DOM ref (`volumeEl`) and
`renderVolume(v)` are in `ui.js`; the `input` listener is wired in `game.js`
`start()` (reads slider/100 → `setVolume` + `volume.write`), which also loads the
persisted value on boot. The slider is styled in `style.css` (`appearance:none`
track + round `::-webkit-slider-thumb`/`::-moz-range-thumb` in the cyan accent,
sized with `clamp()`). Covered by unit tests in `tests/volume.test.js`
(`clampVolume` edges + `read`/`write` incl. localStorage failures) and E2E in
`e2e/volume.spec.js` (music volume scales with the slider, SFX gain scales, duck
stays relative to the master, slider position persists across reload) — the SFX
assertion was confirmed red before the `* masterVolume` scaling.
`e2e/audio-mock.js`'s `MockAudio` now exposes `window.__audioEl` so specs can
read the stream volume.

## 19. Theme switcher (first extra theme)
The previously fixed palette is now selectable. A settings gear (⚙) absolutely
positioned in the board's top-right corner pauses the game (mirroring
`togglePause`'s pause branch) and opens a `.settings-menu` overlay listing the
available themes; closing it resumes. Two themes ship: **Clássico** (the original
look) and **Game Boy** (monochrome DMG green). The canvas side was made themeable
by keeping `render.js` pure but passing the palette by argument instead of
importing the static `COLORS` —
`drawCell`/`drawLockedCells`/`drawPiece`/`drawPiecePreview` take a `colors` map
and `drawGrid` takes `bg`/`grid`; `game.js` threads
`state.theme.colors`/`state.theme.board` through every render call (and into
`createBurst`/`createDropTrail`). Theme data lives in a pure `js/themes.js`
(`THEMES`, `getTheme`, `themeIds`; `classic` reuses `COLORS`, `gameboy` is seven
distinct olive-greens all lighter than its dark `board.bg`). The DOM side is
themed by CSS custom properties on `:root` (defaults = the classic values, so the
classic look is byte-for-byte unchanged) overridden under
`html[data-theme="gameboy"]`; `applyTheme(theme)` in `ui.js` sets
`document.documentElement.dataset.theme`. Selection **persists** via a new
isolated `js/theme.js` mirroring `volume.js` — pure `clampThemeId(id)` (unknown →
`DEFAULT_THEME_ID`) plus `read()`/`write()` wrapping `localStorage` in `try/catch`
(key `THEME_KEY`). `ui.js` also gained
`renderThemeOptions`/`showSettings`/`hideSettings` (it stays stateless: `game.js`
owns the active id and rebuilds the option buttons on each change). Covered by
unit tests in `tests/themes.test.js` (16 cases: theme shape, gameboy contrast,
`getTheme`/`clampThemeId` fallbacks, `read`/`write` incl. localStorage failures —
confirmed red before the modules existed) and E2E in `e2e/theme.spec.js` (gear in
the top-right, gear opens menu + pauses, selecting Game Boy flips `data-theme` +
accent + board-background pixel and persists across reload, closing resumes).

## 20. Neon theme
A third theme, **Neon** (synthwave): vivid pieces (cyan/magenta/lime/etc.) over a
dark indigo board with a magenta accent. Pure addition on top of the existing
switcher — a `THEMES.neon` entry in `js/themes.js` plus an `html[data-theme="neon"]`
block in `style.css`; the menu lists it automatically since the option buttons are
generated from `themeIds()`. The gameboy-specific "pieces distinct from the board
background" unit test was generalized to iterate **all** themes, so every present
and future palette is guarded for legibility, and `e2e/theme.spec.js` gained a
data-driven check that selecting an extra theme flips `data-theme` and repaints the
board-background pixel to that theme's `board.bg` (red for `neon` before the entry
existed, green after).

## 21. Sunset theme
A fourth theme, **Sunset** (vaporwave): warm pieces (orange/pink/teal/violet) over
a deep plum board with an orange accent. Same pure pattern as Neon — a
`THEMES.sunset` entry in `js/themes.js` and an `html[data-theme="sunset"]` block in
`style.css`; covered by the already-generalized contrast unit guard and the
data-driven board-pixel E2E (red for `sunset` before the entry, green after).
