// Animated environments, drawn on one full-screen canvas. Ported from prototype/chronos-v4.html (SCN).
// Each scene is a pure function of time, so a frozen frame (motion off) is just a fixed t.
export type SceneFn = (cx: CanvasRenderingContext2D, t: number, W: number, H: number, accent: string, dens: number) => void;

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
function stars(cx: CanvasRenderingContext2D, t: number, W: number, H: number, n: number, sp: number, al: number, o = 0) {
  for (let i = o; i < n + o; i++) {
    const x = (((rnd(i) * W + t * sp * (0.3 + rnd(i + 9))) % W) + W) % W;
    const y = rnd(i + 3) * H;
    const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + rnd(i + 5)) + i);
    cx.globalAlpha = al * (0.25 + 0.75 * tw);
    cx.fillStyle = "#fff";
    const z = rnd(i + 7) > 0.92 ? 2 : 1;
    cx.fillRect(x, y, z, z);
  }
  cx.globalAlpha = 1;
}
function glow(cx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a: number) {
  const g = cx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c);
  g.addColorStop(1, "transparent");
  cx.globalAlpha = a;
  cx.fillStyle = g;
  cx.fillRect(x - r, y - r, r * 2, r * 2);
  cx.globalAlpha = 1;
}

const base: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 90 * d, 3, 0.7);
  glow(cx, W * 0.5, H * 0.2, H * 0.6, a, 0.12);
  // concentric orbital lines, slowly turning
  cx.strokeStyle = a;
  cx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    cx.globalAlpha = 0.1 + i * 0.03;
    cx.beginPath();
    cx.ellipse(W / 2, H * 0.2, 90 + i * 70, 30 + i * 24, 0.2 + Math.sin(t * 0.05 + i) * 0.1, 0, 7);
    cx.stroke();
    const an = t * (0.25 - i * 0.04) + i * 2;
    cx.globalAlpha = 0.8;
    cx.fillStyle = a;
    cx.fillRect(W / 2 + Math.cos(an) * (90 + i * 70) - 1.5, H * 0.2 + Math.sin(an) * (30 + i * 24) - 1.5, 3, 3);
  }
  cx.globalAlpha = 1;
};

const orb: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 80 * d, 0, 0.8);
  const ex = W * 0.5, ey = H * 2.05, r = H * 1.25;
  const g = cx.createRadialGradient(ex, H * 0.9, 0, ex, ey, r);
  g.addColorStop(0, "#2f6fae");
  g.addColorStop(1, "#071b33");
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(ex, ey, r, 0, 7);
  cx.fill();
  cx.save();
  cx.clip();
  cx.fillStyle = "#fff";
  for (let i = 0; i < 16; i++) {
    const x = ((rnd(i) * W * 1.4 + t * (10 + i * 2)) % (W * 1.4)) - W * 0.2;
    const y = H * 0.88 + rnd(i + 2) * H * 0.45;
    cx.globalAlpha = 0.1;
    cx.beginPath();
    cx.ellipse(x, y, 70 + rnd(i + 4) * 150, 5 + rnd(i + 6) * 9, 0, 0, 7);
    cx.fill();
  }
  cx.restore();
  cx.globalAlpha = 0.55;
  cx.strokeStyle = "#9fcdf2";
  cx.lineWidth = 3;
  cx.beginPath();
  cx.arc(ex, ey, r, 0, 7);
  cx.stroke();
  // pulsing radiation-belt ring
  cx.strokeStyle = a;
  cx.lineWidth = 26;
  cx.globalAlpha = 0.1 + 0.08 * Math.sin(t * 0.8);
  cx.beginPath();
  cx.ellipse(ex, ey, W * 0.62, H * 1.55, 0, 0, 7);
  cx.stroke();
  cx.globalAlpha = 1;
  // satellite with trail
  for (let k = 0; k < 14; k++) {
    const an = t * 0.12 - k * 0.012;
    const x = ex + Math.cos(an) * W * 0.62, y = ey + Math.sin(an) * H * 1.55 * 0.9;
    if (y < H && y > 0) {
      cx.fillStyle = "#fff";
      cx.globalAlpha = 0.9 - k * 0.06;
      cx.fillRect(x, y, k ? 2 : 4, k ? 2 : 4);
    }
  }
  cx.globalAlpha = 1;
};

