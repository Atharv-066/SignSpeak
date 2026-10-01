import React, { createContext, useContext, useState, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { defaultWordMap } from "../utils/gestures";
import { nextId } from "../utils/id";

const GestureContext = createContext(null);

const DEFAULT_SETTINGS = {
  holdMs: 900,
  cooldownMs: 700,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.6,
  speechRate: 0.95,
  speechPitch: 1,
  // null = let the browser pick its default voice for the page language.
  voiceURI: null,
};

export function GestureProvider({ children }) {
  const [wordMap, setWordMap] = useLocalStorage("signspeak-wordmap", defaultWordMap);
  const [storedSettings, setSettings] = useLocalStorage("signspeak-settings", () => DEFAULT_SETTINGS);
  // Merge with defaults so settings saved by an older version of the app
  // (before a field like speechRate existed) still get a sane value
  // instead of undefined.
  const settings = { ...DEFAULT_SETTINGS, ...storedSettings };
  const [history, setHistory] = useLocalStorage("signspeak-history", []);

  // The sentence being built right now — deliberately NOT persisted
  // across reloads (a stale in-progress sentence isn't useful), unlike
  // saved history entries which are.
  const [words, setWords] = useState([]);

  const addWord = useCallback((word) => setWords((prev) => [...prev, word]), []);
  const addSpace = useCallback(() => setWords((prev) => [...prev, ""]), []);
  const undoWord = useCallback(() => setWords((prev) => prev.slice(0, -1)), []);
  const clearSentence = useCallback(() => setWords([]), []);

  const speakText = useCallback(
    (text) => {
      if (!text?.trim()) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = settings.speechRate;
      utter.pitch = settings.speechPitch;
      if (settings.voiceURI) {
        const voice = window.speechSynthesis
          .getVoices()
          .find((v) => v.voiceURI === settings.voiceURI);
        if (voice) utter.voice = voice;
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    },
    [settings.speechRate, settings.speechPitch, settings.voiceURI]
  );

  const speakCurrent = useCallback(() => speakText(words.join(" ")), [words, speakText]);

  const saveToHistory = useCallback(() => {
    const text = words.join(" ").trim();
    if (!text) return;
    setHistory((prev) => [{ id: nextId("h"), text, timestamp: new Date().toISOString() }, ...prev]);
    setWords([]);
  }, [words, setHistory]);

  const deleteHistoryItem = useCallback((id) => setHistory((prev) => prev.filter((h) => h.id !== id)), [setHistory]);
  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const updateWord = useCallback(
    (key, word) => setWordMap((prev) => ({ ...prev, [key]: word })),
    [setWordMap]
  );
  const resetWordMap = useCallback(() => setWordMap(defaultWordMap()), [setWordMap]);

  const updateSettings = useCallback((partial) => setSettings((prev) => ({ ...prev, ...partial })), [setSettings]);
  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings]);

  const exportData = useCallback(() => ({ wordMap, settings, history }), [wordMap, settings, history]);
  const importData = useCallback(
    (data) => {
      if (data?.wordMap) setWordMap(data.wordMap);
      if (data?.settings) setSettings(data.settings);
      if (Array.isArray(data?.history)) setHistory(data.history);
    },
    [setWordMap, setSettings, setHistory]
  );

  const value = {
    words,
    addWord,
    addSpace,
    undoWord,
    clearSentence,
    speakCurrent,
    speakText,
    saveToHistory,
    history,
    deleteHistoryItem,
    clearHistory,
    wordMap,
    updateWord,
    resetWordMap,
    settings,
    updateSettings,
    resetSettings,
    exportData,
    importData,
  };

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>;
}

export function useGesture() {
  const ctx = useContext(GestureContext);
  if (!ctx) throw new Error("useGesture must be used within a GestureProvider");
  return ctx;
}
