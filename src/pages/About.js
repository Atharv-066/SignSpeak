import React from "react";

export default function About() {
  return (
    <div className="page about-page">
      <h2 className="page-title">About SignSpeak</h2>

      <section className="panel">
        <h2>The problem</h2>
        <p>
          Millions of people who are speech- or hearing-impaired face daily
          friction communicating with people who don't know sign language —
          at counters, classrooms, clinics, and public offices. Most
          existing tools either require expensive dedicated hardware, send
          video to a server (a privacy concern), or assume a large trained
          vocabulary that takes months to learn on both sides.
        </p>
      </section>

      <section className="panel">
        <h2>Our solution</h2>
        <p>
          SignSpeak recognizes a small, editable vocabulary of hand
          gestures directly in the browser using on-device computer vision
          (MediaPipe Hands), and speaks the result aloud instantly. No
          video ever leaves the device — recognition, sentence-building,
          and text-to-speech all happen locally.
        </p>
      </section>

      <section className="panel">
        <h2>Why it's different</h2>
        <ul className="about-list">
          <li><strong>Customizable vocabulary</strong> — every gesture's word is editable (see Gesture Library), so it can be adapted to a classroom, a workplace, or a local language, instead of being locked to one fixed sign set.</li>
          <li><strong>Zero backend, zero cost to run</strong> — everything runs client-side; no server, no API costs, no data pipeline to maintain.</li>
          <li><strong>Privacy by design</strong> — the camera feed is processed frame-by-frame in-browser and never transmitted.</li>
          <li><strong>Tunable for real conditions</strong> — hold-time and detection confidence are adjustable, so it can be tuned per lighting/camera setup rather than assuming ideal studio conditions.</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Feasibility &amp; scope</h2>
        <p>
          The current build supports eight hand-shape gestures using a
          rule-based classifier, chosen deliberately over claiming full
          ISL/ASL support — honest about scope, while still demonstrating
          the complete real-time computer-vision-to-speech pipeline.
        </p>
      </section>

      <section className="panel">
        <h2>Future scope</h2>
        <ul className="about-list">
          <li>Train a proper classifier on a labeled Indian Sign Language (ISL) dataset to expand well beyond 7 gestures.</li>
          <li>Two-hand and motion-based gesture support (current version reads a single static hand shape).</li>
          <li>Multi-language voice output (regional languages via Web Speech API voices).</li>
          <li>Shareable custom vocabularies — export a Gesture Library preset for a specific classroom or workplace.</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Tech stack</h2>
        <p>React · MediaPipe Hands (on-device ML) · Web Speech API · Client-side only, no backend.</p>
      </section>
    </div>
  );
}
