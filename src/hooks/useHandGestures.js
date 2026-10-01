import { useEffect, useRef, useState, useCallback } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { classifyGesture } from "../utils/gestures";

// Encapsulates camera + MediaPipe + hold-to-confirm logic. Takes
// `settings` (hold/cooldown/confidence, user-tunable on the Settings
// page) and `wordMap` (gesture key -> custom word, user-editable on the
// Gesture Library page) so the recognition behavior and vocabulary are
// both driven by user data, not hardcoded constants.
export function useHandGestures({ settings, wordMap, onWordConfirmed }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const handsRef = useRef(null);

  const lastGestureKeyRef = useRef(null);
  const holdStartRef = useRef(null);
  const cooldownUntilRef = useRef(0);
  const lastFrameTimeRef = useRef(null);
  const settingsRef = useRef(settings);
  const wordMapRef = useRef(wordMap);
  const pausedRef = useRef(false);
  settingsRef.current = settings;
  wordMapRef.current = wordMap;

  const [status, setStatus] = useState("Starting camera…");
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const [currentGestureName, setCurrentGestureName] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [holdPct, setHoldPct] = useState(0);
  const [lastConfirmed, setLastConfirmed] = useState(null);
  // Bumped every time hold time is triggered, even by the same word twice
  // in a row — lets the UI re-trigger a "just confirmed" flash animation
  // via a key change rather than relying on the word text changing.
  const [confirmTick, setConfirmTick] = useState(0);
  const [restartToken, setRestartToken] = useState(0);

  const handleGesture = useCallback(
    (matched, now) => {
      const { holdMs, cooldownMs } = settingsRef.current;

      if (now < cooldownUntilRef.current) {
        setHoldPct(0);
        return;
      }

      if (!matched) {
        lastGestureKeyRef.current = null;
        holdStartRef.current = null;
        setCurrentGestureName(null);
        setCurrentWord(null);
        setHoldPct(0);
        return;
      }

      const word = wordMapRef.current[matched.key] || matched.defaultWord;
      setCurrentGestureName(matched.name);
      setCurrentWord(word);

      if (matched.key !== lastGestureKeyRef.current) {
        lastGestureKeyRef.current = matched.key;
        holdStartRef.current = now;
      }

      const elapsed = now - holdStartRef.current;
      const pct = Math.min(100, (elapsed / holdMs) * 100);
      setHoldPct(pct);

      if (elapsed >= holdMs) {
        onWordConfirmed(word);
        setLastConfirmed(word);
        setConfirmTick((t) => t + 1);
        cooldownUntilRef.current = now + cooldownMs;
        holdStartRef.current = null;
        lastGestureKeyRef.current = null;
        setHoldPct(0);
      }
    },
    [onWordConfirmed]
  );

  // Re-applies detection/tracking confidence to the running MediaPipe
  // model whenever the user changes them in Settings — no camera restart
  // required, unlike the previous behavior.
  useEffect(() => {
    handsRef.current?.setOptions({
      minDetectionConfidence: settings.minDetectionConfidence,
      minTrackingConfidence: settings.minTrackingConfidence,
    });
  }, [settings.minDetectionConfidence, settings.minTrackingConfidence]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
    videoRef.current?.pause();
    setCurrentGestureName(null);
    setCurrentWord(null);
    setHoldPct(0);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
    videoRef.current?.play().catch(() => {});
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setStatus("Starting camera…");
    setRestartToken((t) => t + 1);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    const ctx = canvasEl.getContext("2d");
    let cancelled = false;

    // React 18's StrictMode intentionally double-invokes effects in
    // development (mount -> cleanup -> mount) to surface unsafe side
    // effects. MediaPipe's Hands loader keeps its in-flight asset XHR's
    // onprogress callback tied to internal module state; if we build a
    // Hands instance and then immediately close() it — exactly what the
    // StrictMode phantom mount/cleanup pair would do — that still-in-
    // flight request resolves against already-torn-down state and
    // throws "Cannot read properties of undefined (reading
    // '<wasm asset url>')" from inside the vendored loader script,
    // which we can't patch directly. Deferring the actual camera/model
    // setup by a tick means the phantom mount's cleanup below cancels
    // it before any Hands instance (and its async loads) is ever
    // created, so only the real mount does the work.
    const initTimer = setTimeout(() => {
      if (cancelled) return;

      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
      });
      handsRef.current = hands;
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: settingsRef.current.minDetectionConfidence,
        minTrackingConfidence: settingsRef.current.minTrackingConfidence,
      });

      hands.onResults((results) => {
        if (cancelled) return;
        const now = performance.now();
        if (lastFrameTimeRef.current != null) {
          const delta = now - lastFrameTimeRef.current;
          // Guard against a divide-by-near-zero spike on the very first
          // couple of frames, which used to flash an absurd fps value.
          if (delta > 1) setFps(Math.round(1000 / delta));
        }
        lastFrameTimeRef.current = now;

        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        ctx.save();
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

        let matched = null;
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const handedness = results.multiHandedness?.[0]?.label || "Right";

          drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: "#ff8a5c", lineWidth: 2 });
          drawLandmarks(ctx, landmarks, { color: "#f5f1fa", lineWidth: 1, radius: 2.5 });

          matched = classifyGesture(landmarks, handedness);
        }
        ctx.restore();
        handleGesture(matched, now);
      });

      async function start() {
        try {
          const camera = new Camera(videoEl, {
            onFrame: async () => {
              if (pausedRef.current) return;
              try {
                await hands.send({ image: videoEl });
              } catch (err) {
                // A single dropped frame (e.g. MediaPipe's wasm still
                // warming up) shouldn't take the whole session down.
                console.warn("Hand-tracking frame skipped:", err);
              }
            },
            width: 640,
            height: 480,
          });
          cameraRef.current = camera;
          await camera.start();
          if (!cancelled) {
            setStatus("Live");
            setIsLive(true);
          }
        } catch (err) {
          console.error(err);
          if (!cancelled) {
            setIsLive(false);
            const name = err?.name;
            if (name === "NotAllowedError" || name === "PermissionDeniedError") {
              setStatus("Camera access denied");
              setError("Camera permission was denied. Allow camera access in your browser's address-bar controls, then retry.");
            } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
              setStatus("No camera found");
              setError("No camera device was found. Connect a camera and retry.");
            } else if (name === "NotReadableError") {
              setStatus("Camera unavailable");
              setError("The camera is already in use by another app or tab. Close it and retry.");
            } else {
              setStatus("Camera unavailable");
              setError("Couldn't start the camera or load the hand-tracking model. Check your connection (the model loads from a CDN) and retry.");
            }
          }
        }
      }
      start();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(initTimer);
      cameraRef.current?.stop();
      cameraRef.current = null;
      handsRef.current?.close();
      handsRef.current = null;
      lastFrameTimeRef.current = null;
    };
    // restartToken deliberately re-runs this whole setup on retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartToken]);

  return {
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
    lastConfirmed,
    confirmTick,
    pause,
    resume,
    retry,
  };
}
