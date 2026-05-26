# TRETAI

Jogo de Tetris em vanilla JavaScript, modular via ES Modules, servido como site estático.

## Stack

- HTML5, CSS3, JavaScript ES Modules — sem framework, sem bundler.
- Canvas 2D para renderização do tabuleiro e previews.
- Deploy estático no GithubPages(raiz do repo).
- Tooling de teste em `devDependencies` (não afeta runtime/deploy):
  - `node --test` nativo para unit tests (zero dep)
  - Playwright para E2E

## Estrutura

```
TRETAI/
├── index.html              # markup + <link style.css> + <script type="module" src="js/main.js">
├── style.css               # todos os estilos (sem inline)
├── CLAUDE.md
├── package.json            # devDeps apenas (Playwright)
├── playwright.config.js
├── scripts/
│   └── serve.js            # static server zero-dep (Node http) usado em dev e E2E
├── js/
│   ├── main.js             # entry point (init audio, start game)
│   ├── constants.js        # COLS, ROWS, COLORS, SHAPES, scoring, áudio, atalhos
│   ├── piece.js            # makePiece, randomPiece, rotate (puras)
│   ├── board.js            # newBoard, collides, merge, clearLines, computeGhostY (puras)
│   ├── scoring.js          # lineScore, levelFromLines, dropIntervalForLevel (puras)
│   ├── render.js           # primitivas de desenho no canvas (puras, recebem ctx + dados)
│   ├── ui.js               # referências DOM, ctx dos canvases, renderStats, showOverlay, etc.
│   ├── resize.js           # computeLayout(vw, vh) pura; default lê de document
│   ├── input.js            # bindKeyboard com KEY_MAP declarativo
│   ├── audio.js            # init, toggle, duck, armOnFirstGesture, onStateChange
│   └── game.js             # orquestrador: estado mutável + loop + wiring
├── tests/                  # unit (node --test)
│   ├── piece.test.js
│   ├── board.test.js
│   ├── scoring.test.js
│   └── resize.test.js
└── e2e/                    # Playwright
    ├── audio-mock.js       # helper: substitui window.Audio por MockAudio
    ├── smoke.spec.js
    ├── gameplay.spec.js
    ├── pause.spec.js
    ├── music.spec.js
    ├── persistence.spec.js
    └── layout.spec.js
```

### Camadas

- **Puras** (sem estado, sem DOM): `piece.js`, `board.js`, `scoring.js`, `render.js`, `resize.js`.
- **Efeitos colaterais isolados**: `ui.js` (DOM), `audio.js` (HTMLAudioElement + localStorage), `input.js` (event listeners).
- **Orquestração**: `game.js` é o único módulo com estado mutável do jogo. `audio.js` tem estado próprio encapsulado.
- **Bootstrap**: `main.js`.

## Funcionalidades

- Tetris clássico: 7 tetrominoes, rotação com wall kicks, ghost piece, hold, soft/hard drop.
- Pontuação, contagem de linhas, nível (acelera o `dropInterval`).
- Overlay de pausa e fim de jogo com botão "Jogar de novo".
- Layout **sem rolagem** (vertical/horizontal travadas) e adaptativo a qualquer viewport — `CELL` recalculado em `resize`.
- Música lofi ambiente via stream SomaFM Groove Salad com:
  - Botão play/pause no painel + atalho `M`.
  - Pausa do jogo (`P`/`Esc`) também pausa o stream; retomar volta a tocar.
  - Volume reduzido (duck) em game over.
  - Armada após primeira interação por causa da autoplay policy.
  - Mute via `M` vale só pra sessão atual; reload sempre começa armado.

### Controles

| Tecla       | Ação                |
|-------------|---------------------|
| ← →         | Mover               |
| ↓           | Soft drop           |
| ↑ / X       | Rotacionar          |
| Espaço      | Hard drop           |
| C           | Hold                |
| P / Esc     | Pausar              |
| M           | Música on/off       |

## Diretrizes de desenvolvimento

### Arquitetura

1. **Funções puras sempre que possível.** Lógica de jogo (peça, tabuleiro, pontuação) e renderização recebem dados como argumento e não acessam estado global nem DOM.
2. **Estado mutável centralizado.** Apenas `game.js` mantém o estado do jogo. `audio.js` mantém seu próprio estado encapsulado. Nenhum outro módulo deve introduzir estado.
3. **Constantes em `constants.js`.** Magic numbers, URLs, chaves de localStorage e mapas de teclas vivem aqui.
4. **DOM apenas em `ui.js`.** Nenhum `document.getElementById` ou `querySelector` fora desse módulo (exceção: `resize.js` para `clientWidth/Height`).
5. **Input declarativo.** Novos atalhos entram no `KEY_MAP` em `input.js` e ganham um handler no `bindKeyboard` chamado em `game.js`.

### Estilo de código

