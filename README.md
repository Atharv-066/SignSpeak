# SignSpeak

Real-time hand-gesture → text → voice, running entirely on-device in the browser. Built as a proper multi-page React app with shared state via Context — not a single demo screen.

## Folder Structure

```text
signspeak-react/
├── package.json
├── public/
│   └── index.html
└── src/
    ├── App.js / App.css
    ├── context/
    │   └── GestureContext.js
    ├── hooks/
    │   ├── useHandGestures.js
    │   └── useLocalStorage.js
    ├── utils/
    │   ├── gestures.js
    │   ├── mixColor.js
    │   └── id.js
    ├── components/
    │   ├── NavBar.js
    │   ├── CameraPanel.js
    │   └── SentencePanel.js
    └── pages/
        ├── LiveTranslate.js
        ├── GestureLibrary.js
        ├── History.js
        ├── Settings.js
        └── About.js
```

## Setup

```bash
cd signspeak-react
npm install
npm start
```

The application opens at `http://localhost:3000`. Allow camera access when prompted.

Chrome or Edge is recommended for the best MediaPipe support. An internet connection is required during `npm install` to download React, MediaPipe and React Router.

## Features

### 1. Customizable Gesture Vocabulary

* The Gesture Library page allows users to customize the word associated with each gesture.
* Changes persist across sessions.
* The same eight hand shapes can be assigned different words without modifying the source code.

### 2. Confidence-Driven Colors

* The recognition readout and progress ring change color as a gesture is held.
* The color transitions from cool blue to warm coral, visually communicating recognition confidence.

### 3. Adjustable Recognition Settings

* Adjust gesture hold time and cooldown.
* Configure MediaPipe detection and tracking confidence.
* Settings take effect on Live Translate without requiring a camera restart.

### 4. Voice Controls

* Select the system voice.
* Adjust speaking rate and pitch.
* Preview voice settings with one click.

### 5. Pause and Resume

* Pause gesture recognition without leaving the Live Translate page.
* The camera preview dims while processing is paused.
* Resume recognition without navigating away.

### 6. Typed Input

* Type words or phrases when a gesture is not recognized.
* Add typed text directly to the sentence.
* Use text-to-speech to speak the resulting sentence.

### 7. Keyboard Shortcuts

| Key       | Action             |
| --------- | ------------------ |
| Space     | Speak              |
| Backspace | Undo the last word |
| Enter     | Save the sentence  |

### 8. Searchable History

* Save and search previously created sentences.
* Replay or delete individual entries.
* Clear all history.
* Export history as a plain-text file.
* Export and import settings, gesture vocabulary and history in JSON format.

### 9. Friendly Camera Errors

Specific error messages and a Retry button are provided for:

* Camera permission denied
* No camera found
* Camera already in use
* MediaPipe model loading failure

### 10. On-Device Processing

* Gesture recognition runs directly in the browser.
* No application backend or API cost is required.
* Camera video is processed locally and is not sent to a server.

## Demo Script (Under 2 Minutes)

### 1. About Page (10 seconds)

Introduce the communication challenges faced by people with speech or hearing impairments. Explain that SignSpeak provides an on-device approach without requiring a server or expensive dedicated hardware.

### 2. Live Translate (40 seconds)

* Demonstrate Open Palm → Hello.
* Demonstrate Point → You.
* Press Speak to hear the sentence.
* Show the confidence-driven color transition as a gesture is held.

### 3. Gesture Library (20 seconds)

* Change a gesture's default word, such as renaming Peace to another word.
* Return to Live Translate.
* Demonstrate that the updated word is used for the same gesture.

### 4. History (10 seconds)

* Save a sentence.
* Show the saved entry and its timestamp.
* Replay it using the speaker button.

### 5. Settings (10 seconds)

* Demonstrate the hold-time slider.
* Explain how recognition settings can be adjusted for different environments.

### 6. Future Scope (10 seconds)

Conclude with the future scope on the About page:

* Full Indian Sign Language (ISL) dataset training
* Multilingual voices
* Shareable gesture vocabulary presets

## Gesture Set

The current gesture set is custom and is not a complete implementation of ISL or ASL.

| Gesture         | Default Word |
| --------------- | ------------ |
| Open Palm       | Hello        |
| Fist            | Stop         |
| Thumbs Up       | Yes          |
| Thumbs Down     | No           |
| Peace Sign      | Peace        |
| Point           | You          |
| Pinky Only      | Wait         |
| I Love You (🤟) | Love         |

All eight gesture labels are editable on the Gesture Library page.

## Troubleshooting

### Camera Won't Start

* Run the application on `localhost`, not through `file://`.
* Check that camera permission has been granted.
* Make sure another application is not using the camera.

### Gestures Are Misread

* Test in the lighting conditions expected during the demonstration.
* Lower detection and tracking confidence in Settings if tracking frequently drops out.
* Keep your hand clearly visible within the camera frame.

### Gestures Trigger Too Quickly or Slowly

Adjust the hold-time setting on the Settings page.

### Settings Are Not Retained

Settings, gesture customizations and history are stored in browser `localStorage` and persist across reloads in the same browser.

## Changelog

### Fixes

* Fixed detection and tracking confidence sliders so that changes apply to the running MediaPipe model without requiring page navigation.
* Explicitly configured video elements with `autoPlay`, `muted` and `playsInline` for more reliable camera playback.
* Fixed an FPS counter issue that could display `Infinity` or unusually high values during initial frames.
* Improved camera-start error handling with specific messages and a Retry button.
* Improved handling of dropped MediaPipe frames to prevent recognition from stalling.

### Additions

* Added Pause and Resume controls to the camera panel.
* Added an eighth gesture: I Love You (🤟) → Love.
* Added typed fallback input.
* Added voice, speaking-rate and pitch controls with preview.
* Added keyboard shortcuts to Live Translate.
* Added history search and plain-text export.
* Added a subtle confirmation animation and an `aria-live` region to make recognized words easier to notice, including for screen-reader users.
