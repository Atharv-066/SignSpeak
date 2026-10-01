import React, { useEffect, useRef, useState } from "react";
import { useGesture } from "../context/GestureContext";

// speechSynthesis.getVoices() is often empty until the browser fires
// voiceschanged (voices load async in Chrome), so this hook re-reads
// once that fires instead of only checking on mount.
function useVoices() {
  const [voices, setVoices] = useState(() => window.speechSynthesis?.getVoices() || []);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const update = () => setVoices(synth.getVoices());
    update();
    synth.addEventListener("voiceschanged", update);
    return () => synth.removeEventListener("voiceschanged", update);
  }, []);

  return voices;
}

export default function Settings() {
  const { settings, updateSettings, resetSettings, exportData, importData, speakText } = useGesture();
  const fileInputRef = useRef(null);
  const voices = useVoices();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signspeak-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(JSON.parse(reader.result));
      } catch (err) {
        alert("That file doesn't look like valid SignSpeak data.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="page">
      <h2 className="page-title">Settings</h2>
      <p className="page-intro">Tune recognition behavior to match your lighting and pace.</p>

      <div className="panel settings-panel">
        <label className="setting-row">
          <div>
            <strong>Hold time</strong>
            <p>How long a gesture must be held before it's confirmed.</p>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="400"
              max="2000"
              step="100"
              value={settings.holdMs}
              onChange={(e) => updateSettings({ holdMs: Number(e.target.value) })}
            />
            <span>{(settings.holdMs / 1000).toFixed(1)}s</span>
          </div>
        </label>

        <label className="setting-row">
          <div>
            <strong>Cooldown</strong>
            <p>Pause after a word is added, so it doesn't repeat instantly.</p>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={settings.cooldownMs}
              onChange={(e) => updateSettings({ cooldownMs: Number(e.target.value) })}
            />
            <span>{(settings.cooldownMs / 1000).toFixed(1)}s</span>
          </div>
        </label>

        <label className="setting-row">
          <div>
            <strong>Detection confidence</strong>
            <p>Lower this in poor lighting if hand tracking keeps dropping out.</p>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="0.3"
              max="0.9"
              step="0.05"
              value={settings.minDetectionConfidence}
              onChange={(e) => updateSettings({ minDetectionConfidence: Number(e.target.value) })}
            />
            <span>{settings.minDetectionConfidence.toFixed(2)}</span>
          </div>
        </label>

        <label className="setting-row">
          <div>
            <strong>Tracking confidence</strong>
            <p>Lower this if the hand skeleton flickers once detected.</p>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="0.3"
              max="0.9"
              step="0.05"
              value={settings.minTrackingConfidence}
              onChange={(e) => updateSettings({ minTrackingConfidence: Number(e.target.value) })}
            />
            <span>{settings.minTrackingConfidence.toFixed(2)}</span>
          </div>
        </label>

        <p className="settings-note">
          Recognition settings apply immediately on Live Translate — no
          need to restart the camera.
        </p>

        <div className="form-actions">
          <button onClick={resetSettings}>Reset to defaults</button>
        </div>
      </div>

      <div className="panel settings-panel">
        <h2>Voice</h2>

        <label className="setting-row">
          <div>
            <strong>Voice</strong>
            <p>Which system voice reads your sentences aloud.</p>
          </div>
          <div className="setting-control">
            <select
              value={settings.voiceURI || ""}
              onChange={(e) => updateSettings({ voiceURI: e.target.value || null })}
            >
              <option value="">Browser default</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="setting-row">
          <div>
            <strong>Speaking rate</strong>
            <p>How fast the voice speaks.</p>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
            />
            <span>{settings.speechRate.toFixed(2)}×</span>
          </div>
        </label>

        <label className="setting-row">
          <div>
            <strong>Pitch</strong>
            <p>Lower or raise the voice's pitch.</p>
          </div>
          <div className="setting-control">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.speechPitch}
              onChange={(e) => updateSettings({ speechPitch: Number(e.target.value) })}
            />
            <span>{settings.speechPitch.toFixed(2)}</span>
          </div>
        </label>

        <div className="form-actions">
          <button onClick={() => speakText("This is what SignSpeak sounds like.")}>🔊 Preview voice</button>
        </div>
      </div>

      <div className="panel">
        <h2>Your data</h2>
        <p className="page-intro">Word mappings, settings, and saved history — all stored locally in this browser, never uploaded anywhere.</p>
        <div className="form-actions">
          <button onClick={handleExport}>⬇ Export as JSON</button>
          <button onClick={handleImportClick}>⬆ Import JSON</button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
