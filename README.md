# THE CHOSEN ONE — Roll Call Roulette

A projector-ready classroom game-show experience built with React, TypeScript, and Vite. The screen cycles through a 46-roll class roster, builds suspense, and reveals a scripted outcome.

This is a theatrical show effect, not a fair or random lottery for the full class. Every spin is scripted to end on roll number `25L-0761`; the full roster is visual theater. The stage UI displays roll numbers only.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use the **SUMMON THE CHOSEN ONE** button or press Space to start the show. The controls in the upper-right corner toggle fullscreen and sound or reset the screen.

## Check and build

```bash
npm test
npm run build
npm run preview
```

The production site is written to `dist/`. After dependencies have been installed, the app has no runtime network requests: fonts, animations, icons, sound effects, and confetti are bundled with the build. The built app runs on a local static web server without an internet connection. `npm install` itself needs access to the npm registry unless the packages are already cached.

## Project layout

```text
src/
  components/      Reusable stage controls, roster, and slot display
  data/            Exact roll-number roster and scripted outcome
  hooks/           Spin timeline and optional synthesized audio
  lib/             Winner and decoy selection functions
  test/            Vitest setup
  App.tsx          Full-screen show composition and keyboard controls
  main.tsx         React entry point and local font imports
  styles.css       Theme, projector layout, and responsive motion
```

## How the show works

- The 46 roll numbers are held as exact strings in `src/data/rolls.ts`.
- The scripted outcome is fixed at spin start. Random roster entries are decorative animation only and cannot change the result.
- The animation cycles through the full roster and lands on roll number `25L-0761`. A synchronous spin lock prevents double starts.
- Reset cancels the active timeline and returns to the mystery display without starting another spin.
- Sound is off by default and uses the browser's Web Audio API only after the sound control has been enabled.
- `prefers-reduced-motion` is respected; the application makes no tracking or API requests and stores no personal data.

## Stack

React 18, TypeScript (strict), Vite, Tailwind CSS, custom CSS, Framer Motion, Lucide, canvas-confetti, and Vitest.
