import React from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Live Translate", end: true },
  { to: "/library", label: "Gesture Library" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
  { to: "/about", label: "About" },
];

export default function NavBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <h1 className="wordmark">Sign<span>Speak</span></h1>
        <nav className="nav-links">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
