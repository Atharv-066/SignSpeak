# SignSpeak

Real-time hand-gesture → text → voice, running entirely on-device in the
browser. Built as a proper multi-page React app with shared state via
Context — not a single demo screen.

## Folder structure

```
signspeak-react/
├── package.json
├── public/
│   └── index.html
└── src/
    ├── App.js / App.css            ← router + layout + global styles
    ├── context/
    │   └── GestureContext.js        ← single source of truth: sentence, history, custom word map, settings
    ├── hooks/
    │   ├── useHandGestures.js       ← camera + MediaPipe + hold-to-confirm logic
    │   └── useLocalStorage.js       ← generic persistence hook
    ├── utils/
    │   ├── gestures.js              ← hand-shape classification (pure, no React)
    │   ├── mixColor.js              ← confidence-driven color interpolation
    │   └── id.js                    ← id generator
    ├── components/
    │   ├── NavBar.js
    │   ├── CameraPanel.js
    │   └── SentencePanel.js
    └── pages/
        ├── LiveTranslate.js         ← "/"  — the camera + recognition screen
        ├── GestureLibrary.js        ← "/library" — browse & customize the word each gesture speaks
        ├── History.js               ← "/history" — saved sentences, replay/delete
        ├── Settings.js              ← "/settings" — tune hold-time & detection confidence, export/import data
        └── About.js                 ← "/about" — problem statement, solution, feasibility, future scope
```

## Setup

```
cd signspeak-react
npm install
npm start
```

Opens at `http://localhost:3000`, asks for camera permission — allow it.
Chrome or Edge for best MediaPipe support. Needs internet once for
`npm install` (downloads React, MediaPipe, react-router) — do this well
before your demo slot.

## What makes this "smart" rather than a fixed demo

- **Customizable gesture vocabulary** (Gesture Library page) — every
  gesture's spoken word is editable and persists across sessions. The
  same 8 hand shapes can be relabeled for a different classroom,
  workplace, or language without touching code.
- **Confidence-driven color** — the readout and progress ring shift from
  cool blue to warm coral as a gesture is held, so color is genuinely
  communicating recognition confidence, not decorating the screen.
- **Tunable recognition** (Settings page) — hold-time, cooldown, and
  MediaPipe detection/tracking confidence are all adjustable and take
  effect immediately on Live Translate, no camera restart needed.
- **Voice controls** (Settings page) — pick the system voice, speaking
  rate, and pitch, with a one-click preview.
- **Pause without leaving the page** — a Pause button on Live Translate
  stops processing (and dims the preview) without releasing the camera
  or navigating away.
- **Typed fallback** — a "type a word or phrase" box on Live Translate
  adds words to the sentence without a gesture, useful when a shape
  isn't recognized or when the other person in the conversation wants
  to type a reply that gets spoken aloud.
- **Keyboard shortcuts** on Live Translate: <kbd>Space</kbd> to speak,
  <kbd>Backspace</kbd> to undo the last word, <kbd>Enter</kbd> to save.
- **Searchable history** with per-entry replay/delete, "clear all", and
  export of the whole history as a plain-text file (in addition to the
  full JSON export/import of word map + settings + history).
- **Friendly camera errors** — permission-denied, no-camera-found, and
  camera-in-use are each reported with a specific message and a Retry
  button, instead of a generic stuck "Starting camera…" status.
- **On-device only** — no backend, no API cost, no video ever leaves the
  browser. That's a real, defensible privacy/scalability point for a
  judge panel, not just a nice-to-have.

## Demo script (aim for under 2 minutes)

1. **About page** (10s) — state the problem in one sentence: communication
   friction for speech/hearing-impaired people, and that most tools need
   a server or expensive hardware. This one doesn't.
2. **Live Translate** (40s) — show Open Palm → "Hello", hold Point → "You",
   hit Speak. Point out the color ring shifting blue → coral as you hold
   a gesture — that's live confidence, not a fixed timer bar.
3. **Gesture Library** (20s) — rename one gesture's word live (e.g. change
   "Peace" to something else), go back to Live Translate, show the new
   word comes out of that same gesture immediately. This is the moment
   that proves it's a flexible system, not a hardcoded demo.
4. **History** (10s) — save a sentence, show it logged with a timestamp,
   replay it with the speaker icon.
5. **Settings** (10s) — show the hold-time slider, mention it's there so
   the app adapts to different lighting/hardware rather than only working
   in ideal studio conditions.
6. Close on the **Future scope** section of About — full ISL dataset
   training, multi-language voices, shareable vocabulary presets. Shows
   judges you know exactly where the honest boundary of a one-day build
   is, and what comes next.

## Gesture set (custom, not full ISL/ASL — stated honestly in-app)

| Gesture | Default word |
|---|---|
| Open palm | Hello |
| Fist | Stop |
| Thumbs up | Yes |
| Thumbs down | No |
| Peace sign | Peace |
| Point | You |
| Pinky only | Wait |
| I Love You (🤟) | Love |

All editable on the Gesture Library page.

## Tuning if the demo is glitchy

- **Camera won't start** — must be on `localhost`, not `file://`. Check
  permission was granted.
- **Gestures misread** — test in your actual demo lighting beforehand.
  Lower "Detection confidence" and "Tracking confidence" in Settings if
  tracking keeps dropping out in dim light.
- **Triggers too fast/slow** — adjust "Hold time" in Settings.
- All settings + your word customizations + history persist in
  `localStorage`, so once tuned they stay tuned across reloads.

## Changelog

Fixes and additions made in this pass:

- **Fixed:** detection/tracking confidence sliders in Settings now apply
  live to the running MediaPipe model instead of silently requiring a
  page navigation to take effect.
- **Fixed:** the `<video>` element now has `autoPlay`/`muted`/`playsInline`
  explicitly set, which some browsers (notably Safari) require to
  reliably autoplay a camera stream.
- **Fixed:** an FPS-counter glitch that could flash `Infinity`/absurd
  values on the very first couple of frames.
- **Fixed:** camera-start failures (permission denied, no camera, camera
  already in use, model failed to load) now surface a specific message
  and a Retry button instead of leaving the status stuck.
- **Fixed:** a single dropped MediaPipe frame no longer has a chance to
  throw an unhandled rejection that could quietly stall recognition.
- **Added:** Pause/Resume on the camera panel.
- **Added:** an 8th gesture (🤟 "I love you" → *Love*).
- **Added:** typed fallback input for adding words/phrases without a
  gesture.
- **Added:** voice, speaking-rate, and pitch controls with preview.
- **Added:** keyboard shortcuts on Live Translate.
- **Added:** history search and a plain-text export.
- **Added:** a subtle flash animation and `aria-live` region on the
  camera readout so a confirmed word is easier to notice, including for
  screen readers.
