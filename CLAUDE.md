# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static HTML/CSS/JS marketing landing page for **ПК «Мигратор ЭПС»** (Bezant) — a mail-migration product (Microsoft Exchange → CommuniGate Pro). No framework, no build step, no package.json. Desktop-only, must render correctly across viewport widths **1200–1920px**.

Design source of truth is Figma: fileKey `B7ROHvNRaN80wkNROkJfFU`, root node `77:13` (page «ПК Мигратор»), https://www.figma.com/design/B7ROHvNRaN80wkNROkJfFU/Bezant?node-id=77-13. The Figma MCP server is rate-limited (Starter plan) — pull `get_design_context` / `get_screenshot` / `download_assets` **one section at a time, sequentially**, never in parallel.

## Running / previewing

There is no build step. Open `index.html` directly in a browser, or serve it statically if `file://` asset loading is an issue, e.g. `npx serve .` or `python -m http.server`. There is no lint or test command configured.

## Architecture

The page is one `index.html` composed of 14 stacked sections + header + footer (in document order: Hero, Data, Utp, Speed, Graph, Calculator, Sync, Info, Table, Video, Cost, Form, Faq, footer). CSS and JS are split by concern, not bundled:

- `css/tokens.css` — all design tokens as CSS custom properties (colors, type scale, spacing, radii) extracted from Figma variables, plus the fluid-scaling mechanism (see below). Change tokens here, not in section files.
- `css/base.css` — reset + shared primitives reused across sections (`.btn`, `.card`, `.tooltip`, `.checkbox`, `.container`, `.section-title`/`.section-lead`). Add new shared UI patterns here rather than duplicating per-section CSS.
- `css/sections/<name>.css` — one file per section, loaded in `index.html` `<head>` in document order. Each maps 1:1 to a top-level Figma frame.
- `js/main.js`, `js/calculator.js`, `js/video-carousel.js`, `js/form.js` — loaded as plain classic `<script src>` tags (not `type="module"`) at the end of `<body>` — see Calculator note below for why this matters.
- `assets/images/<section>/`, `assets/icons/` — Figma exports, organized per section. When a Figma node is a composited icon (background chip + gradient icon + badge), export the whole containing frame as one PNG rather than pulling raw image fills individually — the raw fills for icon variants in this file are placeholder/identical assets and don't render correctly in isolation; the composited frame export is the one that matches the screenshot.

### Fluid scaling (1200–1400px), fixed beyond (1400–1920px)

The whole layout is built in `rem`, with `1rem = 16px` calibrated to the 1440px Figma design width. Root font-size is fluid only up to 1400px, then holds fixed:

```css
html { font-size: clamp(13.333px, 1.11111vw, 15.556px); }
```

Between 1200px and 1400px this scales every `rem`-based dimension proportionally (13.33px root at 1200px up to 15.556px root at 1400px), with no per-breakpoint media queries. Above 1400px the root font-size stays pinned at 15.556px — nothing grows further. Content rows/grids that need to stop widening past that point (matching the calibrated ~1400px design column) additionally carry `max-width: var(--container-width)` on their main content wrapper (see `.data__grid`/`.speed__grid` for the reference pattern — every other section's equivalent content wrapper follows the same rule, one level per section: `.graph__diagram`, `.calc`, `.cost__cards`, `.table__wrap`, `.video__stage`, `.faq__list`, `.contact-form form`, `.footer__row`/`.footer__bottom`, and `.utp`/`.info` directly since those sections *are* the content row). Section backgrounds/padding are left uncapped so colored "card" sections can still bleed toward the viewport edge; only the content inside stops stretching. Convert new Figma px values by dividing by 16; convert Figma letter-spacing/tracking values to `em` (not `rem`) since those scale with the element's own font-size, not the viewport. **QA at exactly 1440px viewport width is no longer 1:1** — since scaling caps at 1400px (15.556px root, not 16px), 1440px+ viewports render very slightly (~2.8%) smaller than raw Figma px. QA the fluid range at 1200/1300/1400px where computed values still track `vw`, and QA 1400px itself as the frozen reference point for anything at or above it.

### Calculator (critical constraint)

`calculator/calculator_v2_4_02.html` is a standalone reference implementation and the **regression-test baseline** — it must never be modified. `js/calculator.js` ports its calculation logic (constants, `sliderToVolume`, `formatVolume`, `formatTimeDetailed`, `getRoundedWorkDays`, `calculate()`, etc.) verbatim; only the surrounding markup/CSS in `index.html` / `css/sections/calculator.css` is restyled to match the new Figma design. Do not "fix" or refactor the ported logic, including its implicit-global `calendarSeconds` assignment inside `calculate()` — that assignment only works in non-strict/classic-script mode, which is why `calculator.js` must stay a plain script (no `type="module"`, no `"use strict"`). All existing DOM ids referenced by the script (`volumeSlider`, `ratioSlider`, `hoursPerDaySlider`, `avgSizeInfo`, `totalCountInfo`, `migrationTime`, `migrationSpeed`, `workDaysValue`, `workDaysLabel`, `durationLabel`, `factorSATA`, `factorAntivirus`, `factorSZI`, etc.) must be preserved in the new markup.

To validate a change to the calculator UI, open `calculator/calculator_v2_4_02.html` and `index.html#calculator` side by side, set identical slider/checkbox values on both, and diff the rendered result text — it must be byte-identical.

### Video slider

`js/video-carousel.js` renders only 3 DOM slots (`prev`/`active`/`next` peek carousel, matching the Figma visual) regardless of how many videos are in the data array, and re-renders slot contents on navigate rather than sliding a full track. Adding/removing videos is a one-entry edit to the `videos` array (`{title, poster, src}`).
