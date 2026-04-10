# Joowdx

Source for [joowdx.dev](https://joowdx.dev), a personal portfolio site. The public build is published from this repo to GitHub Pages ([joowdx.github.io](https://github.com/joowdx/joowdx.github.io)).

## Stack

- [Vite](https://vitejs.dev/) and [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [Radix UI](https://www.radix-ui.com/) primitives
- [Motion](https://motion.dev/) for animation
- [Lucide React](https://lucide.dev/) and [Simple Icons](https://simpleicons.org/) for icons
- [Embla Carousel](https://www.embla-carousel.com/) where carousels are used

## Project structure


| Path                                             | Role                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `[src/main.jsx](src/main.jsx)`                   | App entry: root layout with navbar, page, footer                          |
| `[src/page.jsx](src/page.jsx)`                   | Composes main sections                                                    |
| `[src/sections/](src/sections/)`                 | Page sections: `hero`, `about`, `contributions`, `experience`, `projects` |
| `[src/components/](src/components/)`             | Shared components, including `[ui/](src/components/ui/)`                  |
| `[src/config/socials.js](src/config/socials.js)` | Social links and related config                                           |
| `[src/index.html](src/index.html)`               | HTML shell for Vite                                                       |
| `[public/](public/)`                             | Static assets served as-is (e.g. favicon)                                 |


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

Custom domain **joowdx.dev** is declared in `[CNAME](CNAME)`. In the GitHub repo settings, Pages should use the `gh-pages` branch (root), and the custom domain should match your DNS and the `CNAME` file.

