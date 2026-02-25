import { useState, useRef } from "react";

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
    }).then((r) => r.json()),
  sendTicket: (data) =>
    fetch(`${BASE_URL}/send-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};

// ─────────────────────────────────────────────────────────────────────────────
// TICKET TYPES
// ─────────────────────────────────────────────────────────────────────────────
const TICKET_TYPES = [
  { value: "Regular", label: "Regular", price: "KES 100", desc: "Standard event access",        badge: "badge-regular" },
  { value: "VIP",     label: "VIP",     price: "KES 200", desc: "Premium seating & VIP lounge", badge: "badge-vip"     },
  { value: "Group",   label: "Group",   price: "KES 400", desc: "Group of 4 — best value deal", badge: "badge-group"   },
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG EMBLEM
// ─────────────────────────────────────────────────────────────────────────────
function MUTCUEmblem({ size = 40 }) {
  const id = `e${size}${Math.random().toString(36).slice(2,6)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: "block" }}>
      <clipPath id={`tl${id}`}><rect x="0" y="0" width="50" height="50"/></clipPath>
      <clipPath id={`tr${id}`}><rect x="50" y="0" width="50" height="50"/></clipPath>
      <clipPath id={`bl${id}`}><rect x="0" y="50" width="50" height="50"/></clipPath>
      <clipPath id={`br${id}`}><rect x="50" y="50" width="50" height="50"/></clipPath>
      <circle cx="50" cy="50" r="47" fill="#E8710A" clipPath={`url(#tl${id})`}/>
      <circle cx="50" cy="50" r="47" fill="#0D9488" clipPath={`url(#tr${id})`}/>
      <circle cx="50" cy="50" r="47" fill="#0B1D3A" clipPath={`url(#bl${id})`}/>
      <circle cx="50" cy="50" r="47" fill="#DC2626" clipPath={`url(#br${id})`}/>
      <line x1="50" y1="3" x2="50" y2="97" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="47" stroke="#0D9488" strokeWidth="3" fill="none"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD TICKET AS PNG
