# ZYNX Portfolio — Product Direction

> **Updated:** 2026-10-22
> **Active project:** `/home/zynx/Projects/zynx-portfolio` (React, TypeScript, Vite)
> **Review state:** The updated site is running locally; deployment and push remain deferred until Joshua reviews it.

This document replaces the older multi-repository concept notes. The current site is one responsive application with a portfolio, skills and experience page, interactive room, and music page. Treat the implementation in this repository and the current status in [`MASTER_PLAN.md`](./MASTER_PLAN.md) as the source of truth.

## Purpose

Make the website a clear, memorable portfolio for entry-level IT support and junior Linux administration roles, while showing the ECE background, current web projects, and continuing interest in software development. Keep the 3D and music experiences as supporting personal work, not as substitutes for a clear résumé or evidence of professional experience.

## Content rules

- Label experience as paid/current work, personal practice, portfolio project, academic project, foundational knowledge, or recognition.
- Use measured descriptions for skills. Avoid fabricated proficiency percentages, years of experience, production metrics, and unsupported technical specialties.
- Keep employment history limited to confirmed work. Older résumé claims about eTech Prowess or Luxoft need direct confirmation before reuse.
- Link current work: the S.M. English School website, ZYNX portfolio, and Arch Linux workstation practice.
- Identify academic cockpit and MediVend work as academic exposure.
- Label the school website's Supabase admin sign-in as a prototype.
- Keep contact information consistent between the résumé, portfolio, and contact panel.

## Main experience

| Area | Current role |
|---|---|
| Portfolio | Introductory profile, current project list, résumé picker, contact details |
| Skills | Searchable skills with evidence and experience labels |
| 3D room | Interactive personal portfolio space; deeper zone copy stays factual |
| Music | Personal music work, current music teaching context, browser audio player |
| Résumé library | Focused IT support/Linux résumé plus broad universal résumé, each with preview and download |

## Progress

- [x] Reframe the site's career message toward IT support and junior Linux roles.
- [x] Replace fake skill scores and simulated technical telemetry with evidence labels and real project descriptions.
- [x] Add the recent S.M. English School project and personal Arch Linux workstation practice.
- [x] Build and link both résumé variants.
- [x] Simplify project details and remove fake CAN bus injection controls.
- [x] Improve keyboard focus, reduced motion behavior, responsive controls, and background animation efficiency.
- [x] Finish local desktop, tablet, and phone review; fix horizontal overflow and mobile music-page title clipping.
- [x] Build and inspect the main portfolio, skills, project detail, résumé picker, music, and 3D room flows after copy changes.
- [x] Replace misleading simulated vehicle telemetry in the 3D room with an academic concept panel and remove generic music links.
- [x] Remove duplicate accessible close actions in the 3D room and artwork dialogs; keep one clear close control plus backdrop/Escape behavior.
- [x] Pause room/music animation when hidden, lower small-screen render resolution, replace deprecated Three.js clocks, and reach a clean lint run.
- [x] Remove unused high-resolution images and optimize referenced gallery assets.
- [x] Scale featured artwork to the gallery viewport and add direct, accessible project navigation.
- [x] Tune the 3D bedroom's first-visit ambience and responsive overview to reflect the existing moonlit artwork.
- [x] Restyle the focused IT support/Linux PDF as a plain, one-page ATS résumé in the attached résumé's minimal format.
- [ ] Review the updated gallery and room framing on phone, tablet, and desktop.
- [ ] Confirm contact profile links and any older work history that may be added.
- [x] Add social preview metadata/artwork and improve the page title and description.
- [x] Check dependencies: production audit reports zero findings; the full audit reports seven Tailwind CSS v3 build-tool findings.
- [x] Expand the projects section into a fluid, full-height editorial gallery with a clearer project index introduction and more generous responsive card space.
- [ ] Resolve the Tailwind CSS v3 build-tool findings before launch; the offered automatic fix upgrades to Tailwind CSS 4.
- [ ] Review final wording before launch.
- [ ] Deploy and push after local approval only.

## Next decisions after local review

1. Confirm the résumé contact links and whether the previous internship belongs on either résumé.
2. Review project order and the amount of space given to the room and music pages.
3. Choose whether to prioritize image optimization, SEO/social cards, or another portfolio feature.
4. Proceed to deploy/push only when requested.

## Brainstorm for later

See [`FUTURE_IDEAS.md`](./FUTURE_IDEAS.md) for prioritized follow-up work and design references.

## Parking lot

These are optional ideas, not commitments. Add them only when they strengthen the job-search path and can be supported with real project evidence.
