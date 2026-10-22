# ZYNX Portfolio — Master Plan & Progress

> **Updated:** 2026-10-22
> **Status:** Local refinements are in progress; deployment and push remain deferred until Joshua's review
> **Repository:** `/home/zynx/Projects/zynx-portfolio`
> **Primary audience:** Entry-level IT support and junior Linux administration employers, with software development as a continued interest.

## Current direction

The portfolio should show what Joshua can demonstrate today and label each item by its source: current employment, personal Linux practice, portfolio project, academic exposure, foundational knowledge, or recognition. The site should remain visually distinctive while helping a recruiter find the résumé, relevant experience, projects, and contact details quickly.

Use the ChatGPT history and project repositories as context, not as proof of unverified professional claims. Do not list the older eTech Prowess internship until its role, dates, and work are confirmed. Present the automotive and MediVend work as academic exposure. Present Arch Linux activity as personal practice. Describe the school website's admin login as a prototype.

## Current project set

| Project | Status and evidence | Public link |
|---|---|---|
| S.M. English School website | Recent Astro and Tailwind CSS MVP; Supabase admin sign-in prototype | [GitHub repository](https://github.com/Zynxx777/sm-english-school-web) |
| ZYNX portfolio | Current React, TypeScript, Vite, and Three.js portfolio | [Portfolio](https://zynx-portfolio.vercel.app/) |
| Arch Linux workstation maintenance | Personal Arch Linux practice with pacman configuration and pactree dependency review | [GitHub profile](https://github.com/Zynxx777) |
| Luxoft AAOS cockpit project | User-identified project; current evidence is academic ECE exposure to AAOS and CAN concepts. This is shown as project exposure, not Luxoft employment. | No verified project-specific public link |
| MediVend smart dispenser concept | Academic embedded and digital logic project exposure | No verified project-specific public link |

Do not restore older showcase items as current projects without evidence. In particular, do not claim Luxoft employment, eTech experience, custom kernel/AOSP work, or numeric performance claims unless Joshua confirms and can describe them. The AAOS project name is Joshua's; keep its current academic exposure level clear until its scope and deliverables are documented.

## Work completed in this pass

- [x] Reframed the profile for entry-level IT support and junior Linux roles while keeping software development as an interest.
- [x] Replaced fabricated skill percentages and unsupported production claims with evidence labels.
- [x] Updated project data to show the school site, current portfolio, personal Linux practice, and academic ECE projects.
- [x] Added two ATS-friendly résumés: a broad two-page profile and a focused one-page IT support/Linux résumé.
- [x] Replaced in-browser PDF generation with a résumé picker, desktop page previews, direct download, and a phone-friendly PDF viewer link.
- [x] Replaced the simulated project viewport and CAN injection controls with real project details and source links.
- [x] Removed unused legacy components that contained unsupported experience or capability claims.
- [x] Added visible keyboard focus, reduced-motion styling, and small-screen overflow protection.
- [x] Capped selected WebGL pixel ratios, paused selected animations while tabs are hidden, and reduced unnecessary rendering work.
- [x] Replaced deprecated Three.js clocks, paused room and music animation while hidden, and separated room data from the renderer for cleaner lint and fast refresh.
- [x] Made featured project artwork responsive to the gallery viewport, added direct project navigation, and made full-index rows keyboard accessible.
- [x] Tuned the bedroom overview for a closer composition across screen ratios and chose moonlight on first visit while respecting saved lighting preferences.
- [x] Restyled the focused IT support/Linux résumé as a plain, centered, one-page ATS document without importing older unverified employment claims.
- [x] Updated the music and 3D room content to distinguish personal practice from employment and academic work.
- [x] Replaced fake vehicle telemetry in the 3D room with a coursework concept panel; removed the unsupported kernel label and generic streaming links.
- [x] Checked the portfolio at 320, 375, 768, and 1280 CSS pixels; fixed the project filter overflow and music-page title/padding on phones.
- [x] Opened the S.M. English School project detail and checked its single close action and repository link.
- [x] Removed duplicate screen-reader close controls from the 3D room and artwork overlays while preserving backdrop and Escape dismissal.
- [x] Generated, text-checked, rendered, and visually inspected both résumé PDFs. The focused résumé is one A4 page; the universal résumé is two.
- [x] Verified the résumé preview images and both public PDF URLs in the local site.
- [x] Reviewed image references, removed unused high-resolution assets, and optimized the gallery images still in use.
- [x] Ran the production build successfully and started the local review server at `http://localhost:5174/`.
- [x] Audited dependencies: `npm audit --omit=dev` reports no production vulnerabilities. The full audit reports seven findings in Tailwind CSS v3 build tooling (five high, two moderate).

## Remaining user review and release checks

- [x] Inspect the home page, skills page, S.M. School detail, résumé library, music page, and 3D room on the local server.
- [x] Check narrow phone, phone, tablet, and desktop widths; fix observed overflow and title clipping.
- [x] Run production build and lint. Lint is clean; the Three.js vendor chunk remains above Vite's 500 kB warning threshold and is loaded on demand.
- [x] Check résumé page count, text extraction, visual layout, preview images, and live public paths.
- [x] Re-render and visually inspect the revised one-page focused résumé against the attached minimal format.
- [x] Review image sizes and remove unreferenced large files.
- [x] Replaced the old car artwork on the portfolio project card with the current branded social preview.
- [x] Reviewed the enlarged school project gallery and moonlit bedroom at 390×844, 768×1024, and 1286×570; the gallery card, metadata, controls, and portrait room framing remain responsive.
- [x] Confirmed the project jump control changes the selected card and the gallery responds to wheel input on the local server.
- [ ] Confirm the LinkedIn URL, preferred email/phone, and whether to add the older internship after checking its exact facts.
- [ ] Review the local site and résumé wording before release.
- [ ] Resolve the Tailwind CSS v3 build-tool findings before deployment. `npm audit fix --force` proposes a Tailwind CSS 4 major upgrade, so no automatic upgrade was applied during this pass.

## 2026-10-22 showcase and scroll update

- [x] Rebuilt `#showcase` around the reference page's full-screen dark project wave, inward-curved film-roll cards, perspective floor grid, and project labels embedded in the card artwork.
- [x] Added card hover focus with a gentle zoom and cursor-centered ripple; selecting a card opens a nearly full-screen detail sheet with source, project notes, and one clear close action.
- [x] Tuned the profile overlay to zoom in through a circular lens, with keyboard dismissal, focus handling, résumé and contact actions, and social links.
- [x] Reworked the Full tab into a centered list of linked project names and animated the change between the gallery and index.
- [x] Kept responsive drag, touch, swipe, and keyboard navigation, and left vertical wheel/touch scrolling free so visitors can continue below the Showcase.
- [x] Removed the standard site navbar, ambient background, cursor effect, and footer from the replica view; the compact brand/profile controls and reference-style project navigation stay in its place.
- [x] Added a continuation shelf below the first viewport so vertical scrolling can leave the carousel and reach the portfolio, skills, bedroom, and music pages.
- [x] Added a responsive Showcase entry to the desktop and mobile navigation.
- [x] Listed the user-identified Luxoft AAOS project with its existing ECE/academic exposure level and without an employment claim.
- [x] Added [`TOOLS_AND_TECH_USED.md`](./TOOLS_AND_TECH_USED.md), including the absence of an app backend and the external audio metadata calls.
- [x] Built the updated app with `npm run build` and checked source with `npm run lint`.
- [x] Confirmed the persistent Vite service `zynx-portfolio-vite.service` is active and `http://127.0.0.1:5174/` returns HTTP 200.
- [x] Reviewed the Showcase in the local browser at desktop and 390 × 844 phone sizes, including the profile, its close action, and scrolling into the continuation shelf.
- [ ] Tablet viewport review remains pending.

### Reference interaction refinement — 2026-10-22

- [x] Revisited the live reference page and inspected the curved card strip, hover/click behavior, profile lens, project detail sheet, and Full index.
- [x] Applied the film-roll curve, hover scale/ripple, circular profile zoom, white project detail sheet, and centered name-only Full index to the local Showcase.
- [x] Removed fixed positioning from the Full index so the document can scroll to the continuation section.
- [x] Re-ran lint and the production build successfully; the dev service remains active and responds with HTTP 200.
- [x] Reviewed the local result in the browser before deployment or push.

### Profile lens refinement — 2026-10-22

- [x] Compared the reference Profile's large glass lens, compact centered biography, focus line, social links, and single top-right Close control against the local page.
- [x] Reworked the local Profile as a responsive WebGL glass lens with an uneven edge, chromatic refraction, bright glass arcs, and a dark center that keeps the biography readable.
- [x] Repositioned the carousel around the profile lens while it is open, then restored its previous position when the profile closes.
- [x] Tightened the biography to match the reference's centered text block while keeping Joshua's IT support, Linux, ECE, and software-development focus accurate.
- [x] Tuned the lens placement for portrait screens so the biography and links sit inside the glass effect.
- [x] Verified desktop and phone presentation, Profile close behavior, and vertical scrolling into the next section; ran `npm run lint` and `npm run build` successfully.
- [ ] Review tablet sizing and continue visual refinement before deployment.

## Later release roadmap

1. **Content confirmation:** Confirm remaining résumé facts and project ownership before adding them.
2. **Accessibility and responsive review:** Inspect keyboard use, dialog focus/close behavior, contrast, motion preference, and layouts across target widths.
3. **Performance and SEO:** Review bundle/asset size, document metadata, social preview, and structured profile metadata.
4. **Deployment:** Deploy and push only after the user reviews the local version and asks to proceed.

See [`FUTURE_IDEAS.md`](./FUTURE_IDEAS.md) for prioritized follow-up ideas.

## Local workflow

```bash
cd /home/zynx/Projects/zynx-portfolio
npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173` on this machine. In this review session, port 5173 was already occupied, so the local preview is at `http://localhost:5174/`. Build the site with `npm run build`. Generated résumé PDFs are in `output/pdf/`; public copies and static page previews used by the site are in `public/resumes/`.

## Release rule

Deployment and Git push are explicitly deferred until after the local review. Do not treat old plan statuses or prior “production ready” wording as current verification.