// ─────────────────────────────────────────────────────────────────────────────
async function downloadTicketAsPNG(result) {
  const typeVal = (result.ticket_type || "Regular");
  const chipColors = {
    Regular: { bg: "rgba(13,148,136,0.25)", color: "#5eead4", border: "rgba(13,148,136,0.5)" },
    VIP:     { bg: "rgba(232,113,10,0.25)",  color: "#fdba74", border: "rgba(232,113,10,0.5)" },
    Group:   { bg: "rgba(220,38,38,0.25)",   color: "#fca5a5", border: "rgba(220,38,38,0.5)" },
  };
  const chip = chipColors[typeVal] || chipColors.Regular;

  const W = 800, H = 400;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2; canvas.height = H * 2;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0f2347");
  bgGrad.addColorStop(0.5, "#0B1D3A");
  bgGrad.addColorStop(1, "#091528");
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();

  // Teal glow top-left
  const glowL = ctx.createRadialGradient(80, 80, 0, 80, 80, 220);
  glowL.addColorStop(0, "rgba(13,148,136,0.22)");
  glowL.addColorStop(1, "transparent");
  ctx.fillStyle = glowL;
  ctx.fillRect(0, 0, W, H);

  // Red glow bottom-right
  const glowR = ctx.createRadialGradient(W - 80, H - 60, 0, W - 80, H - 60, 200);
  glowR.addColorStop(0, "rgba(220,38,38,0.15)");
  glowR.addColorStop(1, "transparent");
  ctx.fillStyle = glowR;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = "rgba(13,148,136,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 52) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 52) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Left panel background (darker)
  const leftGrad = ctx.createLinearGradient(0, 0, 320, 0);
  leftGrad.addColorStop(0, "rgba(13,148,136,0.12)");
  leftGrad.addColorStop(1, "rgba(13,148,136,0.04)");
  ctx.fillStyle = leftGrad;
  roundRect(ctx, 0, 0, 320, H, 20);
  ctx.fill();

  // Perforation line
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "rgba(13,148,136,0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(320, 20); ctx.lineTo(320, H - 20); ctx.stroke();
  ctx.setLineDash([]);

  // Notches
  ctx.fillStyle = "#0B1D3A";
  ctx.beginPath(); ctx.arc(320, 0, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(320, H, 18, 0, Math.PI * 2); ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 0.75, 0.75, W - 1.5, H - 1.5, 20);
  ctx.stroke();

  // ── LEFT PANEL ──

  // Draw emblem (quadrant circles)
  const ex = 50, ey = 52, er = 36;
  const emblemColors = ["#E8710A", "#0D9488", "#0B1D3A", "#DC2626"];
  const quadrants = [
    [ex - er, ey - er, er, er], // TL
    [ex, ey - er, er, er],       // TR
    [ex - er, ey, er, er],       // BL
    [ex, ey, er, er],            // BR
  ];
  quadrants.forEach(([cx, cy, cw, ch], i) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    ctx.fillStyle = emblemColors[i];
    ctx.beginPath();
    ctx.arc(ex, ey, er - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  // Emblem dividers
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(ex, ey - er + 2); ctx.lineTo(ex, ey + er - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex - er + 2, ey); ctx.lineTo(ex + er - 2, ey); ctx.stroke();
  // Emblem ring
  ctx.strokeStyle = "#0D9488";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(ex, ey, er - 1.5, 0, Math.PI * 2); ctx.stroke();

  // Brand text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Arial Black', 'Arial Bold', sans-serif";
  ctx.fillText("MUT CU", ex + er + 12, ey - 4);
  ctx.fillStyle = "rgba(20,184,166,0.9)";
  ctx.font = "10px Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("FILM PREMIERE", ex + er + 12, ey + 13);

  // Divider line
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, 110); ctx.lineTo(290, 110); ctx.stroke();

  // EVENT PASS label
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "9px Arial, sans-serif";
  ctx.fillText("EVENT PASS", 30, 135);

  // Ticket Type chip
  ctx.fillStyle = chip.bg;
  roundRect(ctx, 30, 145, 90, 26, 13);
  ctx.fill();
  ctx.strokeStyle = chip.border;
  ctx.lineWidth = 1;
  roundRect(ctx, 30, 145, 90, 26, 13);
  ctx.stroke();
  ctx.fillStyle = chip.color;
  ctx.font = "bold 11px Arial, sans-serif";
  ctx.fillText(typeVal.toUpperCase(), 52, 162);

  // Attendee
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "9px Arial, sans-serif";
  ctx.fillText("ATTENDEE", 30, 200);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Arial, sans-serif";
  ctx.fillText(result.full_name || "—", 30, 220);

  // Phone
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "9px Arial, sans-serif";
  ctx.fillText("PHONE", 30, 248);
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Arial, sans-serif";
  ctx.fillText(result.phone_number || "—", 30, 266);

  // Bottom color bar
  const barGrad = ctx.createLinearGradient(30, 0, 290, 0);
  barGrad.addColorStop(0, "#E8710A");
  barGrad.addColorStop(0.33, "#0D9488");
  barGrad.addColorStop(0.66, "#DC2626");
  barGrad.addColorStop(1, "#1a3260");
  ctx.fillStyle = barGrad;
  roundRect(ctx, 30, H - 30, 260, 4, 2);
  ctx.fill();

  // MUT Auditorium info
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "9px Arial, sans-serif";
  ctx.fillText("📍 MUT Auditorium · Murang'a University of Technology", 30, H - 40);

  // ── RIGHT PANEL ──

  if (result.qr_image) {
    const qrImg = new Image();
    await new Promise((res, rej) => {
      qrImg.onload = res;
      qrImg.onerror = rej;
      qrImg.src = `data:image/png;base64,${result.qr_image}`;
    });

    // QR white background
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 360, 50, 240, 240, 12);
    ctx.fill();

    // Draw QR
    ctx.drawImage(qrImg, 375, 65, 210, 210);

    // QR label
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "10px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCAN AT ENTRANCE", 480, 312);

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "9px Arial, sans-serif";
    ctx.fillText("Present this QR code at the gate", 480, 328);

    ctx.textAlign = "left";
  } else {
    // No QR placeholder
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    roundRect(ctx, 360, 50, 240, 240, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 360, 50, 240, 240, 12);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "13px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("QR Code", 480, 175);
    ctx.textAlign = "left";
  }

  // Footer text right
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "9px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("© " + new Date().getFullYear() + " MUT CU · Powered by Safaricom M-Pesa", 480, H - 16);
  ctx.textAlign = "left";

  // Download
  const link = document.createElement("a");
  link.download = "MUT CU Film Ticket.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:         #0B1D3A;
    --navy-mid:     #0f2347;
    --navy-light:   #1a3260;
    --teal:         #0D9488;
    --teal-light:   #14b8a8;
    --teal-dim:     #0a7a70;
    --orange:       #E8710A;
    --orange-light: #f59332;
    --orange-dim:   #b85a08;
    --red:          #DC2626;
    --red-light:    #ef4444;
    --red-dim:      #b91c1c;
    --white:        #ffffff;
    --muted:        rgba(255,255,255,0.45);
    --subtle:       rgba(255,255,255,0.22);
    --border:       rgba(13,148,136,0.18);
    --border-soft:  rgba(255,255,255,0.07);
    --shadow:       0 4px 24px rgba(11,29,58,0.45);
    --radius:       14px;
    --radius-sm:    10px;
    --radius-xs:    6px;
  }

  html { -webkit-text-size-adjust: 100%; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--navy);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.5;
  }

  /* ── MESH BACKGROUND ── */
  .bg-mesh {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 70% 55% at 10% 15%, rgba(13,148,136,0.16) 0%, transparent 55%),
      radial-gradient(ellipse 50% 60% at 90% 85%, rgba(220,38,38,0.11) 0%, transparent 55%),
      radial-gradient(ellipse 45% 40% at 85% 10%, rgba(232,113,10,0.09) 0%, transparent 50%),
      var(--navy);
  }
  .bg-mesh::after {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(13,148,136,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(13,148,136,0.04) 1px, transparent 1px);
    background-size: 52px 52px;
  }

  /* ── SHELL ── */
  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  /* ══════════════ NAV ══════════════ */
  nav {
    position: sticky; top: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px; height: 60px;
    background: rgba(11,29,58,0.92); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .nav-brand {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; min-width: 0; flex: 0 0 auto;
  }
  .nav-brand-text { display: flex; flex-direction: column; line-height: 1.2; }
  .nav-brand-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 0.95rem; color: var(--white); white-space: nowrap;
  }
  .nav-brand-subtitle {
    font-size: 0.58rem; font-weight: 500; color: var(--teal-light);
    letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap;
  }

  .nav-links { display: none; }

  .hamburger {
    display: flex; flex-direction: column; justify-content: center; gap: 5px;
    background: none; border: none; cursor: pointer;
    padding: 8px; flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .hamburger span {
    display: block; width: 22px; height: 2px;
    background: rgba(255,255,255,0.75); border-radius: 2px; transition: all 0.22s;
  }

  .mobile-menu {
    display: none; flex-direction: column; gap: 2px;
    position: absolute; top: 60px; left: 0; right: 0;
    background: rgba(11,29,58,0.97); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 10px 12px 14px; z-index: 190;
  }
  .mobile-menu.open { display: flex; }
  .mobile-nav-link {
    display: block; width: 100%; padding: 13px 16px;
    border-radius: var(--radius-xs);
    background: transparent; color: rgba(255,255,255,0.7);
    border: none; cursor: pointer; font-family: 'Inter', sans-serif;
    font-size: 1rem; font-weight: 500; text-align: left; transition: all 0.18s;
  }
  .mobile-nav-link:hover { background: rgba(13,148,136,0.12); color: white; }
  .mobile-nav-link.active { background: rgba(13,148,136,0.15); color: var(--teal-light); }

  /* ══════════════ MAIN ══════════════ */
  main {
    flex: 1; width: 100%;
    padding: 24px 16px 56px;
    max-width: 1200px; margin: 0 auto;
  }

  /* ══════════════ HERO ══════════════ */
  .hero { text-align: center; padding: 36px 0 24px; }

  .hero-emblem-wrap { display: flex; justify-content: center; margin-bottom: 18px; }
  .hero-emblem-inner {
    padding: 10px; border-radius: 50%;
    background: rgba(13,148,136,0.1);
    border: 1px solid rgba(13,148,136,0.25);
    box-shadow: 0 0 28px rgba(13,148,136,0.14);
    line-height: 0;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 999px;
    background: rgba(13,148,136,0.12); border: 1px solid rgba(13,148,136,0.32);
    font-size: 0.72rem; font-weight: 600; color: var(--teal-light);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 18px;
  }
  .badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--teal-light); flex-shrink: 0;
    box-shadow: 0 0 6px var(--teal);
    animation: glow 2s ease-in-out infinite;
  }
  @keyframes glow { 0%,100%{opacity:1} 50%{opacity:0.35} }

  .hero h1 {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: clamp(1.9rem, 7.5vw, 4.4rem);
    line-height: 1.1; color: var(--white);
    margin-bottom: 14px; letter-spacing: -0.01em;
  }
  .hero h1 em    { font-style: normal; color: var(--orange-light); }
  .hero h1 .teal { color: var(--teal-light); }

  .hero-desc {
    font-size: clamp(0.875rem, 2.4vw, 1rem);
    color: var(--muted); max-width: 480px;
    margin: 0 auto; line-height: 1.75;
  }

  .film-strip {
    display: flex; gap: 8px; justify-content: center;
    flex-wrap: wrap; margin: 18px 0 24px;
  }
  .film-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 999px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.75rem; color: rgba(255,255,255,0.5); white-space: nowrap;
  }
  .film-tag strong { color: var(--white); }

  .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* ══════════════ CARDS ══════════════ */
  .card {
    background: rgba(255,255,255,0.035);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    padding: 20px 16px;
    backdrop-filter: blur(14px);
    box-shadow: var(--shadow);
  }
  .card-title {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 1.3rem; margin-bottom: 4px; color: var(--white);
  }
  .card-subtitle {
    font-size: 0.84rem; color: var(--muted);
    margin-bottom: 22px; line-height: 1.6;
  }

  .about-card { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; }
  .about-card-body { flex: 1; min-width: 0; }
  .about-label {
    font-size: 0.67rem; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--orange-light); margin-bottom: 5px;
  }
  .about-title {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: clamp(0.95rem, 3vw, 1.2rem); margin-bottom: 8px;
  }
  .about-text { font-size: 0.85rem; color: var(--muted); line-height: 1.75; }

  .section-label {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 0.76rem; color: rgba(255,255,255,0.45);
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
  }

  /* ══════════════ GRIDS ══════════════ */
  .grid-auto { display: grid; grid-template-columns: 1fr; gap: 12px; }

  /* ══════════════ TICKET GRID ══════════════ */
  .ticket-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 22px; }

  .ticket-option {
    border: 2px solid var(--border-soft);
    border-radius: var(--radius);
    padding: 15px 14px; cursor: pointer;
    background: rgba(255,255,255,0.025);
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }
  .ticket-option.selected { border-color: var(--teal); background: rgba(13,148,136,0.12); }
  .ticket-option.selected::before {
    content: '✓';
    position: absolute; top: 10px; right: 12px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--teal); color: white;
    font-size: 0.65rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .ticket-type-price {
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 1.3rem; color: var(--teal-light);
  }
  .ticket-type-desc { font-size: 0.74rem; color: var(--muted); margin-top: 4px; line-height: 1.5; }
  .ticket-badge {
    display: inline-block; padding: 2px 8px; border-radius: var(--radius-xs);
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em;
    text-transform: uppercase; margin-bottom: 7px;
  }
  .badge-regular { background: rgba(13,148,136,0.15); color: var(--teal-light); }
  .badge-vip     { background: rgba(232,113,10,0.15);  color: var(--orange-light); }
  .badge-group   { background: rgba(220,38,38,0.15);   color: var(--red-light); }

  /* ══════════════ FORM ══════════════ */
  .form-group { margin-bottom: 15px; }
  .form-row { display: grid; grid-template-columns: 1fr; gap: 0; }

  label {
    display: block; font-size: 0.75rem; font-weight: 600;
    color: rgba(255,255,255,0.52); margin-bottom: 6px;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  input {
    width: 100%; padding: 13px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-sm);
    color: var(--white); font-size: 1rem;
    font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    -webkit-appearance: none;
  }
  input:focus {
    border-color: var(--teal);
    background: rgba(13,148,136,0.07);
    box-shadow: 0 0 0 3px rgba(13,148,136,0.15);
  }
  input::placeholder { color: var(--subtle); }
  .hint { font-size: 0.72rem; color: var(--subtle); margin-top: 5px; line-height: 1.5; }

  /* ══════════════ BUTTONS ══════════════ */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 26px; border-radius: 999px;
    font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.2s;
    letter-spacing: 0.01em; line-height: 1;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--red-dim), var(--red));
    color: white; box-shadow: 0 4px 18px rgba(220,38,38,0.32);
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--red), var(--red-light));
    box-shadow: 0 6px 22px rgba(220,38,38,0.4); transform: translateY(-1px);
  }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-teal {
    background: linear-gradient(135deg, var(--teal-dim), var(--teal));
    color: white; box-shadow: 0 4px 16px rgba(13,148,136,0.28);
  }
  .btn-teal:hover:not(:disabled) {
    box-shadow: 0 6px 22px rgba(13,148,136,0.38); transform: translateY(-1px);
  }
  .btn-teal:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-ghost {
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.1); color: white; }
  .btn-download {
    background: linear-gradient(135deg, #0f2347, #1a3260);
    color: white; border: 1px solid rgba(13,148,136,0.4);
    box-shadow: 0 4px 16px rgba(13,148,136,0.18);
  }
  .btn-download:hover {
    background: linear-gradient(135deg, #1a3260, #243f72);
    border-color: rgba(13,148,136,0.7);
    box-shadow: 0 6px 22px rgba(13,148,136,0.28); transform: translateY(-1px);
  }
  .btn-full { width: 100%; }

  /* ══════════════ ALERTS ══════════════ */
  .alert {
    padding: 13px 15px; border-radius: var(--radius-sm);
    font-size: 0.875rem; margin-bottom: 18px;
    display: flex; align-items: flex-start; gap: 10px; line-height: 1.55;
  }
  .alert-error   { background: rgba(220,38,38,0.1);  border: 1px solid rgba(220,38,38,0.28);  color: #fca5a5; }
  .alert-success { background: rgba(13,148,136,0.1); border: 1px solid rgba(13,148,136,0.28); color: #5eead4; }
  .alert-info    { background: rgba(232,113,10,0.1); border: 1px solid rgba(232,113,10,0.28); color: #fdba74; }
  .alert-icon { font-weight: 700; flex-shrink: 0; }

  .spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: white; animation: spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ══════════════ STEP BAR ══════════════ */
  .steps { display: flex; gap: 6px; margin-bottom: 22px; }
  .step {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
    position: relative;
  }
  .step::after {
    content: ''; position: absolute;
    left: calc(50% + 20px); right: calc(-50% + 20px); top: 15px;
    height: 1px; background: rgba(255,255,255,0.08);
  }
  .step:last-child::after { display: none; }
  .step-circle {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 700; z-index: 1;
    border: 2px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.25);
    transition: all 0.25s;
  }
  .step.active .step-circle { border-color: var(--teal);   background: rgba(13,148,136,0.18); color: var(--teal-light); }
  .step.done   .step-circle { border-color: var(--orange); background: rgba(232,113,10,0.15); color: var(--orange-light); }
  .step-label { font-size: 0.67rem; color: rgba(255,255,255,0.25); font-weight: 500; }
  .step.active .step-label  { color: var(--white); }
  .step.done   .step-label  { color: rgba(255,255,255,0.42); }

  /* ══════════════ PROCESSING ══════════════ */
  .processing-overlay { text-align: center; padding: 40px 16px; }
  .processing-ring {
    width: 60px; height: 60px; border-radius: 50%; margin: 18px auto 22px;
    border: 3px solid rgba(13,148,136,0.2);
    border-top: 3px solid var(--teal-light);
    animation: spin 0.9s linear infinite;
  }
  .processing-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.3rem; margin-bottom: 8px; }
  .processing-steps { list-style: none; text-align: left; max-width: 230px; margin: 18px auto 0; }
  .processing-step { padding: 5px 0; font-size: 0.82rem; color: var(--muted); display: flex; align-items: center; gap: 10px; }
  .processing-step.ps-done   { color: var(--teal-light); }
  .processing-step.ps-active { color: var(--white); }
  .ps-icon { width: 14px; text-align: center; flex-shrink: 0; }

  /* ══════════════ SUCCESS TICKET ══════════════ */
  .ticket-card {
    background: rgba(255,255,255,0.035);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius); overflow: hidden;
    width: 100%; max-width: 440px; margin: 0 auto;
  }
  .ticket-header {
    background: linear-gradient(135deg, var(--navy-light), var(--teal-dim));
    border-bottom: 1px solid rgba(13,148,136,0.25);
    padding: 22px 18px; text-align: center;
  }
  .ticket-header-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
  .ticket-header h2 { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; margin-bottom: 3px; }
  .ticket-header p { font-size: 0.74rem; color: rgba(255,255,255,0.55); }
  .ticket-perforations {
    position: relative; height: 22px; background: rgba(11,29,58,0.55);
    display: flex; align-items: center;
  }
  .ticket-perforations::before, .ticket-perforations::after {
    content: ''; position: absolute; top: 50%; transform: translateY(-50%);
    width: 22px; height: 22px; border-radius: 50%; background: var(--navy);
  }
  .ticket-perforations::before { left: -11px; }
  .ticket-perforations::after  { right: -11px; }
  .ticket-dots { flex: 1; border-top: 2px dashed rgba(13,148,136,0.18); margin: 0 14px; }
  .ticket-body { padding: 18px 18px; }
  .ticket-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .ticket-field-label {
    font-size: 0.63rem; font-weight: 600; color: rgba(255,255,255,0.28);
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;
  }
  .ticket-field-value { font-size: 0.88rem; font-weight: 500; color: var(--white); word-break: break-word; }
  .ticket-type-chip {
    display: inline-block; padding: 4px 12px; border-radius: 999px;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .chip-regular { background: rgba(13,148,136,0.18); color: var(--teal-light); }
  .chip-vip     { background: rgba(232,113,10,0.18);  color: var(--orange-light); }
  .chip-group   { background: rgba(220,38,38,0.18);   color: var(--red-light); }
  .ticket-qr {
    background: white; border-radius: var(--radius-sm);
    padding: 12px; display: flex; align-items: center; justify-content: center; margin-top: 16px;
  }
  .ticket-qr img { display: block; width: 100%; max-width: 140px; height: auto; }

  /* ── Misc helpers ── */
  .feature-icon {
    width: 40px; height: 40px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.15rem; margin-bottom: 11px; flex-shrink: 0;
  }
  .icon-teal   { background: rgba(13,148,136,0.15); }
  .icon-orange { background: rgba(232,113,10,0.15); }
  .icon-red    { background: rgba(220,38,38,0.15);  }

  .send-icon {
    width: 62px; height: 62px; border-radius: 17px;
    background: linear-gradient(135deg, rgba(13,148,136,0.2), rgba(13,148,136,0.07));
    border: 1px solid rgba(13,148,136,0.28);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem; margin-bottom: 18px;
  }

  .color-bar {
    height: 3px; border-radius: 2px;
    background: linear-gradient(90deg, var(--orange), var(--teal), var(--red), var(--navy-light));
    margin-bottom: 16px;
  }

  .page-enter { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }

  /* Download button row */
  .ticket-action-row {
    display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px;
  }
  .ticket-action-row .btn { flex: 1; min-width: 140px; }

  footer {
    text-align: center; padding: 22px 16px;
    font-size: 0.75rem; color: rgba(255,255,255,0.2);
    border-top: 1px solid var(--border-soft);
  }
  .footer-logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 7px; }

  /* ════════ TABLET ≥ 640px ════════ */
  @media (min-width: 640px) {
    nav { padding: 0 28px; height: 64px; }
    .mobile-menu { top: 64px; padding: 12px 20px 16px; }
    .nav-brand-title { font-size: 1rem; }
    .nav-brand-subtitle { font-size: 0.62rem; }

    main { padding: 32px 28px 64px; }
    .hero { padding: 48px 0 32px; }

    .card { padding: 26px 26px; }
    .card-title { font-size: 1.4rem; }

    .ticket-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .form-row { grid-template-columns: 1fr 1fr; gap: 14px; }
    .grid-auto { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  }

  /* ════════ DESKTOP ≥ 1024px ════════ */
  @media (min-width: 1024px) {
    nav { padding: 0 52px; height: 68px; }

    .hamburger { display: none !important; }
    .mobile-menu { display: none !important; }

    .nav-links {
      display: flex; gap: 4px; flex-shrink: 0; margin-left: 24px;
    }
    .nav-link {
      padding: 8px 18px; border-radius: 999px;
      background: transparent; color: var(--muted);
      border: none; cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem; font-weight: 500;
      transition: all 0.18s; white-space: nowrap;
    }
    .nav-link:hover { color: var(--white); background: rgba(13,148,136,0.1); }
    .nav-link.active {
      color: var(--white); background: rgba(13,148,136,0.18);
      border: 1px solid rgba(13,148,136,0.38);
    }

    main { padding: 52px 52px 80px; }
    .hero { padding: 72px 0 52px; }

    .card { padding: 30px 34px; }

    /* 3-col grid on desktop */
    .grid-auto { grid-template-columns: repeat(3, 1fr); gap: 16px; }

    /* Desktop buy page: 2-col layout */
    .buy-desktop-layout {
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 28px;
      align-items: start;
    }

    /* Sticky summary panel */
    .buy-summary-panel {
      position: sticky;
      top: 88px;
    }

    footer { padding: 28px 52px; }

    /* Wider success layout on desktop */
    .success-desktop {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: start;
      max-width: 860px;
      margin: 0 auto;
    }
    .success-desktop-left { display: flex; flex-direction: column; gap: 16px; }
    .success-desktop-right { position: sticky; top: 88px; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Alert({ type, children }) {
  const icons = { error: "✕", success: "✓", info: "!" };
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

function Steps({ current }) {
  return (
    <div className="steps">
      {["Details", "Payment", "Ticket"].map((s, i) => (
        <div key={s} className={`step ${i < current ? "done" : i === current ? "active" : ""}`}>
          <div className="step-circle">{i < current ? "✓" : i + 1}</div>
          <div className="step-label">{s}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SUMMARY (desktop sidebar)
// ─────────────────────────────────────────────────────────────────────────────
function OrderSummary({ form }) {
  const ticket = TICKET_TYPES.find(t => t.value === form.ticket_type) || TICKET_TYPES[0];
  return (
    <div className="card" style={{ borderColor: "rgba(13,148,136,0.2)", background: "linear-gradient(135deg, rgba(13,148,136,0.07), rgba(11,29,58,0.5))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <MUTCUEmblem size={28} />
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>Order Summary</div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>MUT CU Film Premiere</div>
        </div>
      </div>

      <div style={{ padding: "14px", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>{ticket.label} Ticket</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>{ticket.desc}</div>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--teal-light)", whiteSpace: "nowrap" }}>{ticket.price}</div>
        </div>
      </div>

      {form.full_name && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.67rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Attendee</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{form.full_name}</div>
        </div>
      )}
      {form.email && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.67rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Email</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 500, wordBreak: "break-all" }}>{form.email}</div>
        </div>
      )}
      {form.phone_number && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.67rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>M-Pesa Number</div>
          <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>{form.phone_number}</div>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Total</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--white)" }}>{ticket.price}</div>
      </div>

      <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.18)", borderRadius: "var(--radius-xs)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
        🔒 Secured by Safaricom M-Pesa. All sales are final.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────────────────────────────────────
function HomePage({ navigate }) {
  return (
    <div className="page-enter">
      <div className="hero">
        <div className="hero-emblem-wrap">
          <div className="hero-emblem-inner"><MUTCUEmblem size={60} /></div>
        </div>
        <div className="hero-badge">
          <span className="badge-dot" />
          MUT CU · Film Premiere Event
        </div>
        <h1>
          Lights. Camera.<br />
          <em>MUT CU</em> <span className="teal">in Action.</span>
        </h1>
        <p className="hero-desc">
          Secure your seat for the official Murang'a University of Technology Christian Union student film premiere — a night of God-given talent, vision, and creativity on the big screen.
        </p>
        <div className="film-strip">
          <div className="film-tag">🎬 <strong>MUT CU Film</strong></div>
          <div className="film-tag">📍 <strong>MUT Auditorium</strong></div>
          <div className="film-tag">🗓 <strong>Date TBA</strong></div>
          <div className="film-tag">⏱ <strong>90 mins</strong></div>
        </div>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={() => navigate("buy")}>
            Get My Ticket →
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("send")}>
            Resend My Ticket
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14, background: "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(11,29,58,0.5))", borderColor: "rgba(13,148,136,0.2)" }}>
        <div className="about-card">
          <MUTCUEmblem size={46} />
          <div className="about-card-body">
            <div className="about-label">About the Film</div>
            <div className="about-title">A Story Rooted in Faith & Purpose</div>
            <p className="about-text">
              This premiere celebrates creativity gifted by God and nurtured at Murang'a University. Written, shot, and produced entirely by MUT CU students — come witness your fellow believers tell a story that matters. Support the vision. Experience the calling.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div className="section-label">Choose Your Ticket</div>
        <div className="grid-auto">
          {TICKET_TYPES.map((t) => (
            <div key={t.value} className="card" style={{ padding: "17px 18px", cursor: "pointer" }} onClick={() => navigate("buy")}>
              <div className={`ticket-badge ${t.badge}`}>{t.label}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "var(--teal-light)", marginBottom: 3 }}>{t.price}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: BUY TICKET
// ─────────────────────────────────────────────────────────────────────────────
function BuyTicketPage() {
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState({ full_name: "", email: "", phone_number: "", ticket_type: "Regular" });
  const [error, setError]       = useState("");
  const [result, setResult]     = useState(null);
  const [procStep, setProcStep] = useState(0);
  const [downloading, setDownloading] = useState(false);

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
      setError("Phone number must be in format 2547XXXXXXXX (12 digits, starting with 2547).");
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
      if (data.detail) { setError(data.detail); setStep(0); }
      else { setResult(data); setStep(2); }
    } catch {
      clearInterval(interval);
      setError("Network error. Check your connection and try again.");
      setStep(0);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTicketAsPNG(result);
    } finally {
      setDownloading(false);
    }
  };

  // PROCESSING
  if (step === 1) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="card page-enter">
          <div className="processing-overlay">
            <div style={{ display: "flex", justifyContent: "center" }}><MUTCUEmblem size={42} /></div>
            <div className="processing-ring" />
            <div className="processing-title">Processing Payment</div>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Check your phone — an M-Pesa prompt was sent to{" "}
              <strong style={{ color: "var(--teal-light)" }}>{form.phone_number}</strong>. Enter your PIN to continue.
            </p>
            <ul className="processing-steps">
              {processingSteps.map((s, i) => (
                <li key={s} className={`processing-step ${i < procStep ? "ps-done" : i === procStep ? "ps-active" : ""}`}>
                  <span className="ps-icon">{i < procStep ? "✓" : i === procStep ? "›" : "·"}</span>
                  {s}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: "0.72rem", color: "var(--subtle)", marginTop: 22 }}>
              This may take up to 40 seconds. Do not close this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS
  if (step === 2 && result) {
    const typeVal = (result.ticket_type || "Regular");
    const chipCls = { Regular: "chip-regular", VIP: "chip-vip", Group: "chip-group" }[typeVal] || "chip-regular";
    const typeLabel = TICKET_TYPES.find(t => t.value === typeVal)?.label || typeVal;

    const TicketCard = () => (
      <div className="ticket-card">
        <div className="ticket-header">
          <div className="ticket-header-logo">
            <MUTCUEmblem size={32} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "0.85rem", lineHeight: 1.2 }}>MUT CU</div>
              <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>FILM PREMIERE</div>
            </div>
          </div>
          <h2>Event Pass</h2>
          <p>Present this QR code at the entrance gate</p>
        </div>
        <div className="ticket-perforations"><div className="ticket-dots" /></div>
        <div className="ticket-body">
          <div className="ticket-fields">
            <div>
              <div className="ticket-field-label">Attendee</div>
              <div className="ticket-field-value">{result.full_name}</div>
            </div>
            <div>
              <div className="ticket-field-label">Phone</div>
              <div className="ticket-field-value">{result.phone_number}</div>
            </div>
          </div>
          <div>
            <div className="ticket-field-label" style={{ marginBottom: 6 }}>Ticket Class</div>
            <span className={`ticket-type-chip ${chipCls}`}>{typeLabel}</span>
          </div>
          {result.qr_image && (
            <div className="ticket-qr">
              <img src={`data:image/png;base64,${result.qr_image}`} alt="Entry QR Code" />
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="page-enter">
        <div className="success-desktop">
          <div className="success-desktop-left">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🎉</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.3rem,5vw,1.7rem)", marginBottom: 6 }}>You're In!</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Ticket confirmed. A copy has been sent to your email.</p>
            </div>

            <div className="color-bar" />

            {/* What's next card */}
            <div className="card" style={{ borderColor: "rgba(13,148,136,0.2)" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 14, color: "var(--teal-light)" }}>What's next?</div>
              {[
                { icon: "📧", title: "Check your email", desc: `Ticket sent to ${result.email || "your email"}` },
                { icon: "💾", title: "Download your ticket", desc: "Save as PNG for offline access" },
                { icon: "📱", title: "Show at the gate", desc: "Scan the QR code to enter" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{item.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ticket-action-row">
              <button className="btn btn-download" onClick={handleDownload} disabled={downloading}>
                {downloading ? <><div className="spinner" /> Saving…</> : <>⬇ Download PNG</>}
              </button>
              <button className="btn btn-ghost" onClick={() => { setStep(0); setResult(null); setForm({ full_name: "", email: "", phone_number: "", ticket_type: "Regular" }); }}>
                Buy Another
              </button>
            </div>
          </div>

          <div className="success-desktop-right">
            <TicketCard />
          </div>
        </div>
      </div>
    );
  }

  // FORM — desktop 2-col layout
  return (
    <div className="page-enter">
      <Steps current={0} />
      <div className="buy-desktop-layout">
        {/* Left: form */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <MUTCUEmblem size={34} />
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>Purchase a Ticket</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>MUT CU Film Premiere · Murang'a University of Technology</div>
            </div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <div style={{ marginBottom: 20 }}>
            <label style={{ marginBottom: 10, display: "block" }}>Select Ticket Type</label>
            <div className="ticket-grid">
              {TICKET_TYPES.map((t) => (
                <div key={t.value} className={`ticket-option ${form.ticket_type === t.value ? "selected" : ""}`} onClick={() => update("ticket_type", t.value)}>
                  <div className={`ticket-badge ${t.badge}`}>{t.label}</div>
                  <div className="ticket-type-price">{t.price}</div>
                  <div className="ticket-type-desc">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="Jane Wanjiku" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} autoComplete="name" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="jane@mut.ac.ke" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label>M-Pesa Phone Number</label>
            <input type="tel" inputMode="numeric" placeholder="2547XXXXXXXX" value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} autoComplete="tel" />
            <div className="hint">Format: 2547XXXXXXXX — an STK push will be sent to this number</div>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleSubmit} style={{ marginTop: 4 }}>
            Pay with M-Pesa 🔒
          </button>
          <p style={{ textAlign: "center", fontSize: "0.71rem", color: "var(--subtle)", marginTop: 11, lineHeight: 1.5 }}>
            All sales are final. Powered by Safaricom M-Pesa.
          </p>
        </div>

        {/* Right: order summary */}
        <div className="buy-summary-panel">
          <OrderSummary form={form} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE: SEND TICKET
// ─────────────────────────────────────────────────────────────────────────────
function SendTicketPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
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
    <div className="page-enter" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="card">
        <div className="send-icon">📧</div>
        <div className="card-title">Resend My Ticket</div>
        <div className="card-subtitle">
          Didn't receive your ticket email? Enter your registered address and we'll resend it instantly.
        </div>

        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {!success && (
          <>
            <div className="form-group">
              <label>Registered Email Address</label>
              <input
                type="email" placeholder="jane@mut.ac.ke"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                autoComplete="email"
              />
              <div className="hint">Must match the email used when you purchased the ticket.</div>
            </div>
            <button className="btn btn-teal btn-full" onClick={handleSend} disabled={loading}>
              {loading ? <><div className="spinner" /> Sending…</> : <>Resend My Ticket →</>}
            </button>
          </>
        )}

        {success && (
          <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => { setSuccess(""); setEmail(""); }}>
            Resend to Another Email
          </button>
        )}
      </div>

      <div className="card" style={{ marginTop: 12, borderColor: "rgba(232,113,10,0.18)" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, marginBottom: 7, fontSize: "0.87rem", color: "var(--orange-light)" }}>
          Need further help?
        </div>
        <p style={{ fontSize: "0.81rem", color: "var(--muted)", lineHeight: 1.7 }}>
          If your M-Pesa was deducted but no ticket arrived, contact the MUT CU team with your phone number and M-Pesa confirmation message.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP SHELL
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]         = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "buy",  label: "Buy Ticket" },
    { id: "send", label: "Resend Ticket" },
  ];

  const navigate = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage navigate={navigate} />;
      case "buy":  return <BuyTicketPage />;
      case "send": return <SendTicketPage />;
      default:     return <HomePage navigate={navigate} />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bg-mesh" />
      <div className="app">
        <nav>
          <div className="nav-brand" onClick={() => navigate("home")}>
            <MUTCUEmblem size={32} />
            <div className="nav-brand-text">
              <div className="nav-brand-title">MUT CU Tickets</div>
              <div className="nav-brand-subtitle">Murang'a University of Technology</div>
            </div>
          </div>

          <div className="nav-links">
            {navItems.map((n) => (
              <button key={n.id} className={`nav-link ${page === n.id ? "active" : ""}`} onClick={() => navigate(n.id)}>
                {n.label}
              </button>
            ))}
          </div>

          <button className="hamburger" onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
            <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
          </button>

          <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
            {navItems.map((n) => (
              <button key={n.id} className={`mobile-nav-link ${page === n.id ? "active" : ""}`} onClick={() => navigate(n.id)}>
                {n.label}
              </button>
            ))}
          </div>
        </nav>

        <main>{renderPage()}</main>

        <footer>
          <div className="footer-logo">
            <MUTCUEmblem size={20} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "rgba(255,255,255,0.28)" }}>
              MUT CU Tickets
            </span>
          </div>
          <div>© {new Date().getFullYear()} Murang'a University of Technology Christian Union · Film Premiere</div>
          <div style={{ marginTop: 4, color: "rgba(255,255,255,0.13)" }}>Powered by Safaricom M-Pesa</div>
        </footer>
      </div>
    </>
  );
}