const moon: SceneFn = (cx, t, W, H, _a, d) => {
  stars(cx, t, W, H, 110 * d, 2, 0.9);
  const ex = W * 0.72, ey = H * 0.3 + Math.sin(t * 0.07) * H * 0.015, r = Math.min(W, H) * 0.07;
  glow(cx, ex, ey, r * 3, "#4a8fc0", 0.35);
  const g = cx.createRadialGradient(ex - r * 0.3, ey - r * 0.3, 0, ex, ey, r);
  g.addColorStop(0, "#8fc4e6");
  g.addColorStop(0.6, "#2a5f8f");
  g.addColorStop(1, "#0b1d33");
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(ex, ey, r, 0, 7);
  cx.fill();
  cx.save();
  cx.clip();
  cx.fillStyle = "#fff";
  for (let i = 0; i < 4; i++) {
    cx.globalAlpha = 0.25;
    cx.beginPath();
    cx.ellipse(ex + Math.sin(t * 0.2 + i * 2) * r, ey + (i - 1.5) * r * 0.4, r * 0.6, r * 0.08, 0, 0, 7);
    cx.fill();
  }
  cx.restore();
  cx.globalAlpha = 1;
  // occasional shooting star
  const k = (t % 9) / 9;
  if (k < 0.1) {
    const p = k / 0.1;
    cx.strokeStyle = "#fff";
    cx.globalAlpha = 1 - p;
    cx.lineWidth = 1.5;
    cx.beginPath();
    cx.moveTo(W * (0.1 + p * 0.4), H * (0.1 + p * 0.2));
    cx.lineTo(W * (0.1 + p * 0.4) - 70, H * (0.1 + p * 0.2) - 25);
    cx.stroke();
    cx.globalAlpha = 1;
  }
  // far ridge, near ground, long slow shadow
  const ridge = (y0: number, amp: number, f: number, col: string) => {
    cx.fillStyle = col;
    cx.beginPath();
    cx.moveTo(0, H);
    for (let x = 0; x <= W; x += 16) cx.lineTo(x, H * y0 - Math.sin(x * f + 1) * H * amp - Math.sin(x * f * 3.1) * H * amp * 0.35);
    cx.lineTo(W, H);
    cx.fill();
  };
  ridge(0.7, 0.03, 0.005, "#141b20");
  ridge(0.8, 0.035, 0.004, "#1d262b");
  cx.fillStyle = "#000";
  cx.globalAlpha = 0.28;
  cx.beginPath();
  const sx = W * (0.5 + 0.08 * Math.sin(t * 0.05));
  cx.ellipse(sx, H * 0.86, W * 0.16, H * 0.012, 0, 0, 7);
  cx.fill();
  // floating dust motes
  for (let i = 0; i < 46 * d; i++) {
    const x = rnd(i) * W + Math.sin(t * 0.3 + i) * 18;
    const y = H * 0.95 - ((t * 9 * (0.3 + rnd(i + 2)) + rnd(i + 4) * H) % (H * 0.55));
    cx.globalAlpha = 0.25 * (1 - (H * 0.95 - y) / (H * 0.55));
    cx.fillStyle = "#cfd6db";
    cx.fillRect(x, y, 2, 2);
  }
  cx.globalAlpha = 1;
};

