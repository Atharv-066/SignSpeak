import React, { useMemo, useState } from "react";
import { useGesture } from "../context/GestureContext";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function History() {
  const { history, deleteHistoryItem, clearHistory, speakText } = useGesture();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => item.text.toLowerCase().includes(q));
  }, [history, query]);

  const handleExportText = () => {
    const lines = history.map((item) => `[${formatTime(item.timestamp)}] ${item.text}`);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signspeak-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">History</h2>
          <p className="page-intro">Sentences you've saved from Live Translate.</p>
        </div>
        {history.length > 0 && (
          <div className="form-actions">
            <button onClick={handleExportText}>⬇ Export as text</button>
            <button onClick={clearHistory}>Clear all</button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <p className="empty-msg">
          Nothing saved yet — build a sentence on Live Translate and hit "Save to history".
        </p>
      ) : (
        <>
          <input
            className="history-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search saved sentences…"
            aria-label="Search saved sentences"
          />

          {filtered.length === 0 ? (
            <p className="empty-msg">No saved sentences match "{query}".</p>
          ) : (
            <ul className="history-list">
              {filtered.map((item) => (
                <li key={item.id} className="history-item">
                  <div>
                    <p className="history-text">{item.text}</p>
                    <p className="history-time">{formatTime(item.timestamp)}</p>
                  </div>
                  <div className="history-actions">
                    <button onClick={() => speakText(item.text)} title="Speak again" aria-label="Speak again">🔊</button>
                    <button className="icon-btn" onClick={() => deleteHistoryItem(item.id)} title="Delete" aria-label="Delete">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
