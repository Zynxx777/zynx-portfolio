# Tools and technologies used

**Project:** ZYNX portfolio ecosystem
**Checked:** 2026-10-22

This inventory separates the browser application from a server-side backend. The portfolio is a client-rendered static site; the repository does not currently contain an application server or database.

## Front end

- **React 19** builds the page and reusable UI components.
- **TypeScript 6** provides typed application code.
- **Vite 8** serves the development site and builds the static production bundle.
- **Tailwind CSS 3** supplies most layout and responsive styling; hand-written CSS handles shared styles, 3D scene presentation, motion, and visual details.
- **Three.js / WebGL** powers the interactive bedroom and project visuals. Scenes render in the visitor's browser.
- **Lucide React** supplies interface icons.
- **HTML, CSS, and browser APIs** provide semantic page structure, media queries, scroll snapping, keyboard interaction, `IntersectionObserver`, canvas/WebGL, and responsive layout behavior.
- **Local storage** keeps selected room appearance and interaction preferences in the browser.

## Backend and external services

- **No dedicated portfolio backend or database is included in this repository.** Vercel serves the static app and rewrites site routes to `index.html`.
- The contact action opens the visitor's mail app with a `mailto:` link; it does not submit to a form-processing server.
- The music player streams audio from third-party radio stations and requests live track metadata from Nightride FM (`stream.nightride.fm/status-json.xsl`) and Nightwave Plaza (`api.plaza.one/status`). Those requests depend on each service being available and permitting browser requests.
- The music code also tries `GET /api/lofi-stats` for one station. There is no matching API function in this repository, and the Vercel config rewrites unmatched paths to the app shell. Treat that now-playing lookup as unavailable unless a separate route is added.
- The browser stores room settings locally; this is not server-side persistence or account storage.

## Development and delivery

- **npm** manages packages and project scripts.
- **Oxlint** is the configured source linter.
- **PostCSS** and **Autoprefixer** process Tailwind and CSS for browser compatibility.
- **Git and GitHub** hold the source and portfolio projects; **Vercel** is the configured portfolio host.
- **Node.js** runs Vite and the local build tools. It is not an application backend in this project.

## Separate school website project

The S.M. English School site is a separate project, not a backend for this portfolio. Its project record lists **Astro**, **Tailwind CSS**, and a **Supabase authentication prototype** for the admin area. The sign-in is described as a prototype; this document does not claim a production school database or deployed administration backend.

## Main local commands

```bash
npm run dev -- --host 0.0.0.0 --port 5174
npm run build
npm run lint
```