const mars: SceneFn = (cx, t, W, H, _a, d) => {
  const g = cx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a120d");
  g.addColorStop(1, "#8a4a30");
  cx.globalAlpha = 0.9;
  cx.fillStyle = g;
  cx.fillRect(0, 0, W, H);
  cx.globalAlpha = 1;
  glow(cx, W * 0.28, H * 0.3, 90, "#ffd9a0", 0.5 + 0.1 * Math.sin(t));
  cx.strokeStyle = "#e8c39a";
  cx.lineWidth = 1;
  for (let i = 0; i < 170 * d; i++) {
    const x = (rnd(i) * W + t * (90 + rnd(i + 1) * 180)) % W, y = rnd(i + 2) * H * 0.92, l = 10 + rnd(i + 3) * 40;
    cx.globalAlpha = 0.06 + rnd(i + 4) * 0.2;
    cx.beginPath();
    cx.moveTo(x, y);
    cx.lineTo(x - l, y + l * 0.05);
    cx.stroke();
  }
  cx.fillStyle = "#e8c39a";
  for (let j = 0; j < 70; j++) {
    const y = H * 0.88 - j * H * 0.008, x = W * 0.72 + Math.sin(t * 2.2 + j * 0.35) * (8 + j * 0.9);
    cx.globalAlpha = 0.35 * (1 - j / 70);
    cx.fillRect(x, y, 3, 3);
  }
  cx.globalAlpha = 1;
  cx.fillStyle = "#1c0e0a";
  cx.beginPath();
  cx.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) cx.lineTo(x, H * 0.88 - Math.sin(x * 0.005) * H * 0.03);
  cx.lineTo(W, H);
  cx.fill();
};

const ast: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 100 * d, 1, 0.9);
  const x0 = W / 2, y0 = H * 0.48, R = Math.min(W, H) * 0.3;
  cx.save();
  cx.translate(x0, y0);
  cx.rotate(t * 0.1);
  cx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const th = (i / 60) * 6.283, j = 1 + 0.07 * Math.sin(3 * th + 1) + 0.05 * Math.sin(5 * th);
    cx.lineTo(Math.cos(th) * R * 1.5 * j, Math.sin(th) * R * 0.55 * j);
  }
  cx.closePath();
  const g = cx.createRadialGradient(-R * 0.6, -R * 0.2, R * 0.1, 0, 0, R * 1.6);
  g.addColorStop(0, "#d9c3a5");
  g.addColorStop(1, "#3b3026");
  cx.fillStyle = g;
  cx.fill();
  cx.clip();
  cx.strokeStyle = "#00000055";
  cx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    cx.beginPath();
    cx.arc((rnd(i) - 0.5) * R * 2.2, (rnd(i + 3) - 0.5) * R * 0.7, 8 + rnd(i + 5) * 22, 0, 7);
    cx.stroke();
  }
  cx.restore();
  cx.strokeStyle = a;
  cx.globalAlpha = 0.3;
  cx.setLineDash([4, 6]);
  cx.beginPath();
  cx.ellipse(x0, y0, R * 2.1, R * 1.1, -0.2, 0, 7);
  cx.stroke();
  cx.setLineDash([]);
  cx.globalAlpha = 1;
  const an = t * 0.45;
  const px = x0 + Math.cos(an) * R * 2.1 * Math.cos(-0.2) - Math.sin(an) * R * 1.1 * Math.sin(-0.2);
  const py = y0 + Math.cos(an) * R * 2.1 * Math.sin(-0.2) + Math.sin(an) * R * 1.1 * Math.cos(-0.2);
  glow(cx, px, py, 18, a, 0.9);
  cx.fillStyle = "#fff";
  cx.fillRect(px - 2, py - 2, 4, 4);
  for (let i = 0; i < 14; i++) {
    const x = (rnd(i) * W + t * (6 + rnd(i + 2) * 14)) % W, y = rnd(i + 4) * H;
    cx.fillStyle = "#8a8174";
    cx.globalAlpha = 0.7;
    cx.fillRect(x, y, 2 + rnd(i) * 3, 2 + rnd(i) * 3);
  }
  cx.globalAlpha = 1;
};

