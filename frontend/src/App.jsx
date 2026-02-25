import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8001";

const api = {
  buyTicket: (data) =>
    fetch(`${BASE_URL}/buy-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json()),
  sendTicket: (data) =>
    fetch(`${BASE_URL}/send-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json()),
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0a1628;
    --blue-mid: #1346a0;
    --blue: #1a5cde;
    --blue-light: #3b82f6;
    --sky: #e8f1ff;
    --white: #ffffff;
    --slate: #64748b;
    --success: #10b981;
    --error: #ef4444;
    --warning: #f59e0b;
    --border: rgba(26,92,222,0.15);
    --shadow-sm: 0 2px 8px rgba(10,22,40,0.08);
    --shadow-md: 0 8px 32px rgba(10,22,40,0.12);
    --shadow-lg: 0 24px 64px rgba(10,22,40,0.18);
    --radius: 16px;
    --radius-sm: 8px;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--navy);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Animated mesh background */
  .bg-mesh {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 50% at 20% 20%, rgba(26,92,222,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 80% 80%, rgba(19,70,160,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%),
      var(--navy);
  }
  .bg-mesh::after {
    content: '';
    position: absolute; inset: 0;
    background-image: 
      linear-gradient(rgba(26,92,222,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,92,222,0.03) 1px, transparent 1px);
    background-size: 64px 64px;
  }

  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  /* ── NAV ── */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px;
    border-bottom: 1px solid var(--border);
    background: rgba(10,22,40,0.6);
    backdrop-filter: blur(20px);
    position: sticky; top: 0; z-index: 100;
  }
  .nav-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; color: var(--white);
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    text-decoration: none;
  }
  .nav-logo span { color: var(--blue-light); }
  .logo-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--blue-light);
    box-shadow: 0 0 12px var(--blue-light);
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }

  .nav-links { display: flex; gap: 8px; }
  .nav-link {
    padding: 8px 20px; border-radius: 999px;
    background: transparent; color: rgba(255,255,255,0.6);
    border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 500; transition: all 0.2s;
  }
  .nav-link:hover { color: var(--white); background: rgba(255,255,255,0.06); }
  .nav-link.active {
    color: var(--white); background: rgba(26,92,222,0.25);
    border: 1px solid rgba(26,92,222,0.4);
  }

  /* ── MAIN ── */
  main { flex: 1; padding: 64px 48px; max-width: 1200px; margin: 0 auto; width: 100%; }

  /* ── HERO ── */
  .hero { text-align: center; padding: 80px 0 60px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 18px; border-radius: 999px;
    background: rgba(26,92,222,0.15); border: 1px solid rgba(26,92,222,0.35);
    font-size: 0.8rem; font-weight: 600; color: var(--blue-light);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 28px;
  }
  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.8rem, 6vw, 5rem);
    line-height: 1.1; color: var(--white); margin-bottom: 20px;
  }
  .hero h1 em { font-style: italic; color: var(--blue-light); }
  .hero p { font-size: 1.1rem; color: rgba(255,255,255,0.55); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }

  /* ── CARDS ── */
  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: var(--radius);
    padding: 40px;
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-md);
  }
  .card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; margin-bottom: 8px; color: var(--white);
  }
  .card-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.45); margin-bottom: 32px; }

  /* ── TICKET TYPE SELECTOR ── */
  .ticket-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .ticket-option {
    border: 2px solid rgba(255,255,255,0.08);
    border-radius: var(--radius);
    padding: 24px 20px; cursor: pointer;
    background: rgba(255,255,255,0.03);
    transition: all 0.25s; position: relative; overflow: hidden;
  }
  .ticket-option:hover { border-color: rgba(26,92,222,0.5); background: rgba(26,92,222,0.08); }
  .ticket-option.selected { border-color: var(--blue); background: rgba(26,92,222,0.15); }
  .ticket-option.selected::before {
    content: '✓';
    position: absolute; top: 12px; right: 14px;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--blue); color: white; font-size: 0.7rem;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
  }
  .ticket-type-name { font-weight: 600; font-size: 1rem; margin-bottom: 4px; }
  .ticket-type-price { font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: var(--blue-light); }
  .ticket-type-desc { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 6px; }
  .ticket-badge {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .badge-regular { background: rgba(100,116,139,0.2); color: #94a3b8; }
  .badge-vip { background: rgba(245,158,11,0.15); color: var(--warning); }
  .badge-group { background: rgba(16,185,129,0.15); color: var(--success); }

  /* ── FORM ── */
  .form-group { margin-bottom: 20px; }
  label { display: block; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.6); margin-bottom: 8px; letter-spacing: 0.04em; text-transform: uppercase; }
  input, select {
    width: 100%; padding: 14px 18px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-sm);
    color: var(--white); font-size: 0.95rem; font-family: 'DM Sans', sans-serif;
    outline: none; transition: all 0.2s;
  }
  input:focus, select:focus { border-color: var(--blue); background: rgba(26,92,222,0.08); box-shadow: 0 0 0 3px rgba(26,92,222,0.15); }
  input::placeholder { color: rgba(255,255,255,0.25); }
  select option { background: var(--navy); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    padding: 15px 32px; border-radius: 999px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.25s; text-decoration: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--blue-mid), var(--blue));
    color: white; box-shadow: 0 4px 20px rgba(26,92,222,0.4);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px); box-shadow: 0 8px 32px rgba(26,92,222,0.5);
  }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-ghost {
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; }
  .btn-full { width: 100%; }
  .btn-sm { padding: 10px 22px; font-size: 0.85rem; }

  /* ── STATUS / ALERTS ── */
  .alert {
    padding: 16px 20px; border-radius: var(--radius-sm);
    font-size: 0.9rem; margin-bottom: 24px;
    display: flex; align-items: flex-start; gap: 12px;
  }
  .alert-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }
  .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; }
  .alert-info { background: rgba(26,92,222,0.1); border: 1px solid rgba(26,92,222,0.25); color: #93c5fd; }

  /* ── LOADING SPINNER ── */
  .spinner {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: white; animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── SUCCESS TICKET ── */
  .ticket-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius); overflow: hidden;
    max-width: 520px; margin: 0 auto;
  }
  .ticket-header {
    background: linear-gradient(135deg, var(--blue-mid), var(--blue));
    padding: 32px; text-align: center;
  }
  .ticket-header h2 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; margin-bottom: 4px; }
  .ticket-header p { font-size: 0.85rem; opacity: 0.8; }
  .ticket-perforations {
    position: relative; height: 28px;
    background: rgba(10,22,40,0.5);
    display: flex; align-items: center;
  }
  .ticket-perforations::before, .ticket-perforations::after {
    content: ''; position: absolute; top: 50%; transform: translateY(-50%);
    width: 28px; height: 28px; border-radius: 50%; background: var(--navy);
  }
  .ticket-perforations::before { left: -14px; }
  .ticket-perforations::after { right: -14px; }
  .ticket-dots { flex: 1; border-top: 2px dashed rgba(255,255,255,0.12); margin: 0 20px; }
  .ticket-body { padding: 32px; }
  .ticket-field { margin-bottom: 20px; }
  .ticket-field-label { font-size: 0.72rem; font-weight: 600; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .ticket-field-value { font-size: 1rem; font-weight: 500; color: var(--white); }
  .ticket-qr {
    background: white; border-radius: var(--radius-sm);
    padding: 16px; display: flex; align-items: center; justify-content: center;
    margin: 24px 0;
  }
  .ticket-qr img { display: block; max-width: 180px; }

  /* ── STEPS ── */
  .steps { display: flex; gap: 12px; margin-bottom: 36px; }
  .step {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
    position: relative;
  }
  .step::after {
    content: ''; position: absolute; left: calc(50% + 20px);
    right: calc(-50% + 20px); top: 18px;
    height: 1px; background: rgba(255,255,255,0.1);
  }
  .step:last-child::after { display: none; }
  .step-circle {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 700; z-index: 1;
    border: 2px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.3);
    transition: all 0.3s;
  }
  .step.active .step-circle { border-color: var(--blue); background: rgba(26,92,222,0.2); color: var(--blue-light); }
  .step.done .step-circle { border-color: var(--success); background: rgba(16,185,129,0.15); color: var(--success); }
  .step-label { font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 500; }
  .step.active .step-label { color: var(--white); }
  .step.done .step-label { color: rgba(255,255,255,0.5); }

  /* ── SEND TICKET PAGE ── */
  .send-illustration {
    width: 80px; height: 80px; border-radius: 20px;
    background: linear-gradient(135deg, rgba(26,92,222,0.2), rgba(59,130,246,0.2));
    border: 1px solid rgba(26,92,222,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin-bottom: 24px;
  }

  /* ── PAGE TRANSITIONS ── */
  .page-enter { animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }

  /* ── FOOTER ── */
  footer {
    text-align: center; padding: 32px 48px;
    font-size: 0.8rem; color: rgba(255,255,255,0.2);
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  /* ── STATUS INDICATOR DURING PROCESSING ── */
  .processing-overlay {
    text-align: center; padding: 48px 32px;
  }
  .processing-ring {
    width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 24px;
    border: 3px solid rgba(26,92,222,0.2);
    border-top: 3px solid var(--blue-light);
    animation: spin 1s linear infinite;
  }
  .processing-title { font-family: 'DM Serif Display', serif; font-size: 1.6rem; margin-bottom: 10px; }
  .processing-steps { list-style: none; text-align: left; max-width: 260px; margin: 24px auto 0; }
  .processing-step { padding: 6px 0; font-size: 0.85rem; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 10px; }
  .processing-step.ps-done { color: var(--success); }
  .processing-step.ps-active { color: var(--white); }
  .ps-icon { width: 18px; text-align: center; flex-shrink: 0; }

  /* ── FILM DETAILS STRIP ── */
  .film-strip {
    display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
    margin: 28px 0 40px;
  }
  .film-tag {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 999px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.82rem; color: rgba(255,255,255,0.6);
  }
  .film-tag strong { color: var(--white); }

  /* ── MOBILE HAMBURGER ── */
  .hamburger {
    display: none; flex-direction: column; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 6px;
  }
  .hamburger span {
    display: block; width: 22px; height: 2px;
    background: rgba(255,255,255,0.7); border-radius: 2px;
    transition: all 0.25s;
  }
  .mobile-menu {
    display: none; flex-direction: column; gap: 4px;
    position: absolute; top: 100%; left: 0; right: 0;
    background: rgba(10,22,40,0.98); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border); padding: 12px 16px 16px;
    z-index: 99;
  }
  .mobile-menu.open { display: flex; }
  .mobile-nav-link {
    padding: 12px 16px; border-radius: var(--radius-sm);
    background: transparent; color: rgba(255,255,255,0.7);
    border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; font-weight: 500; text-align: left; transition: all 0.2s;
  }
  .mobile-nav-link:hover { background: rgba(255,255,255,0.06); color: white; }
  .mobile-nav-link.active { background: rgba(26,92,222,0.2); color: var(--blue-light); }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    nav { padding: 14px 20px; position: relative; }
    .nav-links { display: none; }
    .hamburger { display: flex; }
    main { padding: 32px 16px; }
    .hero { padding: 48px 0 32px; }
    .hero h1 { font-size: clamp(1.9rem, 8vw, 2.6rem); }
    .hero p { font-size: 0.95rem; }
    .film-strip { gap: 8px; }
    .ticket-grid { grid-template-columns: 1fr; gap: 12px; }
    .form-row { grid-template-columns: 1fr; }
    .steps { display: none; }
    .card { padding: 24px 20px; }
    .processing-overlay { padding: 32px 16px; }
    .ticket-card { margin: 0; }
    footer { padding: 24px 20px; }
    .features-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 420px) {
    nav { padding: 12px 16px; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TICKET TYPES CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TICKET_TYPES = [
  { value: "Regular", label: "Regular", price: "KES 100", desc: "Standard access to the event", badge: "badge-regular" },
  { value: "VIP", label: "VIP", price: "KES 200", desc: "Premium seating & exclusive lounge", badge: "badge-vip" },
  { value: "Group", label: "Group", price: "KES 400", desc: "Group of 4 — best value", badge: "badge-group" },
];

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Alert({ type, children }) {
  const icons = { error: "✕", success: "✓", info: "ℹ" };
  return (
    <div className={`alert alert-${type}`}>
      <span style={{ fontWeight: 700 }}>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

function Steps({ current }) {
  const steps = ["Details", "Payment", "Ticket"];
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`step ${i < current ? "done" : i === current ? "active" : ""}`}
        >
          <div className="step-circle">{i < current ? "✓" : i + 1}</div>
          <div className="step-label">{s}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
  return (
    <div className="page-enter">
      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-badge">
          <div className="logo-dot" />
          Covenant University · Official Film Premiere
        </div>
        <h1>
          Lights. Camera.<br />
          <em>CU in Action.</em>
        </h1>
        <p>
          Experience the debut screening of the official Covenant University student film — produced, directed, and performed entirely by CU students. Reserve your seat before it sells out.
        </p>

        {/* Film meta strip */}
        <div className="film-strip">
          <div className="film-tag">🎬 <strong>CU Student Film</strong></div>
          <div className="film-tag">📍 <strong>CU Auditorium</strong></div>
          <div className="film-tag">🗓 <strong>Date TBA</strong></div>
          <div className="film-tag">⏱ <strong>90 mins</strong></div>
        </div>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("buy")}>
            <span>Get My Ticket</span>
            <span style={{ fontSize: "1.1rem" }}>→</span>
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("send")}>
            Resend My Ticket
          </button>
        </div>
      </div>

      {/* ── FILM HIGHLIGHT BOX ── */}
      <div className="card" style={{ marginBottom: 20, padding: "28px 32px", background: "linear-gradient(135deg, rgba(26,92,222,0.12), rgba(10,22,40,0.4))", borderColor: "rgba(26,92,222,0.25)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: "3.5rem", lineHeight: 1, flexShrink: 0 }}>🎥</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue-light)", marginBottom: 6 }}>
              About the Film
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", marginBottom: 10 }}>
              A Story Born on Campus
            </div>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>
              This premiere is a celebration of creativity from within the Covenant University community. Written, shot, and edited by our very own students — this is CU talent on the big screen. Come support your fellow Covenanters and witness something unforgettable.
            </p>
          </div>
        </div>
      </div>

      {/* ── TICKET TIERS PREVIEW ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", marginBottom: 14, paddingLeft: 2, color: "rgba(255,255,255,0.7)" }}>
          Choose Your Ticket
        </div>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
          {TICKET_TYPES.map((t) => (
            <div
              key={t.value}
              className="card"
              style={{ padding: "20px 22px", cursor: "pointer", transition: "border-color 0.2s" }}
              onClick={() => navigate("buy")}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(26,92,222,0.45)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            >
              <div className={`ticket-badge ${t.badge}`} style={{ marginBottom: 8 }}>{t.label}</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", color: "var(--blue-light)", marginBottom: 4 }}>{t.price}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE PILLS ── */}
      <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14 }}>
        {[
          { icon: "⚡", title: "Instant M-Pesa Payment", desc: "STK push sent directly to your phone — approve and you're in." },
          { icon: "🎟️", title: "QR Digital Ticket", desc: "Your ticket arrives by email with a unique QR code for gate entry." },
          { icon: "🔒", title: "Secure & Verified", desc: "All transactions processed securely via Safaricom M-Pesa." },
        ].map((f) => (
          <div key={f.title} className="card" style={{ padding: "22px 24px" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: BUY TICKET
// ─────────────────────────────────────────────────────────────────────────────
function BuyTicketPage() {
  const [step, setStep] = useState(0); // 0=form, 1=processing, 2=success
  const [form, setForm] = useState({ full_name: "", email: "", phone_number: "", ticket_type: "Regular" });
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [procStep, setProcStep] = useState(0);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const processingSteps = [
    "Validating your details",
    "Sending M-Pesa STK Push",
    "Awaiting payment confirmation",
    "Generating your ticket",
  ];

  const handleSubmit = async () => {
    setError("");
    if (!form.full_name || !form.email || !form.phone_number) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^2547\d{8}$/.test(form.phone_number)) {
      setError("Phone number must be in format 2547XXXXXXXX (12 digits, start with 2547).");
      return;
    }

    setStep(1);
    let ps = 0;
    const interval = setInterval(() => {
      ps++;
      if (ps < processingSteps.length) setProcStep(ps);
    }, 6000);

    try {
      const data = await api.buyTicket(form);
      clearInterval(interval);
      if (data.detail) {
        setError(data.detail);
        setStep(0);
      } else {
        setResult(data);
        setStep(2);
      }
    } catch (e) {
      clearInterval(interval);
      setError("Network error. Please check your connection and try again.");
      setStep(0);
    }
  };

  if (step === 1) {
    return (
      <div className="card page-enter" style={{ maxWidth: 540, margin: "0 auto" }}>
        <div className="processing-overlay">
          <div className="processing-ring" />
          <div className="processing-title">Processing Payment</div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
            Check your phone — an M-Pesa prompt has been sent to{" "}
            <strong style={{ color: "var(--white)" }}>{form.phone_number}</strong>
          </p>
          <ul className="processing-steps">
            {processingSteps.map((s, i) => (
              <li
                key={s}
                className={`processing-step ${i < procStep ? "ps-done" : i === procStep ? "ps-active" : ""}`}
              >
                <span className="ps-icon">
                  {i < procStep ? "✓" : i === procStep ? "→" : "·"}
                </span>
                {s}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.2)", marginTop: 32 }}>
            This may take up to 40 seconds. Do not close this page.
          </p>
        </div>
      </div>
    );
  }

  if (step === 2 && result) {
    const typeLabel = TICKET_TYPES.find((t) => t.value === result.ticket_type)?.label || result.ticket_type;
    return (
      <div className="page-enter" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.8rem", marginBottom: 8 }}>
            Payment Confirmed!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            Your ticket has been sent to your email address.
          </p>
        </div>
        <div className="ticket-card">
          <div className="ticket-header">
            <h2>TickPick Event Pass</h2>
            <p>Keep this ticket safe — you'll need it at the gate</p>
          </div>
          <div className="ticket-perforations">
            <div className="ticket-dots" />
          </div>
          <div className="ticket-body">
            <div className="ticket-field">
              <div className="ticket-field-label">Attendee</div>
              <div className="ticket-field-value">{result.full_name}</div>
            </div>
            <div className="ticket-field">
              <div className="ticket-field-label">Phone Number</div>
              <div className="ticket-field-value">{result.phone_number}</div>
            </div>
            <div className="ticket-field">
              <div className="ticket-field-label">Ticket Class</div>
              <div className="ticket-field-value">{typeLabel}</div>
            </div>
            {result.qr_image && (
              <div className="ticket-qr">
                <img src={`data:image/png;base64,${result.qr_image}`} alt="QR Code" />
              </div>
            )}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 20 }}
          onClick={() => { setStep(0); setResult(null); setForm({ full_name: "", email: "", phone_number: "", ticket_type: "Regular" }); }}
        >
          Buy Another Ticket
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: 640, margin: "0 auto" }}>
      <Steps current={0} />
      <div className="card">
        <div className="card-title">Purchase a Ticket</div>
        <div className="card-subtitle">Select your ticket type and enter your details below.</div>

        {error && <Alert type="error">{error}</Alert>}

        <div style={{ marginBottom: 28 }}>
          <label style={{ marginBottom: 16, display: "block" }}>Ticket Type</label>
          <div className="ticket-grid">
            {TICKET_TYPES.map((t) => (
              <div
                key={t.value}
                className={`ticket-option ${form.ticket_type === t.value ? "selected" : ""}`}
                onClick={() => update("ticket_type", t.value)}
              >
                <div className={`ticket-badge ${t.badge}`}>{t.label}</div>
                <div className="ticket-type-price">{t.price}</div>
                <div className="ticket-type-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              placeholder="Jane Wanjiku"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>M-Pesa Phone Number</label>
          <input
            placeholder="2547XXXXXXXX"
            value={form.phone_number}
            onChange={(e) => update("phone_number", e.target.value)}
          />
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            Format: 2547XXXXXXXX — an STK push will be sent to this number
          </p>
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSubmit} style={{ marginTop: 8 }}>
          <span>Pay with M-Pesa</span>
          <span>🔒</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: SEND TICKET
// ─────────────────────────────────────────────────────────────────────────────
function SendTicketPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async () => {
    setError(""); setSuccess("");
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      const data = await api.sendTicket({ email });
      if (data.message) setSuccess(data.message);
      else if (data.detail) setError(data.detail);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card">
        <div className="send-illustration">📧</div>
        <div className="card-title">Resend My Ticket</div>
        <div className="card-subtitle">
          Didn't receive your ticket? Enter your registered email and we'll resend it instantly.
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {!success && (
          <>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                This must match the email used when you purchased the ticket.
              </p>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSend} disabled={loading}>
              {loading ? <><div className="spinner" /> Sending...</> : <>Send My Ticket →</>}
            </button>
          </>
        )}

        {success && (
          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: 8 }}
            onClick={() => { setSuccess(""); setEmail(""); }}
          >
            Resend Again
          </button>
        )}
      </div>

      {/* Help block */}
      <div className="card" style={{ marginTop: 20, padding: "24px 28px" }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: "0.9rem" }}>Need further help?</div>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
          If your payment was deducted but you still haven't received a ticket,
          please contact our support team with your phone number and payment receipt.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "buy", label: "Buy Ticket" },
    { id: "send", label: "Resend Ticket" },
  ];

  const navigate = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0,0); };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage navigate={navigate} />;
      case "buy": return <BuyTicketPage />;
      case "send": return <SendTicketPage />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bg-mesh" />
      <div className="app">
        <nav>
          <div className="nav-logo" onClick={() => navigate("home")}>
            <div className="logo-dot" />
            CU<span>Tickets</span>
          </div>
          {/* Desktop links */}
          <div className="nav-links">
            {navItems.map((n) => (
              <button
                key={n.id}
                className={`nav-link ${page === n.id ? "active" : ""}`}
                onClick={() => navigate(n.id)}
              >
                {n.label}
              </button>
            ))}
          </div>
          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <span style={menuOpen ? { transform: "rotate(45deg) translate(5px, 5px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px, -5px)" } : {}} />
          </button>
          {/* Mobile dropdown */}
          <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
            {navItems.map((n) => (
              <button
                key={n.id}
                className={`mobile-nav-link ${page === n.id ? "active" : ""}`}
                onClick={() => navigate(n.id)}
              >
                {n.label}
              </button>
            ))}
          </div>
        </nav>
        <main>{renderPage()}</main>
        <footer>
          © 2025 CUTickets · Covenant University Film Premiere · Powered by M-Pesa
        </footer>
      </div>
    </>
  );
}