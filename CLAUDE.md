# Project Chronos: Odyssey of the Silent Fleet

Browser game for a NASA hackathon, audience 14 to 18. The full brief is `docs/master-prompt.pdf`. Read it before large changes. `AUDIT.md` records current status. Also read `AGENTS.md`: this Next.js version differs from older ones.

## Rules that always apply

1. Never invent NASA facts, dates, numbers, image IDs or captions. Every fact lives in `data/facts/*.json` with `source_url` and `status` (`verified`, `conflicting`, `unverified`). The UI reads facts only through `fact()` in `src/data/index.ts`, which hides unverified facts and uses `safe_text` for conflicting ones.
2. Three layers stay visibly separate: REAL, SIMPLIFIED MODEL, STORY. Use `FictionLabel`.
3. Spacecraft never speak. TOCK (rename via `COMPANION_NAME`) is scripted fiction.
4. Images: find them with `node scripts/fetch-nasa-image.mjs <mission> <nasa_id>`, which copies metadata from the library entry and downloads to `public/nasa/`. Never type an ID from memory. No verified photo means a labelled placeholder.
5. Last Signal shows a date only if verified, otherwise "Not shown: no verified date".
6. No two missions share a challenge mechanic. Every schematic has six parts in a 400x380 viewBox.
7. A feature is done when a Playwright test plays it.
8. Do not build: multiplayer, accounts, voice recognition, 3D physics, long lore text.

## Layout

- `data/` missions, facts, images (content-driven)
- `src/components/Game.tsx` shell and screen state machine; `screens.tsx` all screens
- `src/scenes`, `src/schematics`, `src/challenges` one entry per mission
- `src/audio/AudioEngine.ts` generated music and effects
- `src/components/Companion.tsx` TOCK behaviour system
- `prototype/chronos-v4.html` the original single-file prototype to port from

## Commands

- `npm run dev` play locally
- `npm run check` registry check (sources, credits, six parts, four files)
- `npm test` Playwright (builds, serves on port 3100)
- `SHOTS=1 npx playwright test shots` screenshots of every screen into `test-results/shots`

## Adding a mission

1. Verify facts against NASA pages, write `data/facts/<id>.json`, register it in `src/data/index.ts`.
2. Fill `data/missions/<id>.json` and set `built: true`.
3. Add its scene, schematic and challenge modules and register them.
4. Fetch photos with the script. Extend the tests.
