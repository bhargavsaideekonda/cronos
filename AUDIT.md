# AUDIT

Phase 0 audit, 2026-11-15. There was no existing repo: the only prior work was the single-file prototype, kept at `prototype/chronos-v4.html`. This file compares that prototype with the master prompt (`docs/master-prompt.pdf`) and records what the new repo has so far.

## Prototype vs master prompt

| Area | Prototype v4 | Master prompt | Status in this repo |
|---|---|---|---|
| Missions | 5 (Explorer 1, Surveyor 3, Opportunity, NEAR Shoemaker, Pioneer 10) | 10 | Surveyor 3 complete. 9 sealed in the hub. |
| Scenes | 5 era skies + base | 10 unique, one per mission | 6 ported to `src/scenes`. 5 mission-specific scenes still to build (Eagle, LRV, Viking 1, Ingenuity, Dawn). |
| Assembly | 4 generic slots shared by all craft | 6 true-shape parts per craft, 400x380 | Done for Surveyor 3 (`src/schematics`). Drag, tap-tap and keyboard. |
| Challenges | 5 mechanics | 10 unique | Soft landing ported with a real radar-glitch event. 4 to port, 5 to design. |
| Facts | Inline strings, sources named but no URLs | Registry with URL and status; only verified shown | `data/facts/*.json`, loader in `src/data/index.ts`. Surveyor 3: 16 facts checked against NASA Science and NSSDCA. |
| Images | Drawn plates plus a search link | Real NASA photos, downloaded, credited | 4 verified Apollo 12 photos in `public/nasa/`, metadata copied by `scripts/fetch-nasa-image.mjs`. One evidence file has no verified photo and shows a labelled placeholder. |
| Companion | Fixed corner sprite, eye tracking | Roaming agent with behaviours | `Companion.tsx`: utility-scored behaviours (quiet, goto, talk, emote, follow, wander), wheel spin tied to speed, squash on stop, scan beam, chest hatch. |
| Audio | Speech beeps only | Generated music per theme, effects, sliders, mute key | `AudioEngine.ts`: six modes, crossfade, pings, reverb, effects, heartbeat, M to mute. |
| Settings | Tint, sound, motion | Tint, contrast, motion, sound, music, text size | Done, plus reset. |
| Ask mode / backend | None | FastAPI + Gemini, grounded | Not started (P6). |
| Tests | None | Playwright gates | 6 tests green: full playthrough (lose then win), assembly three ways, scene frame-diff and freeze, hub switching, phone overlap, companion travel. |

## Prototype bugs fixed in the port

- Speech bubble could cover the next-step button on phones. Buttons now sit at the top; a test checks no overlap at 390 px.
- Hotspots had Surveyor-specific screen-reader labels on every mission. Labels now come from mission data.
- No way to change name or clear progress. Settings has a reset.
- Assembly hit areas were bounding boxes that overlapped. They are now the true shapes.

## Fact changes from the prototype (Surveyor 3)

- "Earth eclipsed the Sun on April 24, 1967": the eclipse images are on NSSDCA, the date is on neither page. The date is `unverified` and not shown.
- "Apollo 12 visit on Nov 20, 1969": NASA pages differ (Nov 19 and Nov 20). Shown as "In November 1969" with a sources-differ mark.
- "More than 6,000 pictures" is now the exact figure both pages give: 6,326.
- Mass: the two NASA pages disagree, so no mass is shown anywhere.
- Image `PIA12903`: the library description does not match its title, so it is marked unverified and unused.

## Deviations from the approved plan

- Repo is in `Documents\project-chronos`. The Desktop is not writable for this Windows account.
- One route (`/`) with a client-side screen state machine instead of `mission/[id]/...` routes. A single page keeps the canvas, music and TOCK alive across screens with no reloads.

## Next

P2 scenes for the five new missions, then P3/P4 for each remaining mission, in hub order. References folder and Gemini key are still needed from the owner.
