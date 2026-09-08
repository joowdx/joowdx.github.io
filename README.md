# Joowdx

Source for [joowdx.qzz.io](https://joowdx.qzz.io), a personal portfolio site. Every push to `master` is built and published to GitHub Pages ([joowdx.github.io](https://github.com/joowdx/joowdx.github.io)) by GitHub Actions.

## Stack

- [Vite](https://vitejs.dev/) with plain ES modules and CSS, no UI framework
- [Three.js](https://threejs.org/) for the hero: a calico cat looping ollies down a city street at midnight
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
| [`src/scene/`](src/scene/)                                     | The Three.js hero: `index.js` (loop, camera, lights), `city.js`, `skater.js`, `tail.js`, `tricks.js`, `materials.js` |
| [`src/assets/`](src/assets/)                                   | Images imported by the data modules and the HTML                                                                     |
| [`public/`](public/)                                           | Static files copied as-is: `favicon.ico`, `fonts/`                                                                   |
| `dist/`                                                        | Build output of `npm run build`; ignored by git, CI builds its own                                                   |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | Builds and deploys to GitHub Pages on every push to `master`                                                         |
| [`prototype/`](prototype/)                                     | The standalone single-file prototype the site was ported from (safe to delete)                                       |

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

Push to `master`. The [deploy workflow](.github/workflows/deploy.yml) runs `npm ci` and `npm run build`, then publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions). The site updates a minute or two later; progress is under the Actions tab, where the workflow can also be re-run by hand. No build output is committed and there is no `gh-pages` branch.

The custom domain **joowdx.qzz.io** is a Pages setting (Settings → Pages → Custom domain), not a file in the repo: Actions deployments ignore `CNAME` files. DNS points the domain at GitHub Pages (a `CNAME` record to `joowdx.github.io`, or GitHub's A/AAAA records).