const deep: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 70 * d, 3, 0.5);
  stars(cx, t, W, H, 60 * d, 8, 0.8, 200);
  glow(cx, W * 0.82, H * 0.2, 70, "#fff3d0", 0.5);
  const ox = W * 0.12, oy = H * 0.84;
  for (let k = 0; k < 5; k++) {
    const r = (t * 38 + k * 90) % 450;
    cx.strokeStyle = a;
    cx.globalAlpha = 0.4 * (1 - r / 450);
    cx.lineWidth = 1.5;
    cx.beginPath();
    cx.arc(ox, oy, r, -0.9, 0.2);
    cx.stroke();
  }
  cx.globalAlpha = 1;
  cx.strokeStyle = "#ece6d6";
  cx.fillStyle = "#3a4147";
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.arc(ox, oy, 12, -1.2, 0.8);
  cx.stroke();
  cx.fillRect(ox - 6, oy - 4, 9, 9);
};

const eagle: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 90 * d, 0, 0.8);
  // Descent view: lunar ground with scrolling craters
  const gy = H * 0.72;
  cx.fillStyle = "#161b22";
  cx.fillRect(0, gy, W, H - gy);
  // scrolling craters
  cx.strokeStyle = "#28303a";
  cx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const cx0 = (((rnd(i * 3) * W * 1.5 - t * 45) % (W * 1.5)) + W * 1.5) % (W * 1.5) - W * 0.25;
    const cy0 = gy + 20 + rnd(i * 5) * (H - gy - 40);
    const cr = 14 + rnd(i * 7) * 40;
    cx.fillStyle = "#0e1217";
    cx.beginPath();
    cx.ellipse(cx0, cy0, cr, cr * 0.45, 0, 0, 7);
    cx.fill();
    cx.stroke();
  }
  // Engine dust blowing outward from landing point
  const landX = W * 0.5, landY = H * 0.82;
  cx.fillStyle = "#cfd6db";
  for (let p = 0; p < 35; p++) {
    const ang = (rnd(p) - 0.5) * 1.8 + (rnd(p + 1) > 0.5 ? 0 : Math.PI);
    const dist = ((t * 80 + rnd(p + 2) * 160) % 180);
    const px = landX + Math.cos(ang) * dist;
    const py = landY + Math.sin(ang) * dist * 0.35;
    cx.globalAlpha = Math.max(0, 0.4 * (1 - dist / 180));
    cx.fillRect(px, py, 2.5, 2.5);
  }
  cx.globalAlpha = 1;
  // Lander silhouette settling down
  const settle = Math.sin(t * 0.8) * 8;
  const lx = W * 0.5, ly = H * 0.6 + settle;
  cx.fillStyle = a;
  cx.fillRect(lx - 16, ly - 10, 32, 20); // descent stage
  cx.fillStyle = "#ece6d6";
  cx.fillRect(lx - 10, ly - 22, 20, 12); // ascent stage
  cx.strokeStyle = a;
  cx.lineWidth = 2;
  cx.beginPath();
  cx.moveTo(lx - 16, ly + 10); cx.lineTo(lx - 28, ly + 28);
  cx.moveTo(lx + 16, ly + 10); cx.lineTo(lx + 28, ly + 28);
  cx.stroke();
  // faint descent plume
  glow(cx, lx, ly + 18, 30, "#e0a458", 0.4 + 0.2 * Math.sin(t * 12));
};

