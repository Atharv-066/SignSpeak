// Custom gesture vocabulary (not standard ASL — see README). Each entry
// is a finger-state pattern [thumb,index,middle,ring,pinky] (1 = extended,
// 0 = curled). Deliberately no hardcoded "word" here — the word each
// gesture maps to is user-customizable (see GestureContext), so this file
// only owns shape recognition, not vocabulary.
export const GESTURES = [
  { key: "openPalm", name: "Open Palm", pattern: [1, 1, 1, 1, 1], defaultWord: "Hello" },
  { key: "fist", name: "Fist", pattern: [0, 0, 0, 0, 0], defaultWord: "Stop" },
  { key: "thumbUp", name: "Thumbs Up", pattern: [1, 0, 0, 0, 0], special: "thumbUp", defaultWord: "Yes" },
  { key: "thumbDown", name: "Thumbs Down", pattern: [1, 0, 0, 0, 0], special: "thumbDown", defaultWord: "No" },
  { key: "peace", name: "Peace", pattern: [0, 1, 1, 0, 0], defaultWord: "Peace" },
  { key: "point", name: "Point", pattern: [0, 1, 0, 0, 0], defaultWord: "You" },
  { key: "pinky", name: "Pinky", pattern: [0, 0, 0, 0, 1], defaultWord: "Wait" },
  { key: "ily", name: "I Love You", pattern: [1, 1, 0, 0, 1], defaultWord: "Love" },
];

export function defaultWordMap() {
  return Object.fromEntries(GESTURES.map((g) => [g.key, g.defaultWord]));
}

// MediaPipe Hands landmark indices for each finger's tip / reference joint
const TIPS = [4, 8, 12, 16, 20];
const PIPS = [3, 6, 10, 14, 18];

function getFingerStates(landmarks, handedness) {
  const states = [0, 0, 0, 0, 0];

  for (let i = 1; i < 5; i++) {
    states[i] = landmarks[TIPS[i]].y < landmarks[PIPS[i]].y ? 1 : 0;
  }

  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  states[0] =
    handedness === "Right"
      ? thumbTip.x < thumbIp.x ? 1 : 0
      : thumbTip.x > thumbIp.x ? 1 : 0;

  return states;
}

function isThumbUp(landmarks) {
  return landmarks[4].y < landmarks[2].y - 0.05;
}
function isThumbDown(landmarks) {
  return landmarks[4].y > landmarks[2].y + 0.05;
}

// Returns the matching gesture object (with .key), or null.
export function classifyGesture(landmarks, handedness) {
  const states = getFingerStates(landmarks, handedness);
  const othersCurled =
    states[1] === 0 && states[2] === 0 && states[3] === 0 && states[4] === 0;

  if (othersCurled && isThumbUp(landmarks)) {
    return GESTURES.find((g) => g.special === "thumbUp");
  }
  if (othersCurled && isThumbDown(landmarks)) {
    return GESTURES.find((g) => g.special === "thumbDown");
  }

  const key = states.join("");
  return GESTURES.find((g) => !g.special && g.pattern.join("") === key) || null;
}
