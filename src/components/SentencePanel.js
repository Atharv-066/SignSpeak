import React, { useState } from "react";
import { useGesture } from "../context/GestureContext";

export default function SentencePanel() {
  const { words, speakCurrent, addSpace, undoWord, clearSentence, saveToHistory, addWord } = useGesture();
  const [draft, setDraft] = useState("");

  const handleAddDraft = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    // Splitting on whitespace lets someone paste or type a whole phrase
    // at once, not just a single word.
    trimmed.split(/\s+/).forEach((w) => addWord(w));
    setDraft("");
  };

  return (
    <section className="panel">
      <h2>Sentence</h2>

      <div className="sentence-box">
        {words.length ? words.join(" ") : <span className="placeholder">Recognized words will appear here…</span>}
      </div>

      <div className="controls">
        <button className="primary" onClick={speakCurrent}>🔊 Speak</button>
        <button onClick={addSpace}>Space</button>
        <button onClick={undoWord}>⌫ Undo word</button>
        <button onClick={clearSentence}>Clear</button>
        <button className="save-btn" onClick={saveToHistory} disabled={!words.length}>💾 Save to history</button>
      </div>

      <form className="quick-add" onSubmit={handleAddDraft}>
        <label htmlFor="quick-add-input" className="quick-add-label">
          Type a word or phrase to add it without a gesture
        </label>
        <div className="quick-add-row">
          <input
            id="quick-add-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. thank you"
          />
          <button type="submit" disabled={!draft.trim()}>Add</button>
        </div>
      </form>
    </section>
  );
}
