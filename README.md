# ZYNX Portfolio

Personal portfolio for Joshua D, an Electronics and Communication Engineering graduate targeting entry-level IT support and junior Linux administration roles while continuing to build software skills.

The site is a React, TypeScript, and Vite application. It includes a portfolio page, searchable skills and experience, an interactive Three.js room, a music page, contact links, and a two-version résumé library.

## Current work

- [S.M. English School website](https://github.com/Zynxx777/sm-english-school-web): Astro and Tailwind CSS website MVP with a Supabase sign-in prototype for the admin area.
- Arch Linux workstation maintenance: personal practice using pacman configuration and pactree to review packages and dependencies.
- ZYNX portfolio: current React, TypeScript, Vite, and Three.js project.
- Automotive cockpit and MediVend concepts: academic ECE project exposure.

The site labels personal use, project work, academic exposure, foundations, current work, and recognition separately. It does not present personal or academic work as professional engineering employment.

The separate Showcase page presents selected projects, a filterable full index, skills/tool groups, and profile details. See [`TOOLS_AND_TECH_USED.md`](./TOOLS_AND_TECH_USED.md) for the verified front-end and backend inventory.

## Résumés

- [Universal résumé — broad profile](/resumes/Joshua_D_Universal_Resume.pdf)
- [IT Support & Linux résumé — focused version](/resumes/Joshua_D_IT_Support_Linux_Resume.pdf)

The source PDFs are in `output/pdf/`; `scripts/generate_resumes.py` generates them and copies the public versions into `public/resumes/`.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). To create a production bundle locally:

```bash
npm run build
npm run preview
```

For this review session, the development server is already running at [http://localhost:5174/](http://localhost:5174/) because port 5173 was occupied.

## Project notes

- The current plan and progress tracker is [`MASTER_PLAN.md`](./MASTER_PLAN.md).
- The product direction and release sequence are in [`ZYNX_Portfolio_Masterplan.md`](./ZYNX_Portfolio_Masterplan.md).
- Deployment and Git push are waiting for local review and the user's later instruction.
