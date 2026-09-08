# Joowdx

Source for [joowdx.dev](https://joowdx.dev), a personal portfolio site. The public build is published from this repo to GitHub Pages ([joowdx.github.io](https://github.com/joowdx/joowdx.github.io)).

## Stack

- [Vite](https://vitejs.dev/) with plain ES modules and CSS, no UI framework
- [Three.js](https://threejs.org/) for the hero: a calico cat looping ollies down a city street at midnight
- Urbanist (display and body) and DM Mono (labels), self-hosted from `public/fonts/` under the OFL and preloaded to avoid a flash of fallback text

## Project structure

| Path                               | Role                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`src/index.html`](src/index.html) | Page shell and static copy (nav, hero, about, footer)                                                                |
| [`src/styles.css`](src/styles.css) | Design tokens and all styles                                                                                         |
| [`src/main.js`](src/main.js)       | Entry: renders the data-driven sections, wires page behaviour, starts the scene                                      |
| [`src/data/`](src/data/)           | Content: `experience.js`, `projects.js`, `capabilities.js`, `site.js`                                                |
| [`src/sections/`](src/sections/)   | Renderers for the data-driven sections (capabilities, experience, projects)                                          |
| [`src/ui/`](src/ui/)               | Page behaviour: nav, menu, stars, scroll reveals, card tilt, local time, live-status probes                          |
| [`src/scene/`](src/scene/)         | The Three.js hero: `index.js` (loop, camera, lights), `city.js`, `skater.js`, `tail.js`, `tricks.js`, `materials.js` |
| [`src/assets/`](src/assets/)       | Images imported by the data modules and the HTML                                                                     |
| [`public/`](public/)               | Static files copied as-is: `favicon.ico`, `CNAME`, `fonts/`                                                          |
| [`prototype/`](prototype/)         | The standalone single-file prototype the site was ported from (safe to delete)                                       |

## Editing content

- Work history: [`src/data/experience.js`](src/data/experience.js)
- Projects: [`src/data/projects.js`](src/data/projects.js). Give a project an `image` for a screenshot card or a `source` for a repo card; a `url` gets a live/offline badge. Set `earlier: true` to move it into the compact Earlier work list.
- Capability cards: [`src/data/capabilities.js`](src/data/capabilities.js)
- Scene feel: `TUNING` at the top of [`src/scene/index.js`](src/scene/index.js) (loop speed, jump height, pop angle, street speed, auto-trick cadence). Colours live in [`src/scene/materials.js`](src/scene/materials.js); `COLORS.fog` must match `--plum` in `styles.css` so the horizon has no seam.

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

## Deploy

Production output is written to `dist/`. Deploy to GitHub Pages with:

```bash
npm run deploy
```

That runs `npm run build` then pushes the `dist/` folder to the `gh-pages` branch via `git subtree push --prefix dist origin gh-pages`.

Custom domain **joowdx.dev** is declared in [`public/CNAME`](public/CNAME), which Vite copies into every build so the domain survives each deploy. In the GitHub repo settings, Pages should use the `gh-pages` branch (root), and the custom domain should match your DNS and the `CNAME` file.
