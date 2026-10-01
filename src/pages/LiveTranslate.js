import React, { useCallback, useEffect } from "react";
import CameraPanel from "../components/CameraPanel";
import SentencePanel from "../components/SentencePanel";
import { useHandGestures } from "../hooks/useHandGestures";
import { useGesture } from "../context/GestureContext";

export default function LiveTranslate() {
  const { settings, wordMap, addWord, speakCurrent, undoWord, saveToHistory } = useGesture();

  const handleWordConfirmed = useCallback((word) => addWord(word), [addWord]);

  const {
    videoRef,
    canvasRef,
    status,
    isLive,
    isPaused,
    error,
    fps,
    currentGestureName,
    currentWord,
    holdPct,
    confirmTick,
    pause,
    resume,
    retry,
  } = useHandGestures({
    settings,
    wordMap,
    onWordConfirmed: handleWordConfirmed,
  });

  // Keyboard shortcuts so the page is usable without gestures too (typing
  // fallback, or a hearing person driving the keyboard side of a
  // conversation): Space to speak the sentence, Backspace to undo the
  // last word, Enter to save it to history. Skipped while focus is in a
  // text field so it doesn't fight with typing.
  useEffect(() => {
    function onKeyDown(e) {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        speakCurrent();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        undoWord();
      } else if (e.key === "Enter") {
        e.preventDefault();
        saveToHistory();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [speakCurrent, undoWord, saveToHistory]);

  return (
    <div className="page live-page">
      <p className="page-intro">
        Hold a gesture steady until the ring fills — it turns from blue to
        coral as confidence builds, then the word gets added below.
        Keyboard shortcuts work here too: <kbd>Space</kbd> speaks,{" "}
        <kbd>Backspace</kbd> undoes a word, <kbd>Enter</kbd> saves.
      </p>
      <div className="live-grid">
        <CameraPanel
          videoRef={videoRef}
          canvasRef={canvasRef}
          status={status}
          isLive={isLive}
          isPaused={isPaused}
          error={error}
          fps={fps}
          currentWord={currentWord}
          currentGestureName={currentGestureName}
          holdPct={holdPct}
          confirmTick={confirmTick}
          onPause={pause}
          onResume={resume}
          onRetry={retry}
        />
        <SentencePanel />
      </div>
    </div>
  );
}