6. **Sem inline styles, sem `<style>` ou `<script>` no HTML.** Estilos em `style.css`, JS em `js/*.js`.
7. **Layout responsivo via `clamp()` e viewport math.** Nada de breakpoints fixos.
8. **Página travada sem rolagem.** `html, body { overflow: hidden }` + `preventDefault` em setas/espaço/PageUp/Down/Home/End em `input.js`.
9. **Comentários só quando o "porquê" não é óbvio.** Nomes claros substituem comentários do "o quê".
10. **Sem dependências externas.** Tudo nativo do navegador.

### Áudio

11. **Stream público apenas.** SomaFM é licenciado para escuta pública; não hotlinkar serviços que proíbam (lofi.cafe, Lofi Girl etc.).
12. **Respeitar autoplay policy.** Som só dispara após gesto do usuário — uso de `armOnFirstGesture`.
13. **Preferências em `localStorage` com `try/catch`.** Modo privado pode bloquear acesso; nunca quebrar a aplicação.

### Deploy

14. **Github Pages direto da raiz.** Sem build command
15. **ES Modules exigem HTTP/HTTPS.** Em dev local, usar Live Server ou `python3 -m http.server`. Nunca abrir via `file://`.
16. **Caminhos relativos.** `./constants.js`, `js/main.js`, `style.css` — funcionam em qualquer host (raiz ou subpath).

### Commits, PRs e documentação

17. **Tudo em inglês.** Mensagens de commit, títulos e descrições de PR, README, CLAUDE.md, comentários de código e qualquer outra documentação são escritos em inglês. Exceção: nomes de testes seguem a regra 25 (PT-BR).
18. **Conventional Commits.** Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`.
19. **Mensagem inclui motivação.** Corpo do commit explica o "porquê" da mudança, não apenas o "o quê".
20. **Não aplicar Co-autoria.** `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` não aplicar.

### Testes

21. **Toda função pura precisa de teste unitário.** Novos comportamentos em `piece.js`, `board.js`, `scoring.js`, `resize.js` exigem caso correspondente em `tests/`.
22. **DOM, áudio e integração → E2E.** Não tentar emular DOM no Node; usar Playwright em `e2e/` para fluxos reais.
23. **Testar comportamento, não implementação.** Asserções sobre entrada→saída ou estado observável (DOM, `localStorage`); nunca sobre detalhes internos do módulo.
24. **Refatorar pra testabilidade quando útil.** Se uma função pura ficar presa atrás de side effects, extrair a parte pura aceitando parâmetros (ex.: `computeLayout(vw, vh)`).
25. **Mocks no nível certo.** Mockar `Math.random`, `Date.now`, `localStorage`, `window.Audio` quando necessário; não mockar o módulo sob teste.
26. **Testes em PT-BR**, alinhados com o histórico do projeto. Nomes descrevem o caso, não o "deve" genérico.
27. **Rodar `npm test` antes de commits que mexem em módulo puro; `npm run test:e2e` antes de PRs significativos.**
28. **Runtime continua zero-dep.** Tooling de teste mora exclusivamente em `devDependencies`. GitHub Pages ignora.
29. **`node_modules/`, `playwright-report/`, `test-results/` ficam no `.gitignore`.**

## Como rodar localmente

```bash
# opção 1: server embutido (zero dep)
npm start
# abre em http://localhost:4173

# opção 2: Live Server (VS Code extension)
# clicar em "Go Live"

# opção 3: Python
python3 -m http.server 8000
```

Não funciona via `file://` por causa dos ES Modules.

## Como rodar testes

```bash
npm install                # primeira vez: instala Playwright em devDeps
npx playwright install     # baixa o browser (apenas primeira vez)

npm test                   # unit tests (node --test)
npm run test:watch         # unit em modo watch
npm run test:coverage      # unit com coverage report
npm run test:e2e           # E2E (Playwright headless)
npm run test:e2e:ui        # E2E com UI interativa para debug
npm run test:all           # unit + E2E
```

O webServer do Playwright sobe automaticamente o `scripts/serve.js` antes dos testes E2E.

## Como fazer deploy

Deploy automático via **GitHub Pages** servindo a raiz do `main`. Cada `git push` para o `main` publica.

Configuração no GitHub:

1. Repositório → **Settings** → **Pages**.
2. **Source**: `Deploy from a branch`.
3. **Branch**: `main` / `/ (root)` → **Save**.

Sem build step, sem workflow customizado, sem `vercel.json` — o site é servido como está na raiz.

## Histórico do projeto

1. Implementação inicial do Tetris (HTML+CSS+JS inline).
2. Layout responsivo e travamento de rolagem (`overflow: hidden`, viewport-based cell sizing).
3. Separação de CSS e JS em arquivos próprios (`style.css`, `script.js`).
4. Modularização em ES Modules sob `js/` por responsabilidade.
5. Música lofi ambiente via SomaFM com duck no pause/game over.
6. Infraestrutura de testes: `node --test` para unit (43 casos), Playwright para E2E (~20 specs), server estático zero-dep em `scripts/serve.js`.
7. Música acoplada ao estado do jogo: `P`/`Esc` pausam o stream de verdade (antes só baixavam o volume); mute via `M` virou per-session (sem `localStorage`) para não bloquear o autoplay em reloads futuros. Smoke spec passou a usar `getByRole('heading')` no lugar de `text=` para asserts mais robustos.