const lrv: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 100 * d, 1, 0.8);
  // Distant lunar mountains in slow parallax
  const mtn = (speed: number, baseY: number, amp: number, col: string) => {
    cx.fillStyle = col;
    cx.beginPath();
    cx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) {
      const off = (x + t * speed) * 0.004;
      cx.lineTo(x, baseY - Math.sin(off) * amp - Math.cos(off * 2.3) * (amp * 0.4));
    }
    cx.lineTo(W, H);
    cx.fill();
  };
  mtn(15, H * 0.65, 50, "#131b22");
  mtn(35, H * 0.74, 35, "#1a2530");
  // Near flat ground
  const gy = H * 0.82;
  cx.fillStyle = "#222f3d";
  cx.fillRect(0, gy, W, H - gy);
  // Receding tire tracks
  cx.strokeStyle = "#141c24";
  cx.lineWidth = 3;
  cx.beginPath();
  cx.moveTo(0, gy + 14); cx.lineTo(W, gy + 14);
  cx.moveTo(0, gy + 22); cx.lineTo(W, gy + 22);
  cx.stroke();
  // Moving rover silhouette
  const rx = W * 0.42, ry = gy - 16;
  cx.fillStyle = "#ece6d6";
  cx.fillRect(rx, ry + 4, 38, 8); // chassis
  cx.fillRect(rx + 8, ry - 6, 12, 10); // seats
  cx.strokeStyle = a;
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.arc(rx + 28, ry - 8, 8, -0.6, 0.6); // mesh dish
  cx.stroke();
  // Wheels
  cx.fillStyle = "#637482";
  cx.beginPath();
  cx.arc(rx + 6, ry + 16, 6, 0, 7);
  cx.arc(rx + 32, ry + 16, 6, 0, 7);
  cx.fill();
  // Rooster-tail dust arcs behind the wheels
  cx.fillStyle = "#b9c7d3";
  for (let k = 0; k < 20; k++) {
    const life = ((t * 40 + k * 18) % 70);
    const dx = rx + 2 - life * 1.2;
    const dy = ry + 16 - Math.sin((life / 70) * Math.PI) * 22;
    cx.globalAlpha = Math.max(0, 0.4 * (1 - life / 70));
    cx.fillRect(dx, dy, 2.5, 2.5);
  }
  cx.globalAlpha = 1;
};

const viking1: SceneFn = (cx, t, W, H, a, d) => {
  // Butterscotch Martian sky
  const sky = cx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#4a2414");
  sky.addColorStop(0.6, "#a85d32");
  sky.addColorStop(1, "#d98f55");
  cx.fillStyle = sky;
  cx.fillRect(0, 0, W, H);
  // Wind-blown dust sheets
  cx.fillStyle = "#e8b082";
  for (let i = 0; i < 28 * d; i++) {
    const x = ((rnd(i) * W * 1.4 + t * (60 + rnd(i + 1) * 90)) % (W * 1.4)) - W * 0.2;
    const y = rnd(i + 2) * H * 0.8;
    cx.globalAlpha = 0.08 + rnd(i + 3) * 0.12;
    cx.fillRect(x, y, 90 + rnd(i + 4) * 140, 2);
  }
  cx.globalAlpha = 1;
  // Parachute drifting down occasionally in background
  const pCycle = (t * 0.08) % 1;
  if (pCycle < 0.6) {
    const px = W * 0.75 - pCycle * 80;
    const py = H * 0.15 + pCycle * H * 0.45;
    cx.fillStyle = "#ece6d6";
    cx.beginPath();
    cx.arc(px, py, 14, Math.PI, 0);
    cx.fill();
    cx.strokeStyle = "#4a2414";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(px - 14, py); cx.lineTo(px, py + 16);
    cx.moveTo(px + 14, py); cx.lineTo(px, py + 16);
    cx.stroke();
  }
  // Low Chryse Planitia rocky horizon
  cx.fillStyle = "#2d140b";
  cx.beginPath();
  cx.moveTo(0, H);
  for (let x = 0; x <= W; x += 25) cx.lineTo(x, H * 0.82 - Math.sin(x * 0.008) * 12);
  cx.lineTo(W, H);
  cx.fill();
  // Silhouetted rocks
  for (let r = 0; r < 7; r++) {
    const rx = rnd(r * 4) * W;
    const rw = 12 + rnd(r) * 26;
    cx.fillStyle = "#1e0b06";
    cx.beginPath();
    cx.ellipse(rx, H * 0.83, rw, rw * 0.5, 0, Math.PI, 0);
    cx.fill();
  }
};

