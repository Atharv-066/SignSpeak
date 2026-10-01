import React, { useState } from "react";
import { GESTURES } from "../utils/gestures";
import { useGesture } from "../context/GestureContext";

const ICONS = {
  openPalm: "🖐️",
  fist: "✊",
  thumbUp: "👍",
  thumbDown: "👎",
  peace: "✌️",
  point: "☝️",
  pinky: "🤙",
  ily: "🤟",
};

export default function GestureLibrary() {
  const { wordMap, updateWord, resetWordMap } = useGesture();
  const [drafts, setDrafts] = useState({});

  const getValue = (key) => (drafts[key] !== undefined ? drafts[key] : wordMap[key]);

  const handleChange = (key, value) => setDrafts((prev) => ({ ...prev, [key]: value }));
  const handleBlur = (key) => {
    const value = drafts[key];
    if (value !== undefined && value.trim()) updateWord(key, value.trim());
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Gesture library</h2>
          <p className="page-intro">
            Eight custom gestures — not standard ISL/ASL. Rename any word to
            fit your own vocabulary (a classroom, a language, a use case) —
            changes apply immediately on the Live Translate page.
          </p>
        </div>
        <button onClick={resetWordMap}>Reset to defaults</button>
      </div>

      <div className="library-grid">
        {GESTURES.map((g) => (
          <div className="gesture-card" key={g.key}>
            <div className="gesture-icon">{ICONS[g.key]}</div>
            <h3>{g.name}</h3>
            <label className="word-label">
              Speaks as
              <input
                value={getValue(g.key)}
                onChange={(e) => handleChange(g.key, e.target.value)}
                onBlur={() => handleBlur(g.key)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
