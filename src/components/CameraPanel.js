import React from "react";
import { mixColor } from "../utils/mixColor";

export default function CameraPanel({
  videoRef,
  canvasRef,
  status,
  isLive,
  isPaused,
  error,
  fps,
  currentWord,
  currentGestureName,
  holdPct,
  confirmTick,
  onPause,
  onResume,
  onRetry,
}) {
  const liveColor = mixColor(holdPct);

  return (
    <section className="panel camera-panel">
      <div className="page-head">
        <h2>Camera feed</h2>
        {isLive && (
          <button
            className="pause-btn"
            onClick={isPaused ? onResume : onPause}
            aria-pressed={isPaused}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        )}
      </div>

      <div className={`camera-wrap ${isPaused ? "is-paused" : ""}`}>
        <video ref={videoRef} playsInline autoPlay muted />
        <canvas ref={canvasRef} />
        {isPaused && <div className="paused-overlay">Camera paused — video isn't being processed</div>}
        {error && (
          <div className="camera-error-overlay">
            <p>{error}</p>
            <button className="primary" onClick={onRetry}>Retry camera</button>
          </div>
        )}
      </div>

      <div className="status-row">
        <span>
          <span className={`dot ${isLive && !isPaused ? "live" : ""}`} />
          {isPaused ? "Paused" : status}
        </span>
        <span>{isLive && !isPaused && fps ? `${fps} fps` : ""}</span>
      </div>

      <div
        className={`readout ${confirmTick ? "just-confirmed" : ""}`}
        style={{ borderColor: currentWord ? liveColor : undefined }}
        key={confirmTick}
        aria-live="polite"
      >
        <div className="word" style={{ color: currentWord ? liveColor : undefined }}>
          {currentWord || (isPaused ? "Paused" : "Show a gesture")}
        </div>
        {currentGestureName && <div className="gesture-name">{currentGestureName}</div>}
        <div className="hold-bar">
          <div style={{ width: `${holdPct}%`, background: liveColor }} />
        </div>
      </div>
    </section>
  );
}
