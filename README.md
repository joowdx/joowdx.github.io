# Joowdx

Source for [joowdx.qzz.io](https://joowdx.qzz.io), a personal portfolio site. Every push to `master` is built and published to GitHub Pages ([joowdx.github.io](https://github.com/joowdx/joowdx.github.io)) by GitHub Actions.

## Stack

- [Vite](https://vitejs.dev/) with plain ES modules and CSS, no UI framework
- [Three.js](https://threejs.org/) for the hero: a calico cat skating through a neon-lit Davao street, with detailed shop displays, feathered palms, wet-road reflections, light trails, and an animated bandana
- Urbanist (display and body) and DM Mono (labels), self-hosted from `public/fonts/` under the OFL and preloaded to avoid a flash of fallback text

## Project structure

| Path                                                           | Role                                                                                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`src/index.html`](src/index.html)                             | Page shell and static copy (nav, hero, about, footer)                                                                |
| [`src/styles.css`](src/styles.css)                             | Design tokens and all styles                                                                                         |
| [`src/main.js`](src/main.js)                                   | Entry: renders the data-driven sections, wires page behaviour, starts the scene                                      |
| [`src/data/`](src/data/)                                       | Content: `experience.js`, `projects.js`, `capabilities.js`, `site.js`                                                |
| [`src/sections/`](src/sections/)                               | Renderers for the data-driven sections (capabilities, experience, projects)                                          |
| [`src/ui/`](src/ui/)                                           | Page behaviour: nav, menu, stars, scroll reveals, card tilt, local time, live-status probes                          |
| [`src/scene/`](src/scene/)                                     | The Three.js hero: `index.js` (DOM controls), `worker.js`, `core.js` (loop, camera, lights), `city.js`, `skater.js`, `tail.js`, `tricks.js`, `effects.js` (trails and landing effects), `materials.js` |
| [`src/assets/`](src/assets/)                                   | Images imported by the data modules and the HTML                                                                     |
| [`public/`](public/)                                           | Static files copied as-is: `favicon.ico`, `fonts/`                                                                   |
| `dist/`                                                        | Build output of `npm run build`; ignored by git, CI builds its own                                                   |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | Builds and deploys to GitHub Pages on every push to `master`                                                         |
| [`prototype/`](prototype/)                                     | The standalone single-file prototype the site was ported from (safe to delete)                                       |

## Editing content

- Work history: [`src/data/experience.js`](src/data/experience.js)
- Projects: [`src/data/projects.js`](src/data/projects.js). Give a project an `image` for a screenshot card or a `source` for a repo card; a `url` gets a live/offline badge. Set `earlier: true` to move it into the compact Earlier work list.
- Capability cards: [`src/data/capabilities.js`](src/data/capabilities.js)
- Scene feel: `TUNING` at the top of [`src/scene/core.js`](src/scene/core.js) (loop speed, jump height, pop angle, street speed, auto-trick cadence). Colours live in [`src/scene/materials.js`](src/scene/materials.js); `COLORS.fog` must match `--plum` in `styles.css` so the horizon has no seam.
- Scene controls: tap the cat or the trick button to queue a trick; both support Enter/Space. Pause freezes the scene, and tricks can be previewed as still frames while paused. Reduced-motion preferences start the scene paused and disable camera parallax. Rendering stops outside the viewport and while the tab is hidden. Reflections and glow use procedural textures without postprocessing or additional dependencies.
- Loading and performance: hero copy paints immediately. `ui/scene-loader.js` loads the scene separately when the hero is visible. Supporting browsers run Three.js and procedural textures in an OffscreenCanvas worker. The main-thread compatibility path uses `scene/schedule.js` and `scene/prepare.js` to yield between construction, shader compilation, and buffer uploads. Controls become available once the scene is ready. Touch devices use 30 fps, a capped pixel ratio, and the soft contact shadow; desktop keeps the directional shadows at up to 60 fps. Stars share twelve animated layers, and project status probes start near the viewport.
- Background details: `storefronts.js` builds the café, record store, corner store, and skate shop; `props.js` builds shaped cars, street furniture, and rooftop equipment; `palm.js` builds the trees. Fixed details are combined by material to keep draw calls down. All textures and models are generated locally.

## Prerequisites

- [Node.js](https://nodejs.org/) (recent LTS recommended)

## Scripts

```bash
npm install          # install dependencies
npm run dev          # local dev server (Vite)
npm run build        # production build → dist/
npm run preview      # preview the production build locally
npm run lint         # ESLint (with --fix)
npm run format       # Prettier on src/
```

Audit the production build rather than the Vite development server. With Chrome installed, start `npm run preview` after building, then run:

```bash
npm exec --yes --package lighthouse -- lighthouse http://localhost:4173/ --view
```

Use the same mobile/desktop settings for before/after comparisons. The CLI uses a fresh browser profile, avoiding extensions and stored site data. If Chrome is not discovered automatically, set `CHROME_PATH` to a Chromium browser executable.

## Deploy

Push to `master`. The [deploy workflow](.github/workflows/deploy.yml) runs `npm ci` and `npm run build`, then publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions). The site updates a minute or two later; progress is under the Actions tab, where the workflow can also be re-run by hand. No build output is committed and there is no `gh-pages` branch.

The custom domain **joowdx.qzz.io** is a Pages setting (Settings → Pages → Custom domain), not a file in the repo: Actions deployments ignore `CNAME` files. DNS points the domain at GitHub Pages (a `CNAME` record to `joowdx.github.io`, or GitHub's A/AAAA records).
