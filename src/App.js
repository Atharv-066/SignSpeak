import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { GestureProvider } from "./context/GestureContext";
import NavBar from "./components/NavBar";
import LiveTranslate from "./pages/LiveTranslate";
import GestureLibrary from "./pages/GestureLibrary";
import History from "./pages/History";
import Settings from "./pages/Settings";
import About from "./pages/About";

export default function App() {
  return (
    <GestureProvider>
      <HashRouter>
        <div className="app">
          <NavBar />
          <main>
            <Routes>
              <Route path="/" element={<LiveTranslate />} />
              <Route path="/library" element={<GestureLibrary />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <footer>SignSpeak — all processing happens on-device; no video ever leaves your browser.</footer>
        </div>
      </HashRouter>
    </GestureProvider>
  );
}