const ingenuity: SceneFn = (cx, t, W, H, a, d) => {
  // Clear salmon Martian sky
  const sky = cx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#26130c");
  sky.addColorStop(0.7, "#6e3b22");
  sky.addColorStop(1, "#9e5c38");
  cx.fillStyle = sky;
  cx.fillRect(0, 0, W, H);
  // Red planet ground
  const gy = H * 0.85;
  cx.fillStyle = "#33160c";
  cx.fillRect(0, gy, W, H - gy);
  // Helicopter hop cycle
  const hopPhase = Math.sin(t * 1.8);
  const alt = Math.max(0, 30 + hopPhase * 25);
  const hx = W * 0.5, hy = gy - 30 - alt;
  // Shadow on ground
  const sWidth = Math.max(10, 34 - alt * 0.3);
  cx.fillStyle = "#140703";
  cx.globalAlpha = Math.max(0.2, 0.6 - alt * 0.008);
  cx.beginPath();
  cx.ellipse(hx, gy + 4, sWidth, 5, 0, 0, 7);
  cx.fill();
  cx.globalAlpha = 1;
  // Dust fountain under the rotors when near ground
  if (alt < 45) {
    cx.fillStyle = "#d98f55";
    for (let k = 0; k < 20; k++) {
      const fang = (k / 20) * 6.28;
      const fdist = (t * 50 + k * 8) % 40;
      cx.globalAlpha = Math.max(0, 0.35 * (1 - fdist / 40));
      cx.fillRect(hx + Math.cos(fang) * fdist * 1.5, gy + Math.sin(fang) * 4, 3, 3);
    }
    cx.globalAlpha = 1;
  }
  // Helicopter body
  cx.fillStyle = "#e0a458";
  cx.fillRect(hx - 8, hy, 16, 14); // cube fuselage
  // Legs
  cx.strokeStyle = "#cfd6db";
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.moveTo(hx - 6, hy + 14); cx.lineTo(hx - 14, hy + 26);
  cx.moveTo(hx + 6, hy + 14); cx.lineTo(hx + 14, hy + 26);
  cx.stroke();
  // Rotor blur
  const spin = t * 45;
  cx.strokeStyle = "rgba(255,255,255,0.7)";
  cx.lineWidth = 2;
  cx.beginPath();
  cx.ellipse(hx, hy - 4, 30, 4, 0, 0, 7); // upper rotor blur
  cx.ellipse(hx, hy - 10, 30, 4, 0, 0, 7); // lower rotor blur
  cx.stroke();
};

const dawn: SceneFn = (cx, t, W, H, a, d) => {
  stars(cx, t, W, H, 120 * d, 1, 0.9);
  // Dwarf planet Ceres
  const cx0 = W * 0.58, cy0 = H * 0.5, R = Math.min(W, H) * 0.28;
  const g = cx.createRadialGradient(cx0 - R * 0.3, cy0 - R * 0.2, 0, cx0, cy0, R);
  g.addColorStop(0, "#69635b");
  g.addColorStop(0.7, "#3b3630");
  g.addColorStop(1, "#171512");
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(cx0, cy0, R, 0, 7);
  cx.fill();
  // Occator bright spots
  const spotX = cx0 - R * 0.15 + Math.sin(t * 0.05) * 8;
  const spotY = cy0 - R * 0.1;
  glow(cx, spotX, spotY, 14, "#ffffff", 0.9);
  cx.fillStyle = "#ffffff";
  cx.fillRect(spotX - 1.5, spotY - 1.5, 3, 3);
  cx.fillRect(spotX + 3, spotY + 1, 2, 2);
  // Dawn spacecraft orbiting with soft blue ion-engine glow
  const orbAngle = t * 0.35;
  const sx = cx0 + Math.cos(orbAngle) * (R * 1.5);
  const sy = cy0 + Math.sin(orbAngle) * (R * 0.7);
  // Ion engine blue glow
  glow(cx, sx, sy, 22, "#7fa3b0", 0.85);
  cx.fillStyle = "#ffffff";
  cx.fillRect(sx - 3, sy - 3, 6, 6); // core
  cx.fillStyle = a;
  cx.fillRect(sx - 12, sy - 1, 8, 2); // left wing
  cx.fillRect(sx + 4, sy - 1, 8, 2); // right wing
};

export const SCENES: Record<string, SceneFn> = {
  base,
  orb,
  moon,
  mars,
  ast,
  deep,
  explorer1: orb,
  surveyor3: moon,
  eagle,
  lrv,
  viking1,
  opportunity: mars,
  ingenuity,
  near: ast,
  dawn,
  pioneer10: deep,
};
