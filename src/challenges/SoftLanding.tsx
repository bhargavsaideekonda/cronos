"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

/**
 * Surveyor 3: hold the engine, land under 3 m/s. Near the ground the radar readout glitches.
 * SIMPLIFIED MODEL: the numbers are game values, not Surveyor's real descent profile.
 */
const G = 1.62, THRUST = 4, H0 = 120, BURN = 9;

export default function SoftLanding({ onWin, onLose }: ChallengeProps) {
  const cv = useRef<HTMLCanvasElement>(null);
  const fire = useRef(false);
  const [run, setRun] = useState(0);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const c = cv.current!;
    const x = c.getContext("2d")!;
    let y = 0, v = 0, fuel = 80, on = true, t0 = performance.now(), glitchAt = 0, raf = 0;
    fire.current = false;
    const kd = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); fire.current = true; } };
    const ku = (e: KeyboardEvent) => { if (e.code === "Space") fire.current = false; };
    addEventListener("keydown", kd);
    addEventListener("keyup", ku);
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#ece6d6", acc = css.getPropertyValue("--accent").trim() || "#e0a458";

    const step = (now: number) => {
      if (!on) return;
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      const th = fire.current && fuel > 0 ? THRUST : 0;
      if (th) fuel = Math.max(0, fuel - BURN * dt);
      audio.engine(!!th);
      v += (G - th) * dt;
      y += v * dt;
      const alt = Math.max(0, H0 - y);
      if (alt < 14 && !glitchAt) {
        glitchAt = now;
        audio.static(0.8);
        say("Reflective rocks are confusing the radar! Trust your speed, not the height.", "alert");
      }
      const glitch = glitchAt && now - glitchAt < 1500;
      c.dataset.alt = alt.toFixed(1);
      c.dataset.v = v.toFixed(2);
      c.dataset.fuel = fuel.toFixed(0);

      x.clearRect(0, 0, 560, 330);
      x.fillStyle = "#2d3b40";
      x.beginPath();
      x.moveTo(0, 330);
      for (let i = 0; i <= 560; i += 20) x.lineTo(i, 302 - Math.sin(i * 0.03) * 4);
      x.lineTo(560, 330);
      x.fill();
      const py = 20 + (Math.min(y, H0) / H0) * 262;
      // dust kicked up near the surface
      if (th && alt < 25) {
        x.fillStyle = "#cfd6db";
        for (let i = 0; i < 14; i++) { x.globalAlpha = 0.3; x.fillRect(280 + (Math.random() - 0.5) * (180 - alt * 5), 296 - Math.random() * 12, 3, 3); }
        x.globalAlpha = 1;
      }
      x.fillStyle = ink;
      x.fillRect(266, py, 28, 16);
      x.fillRect(278, py - 14, 4, 14);
      x.fillRect(262, py - 18, 36, 5);
      x.strokeStyle = ink;
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(266, py + 14); x.lineTo(254, py + 30); x.moveTo(294, py + 14); x.lineTo(306, py + 30);
      x.stroke();
      x.fillRect(248, py + 30, 12, 3);
      x.fillRect(300, py + 30, 12, 3);
      if (th) {
        x.fillStyle = acc;
        x.beginPath();
        x.moveTo(272, py + 16); x.lineTo(280, py + 34 + Math.random() * 12); x.lineTo(288, py + 16);
        x.fill();
      }
      x.fillStyle = ink;
      x.font = "14px sans-serif";
      x.fillText("Height " + (glitch ? (Math.random() < 0.5 ? "--- " : (Math.random() * 99).toFixed(0)) : alt.toFixed(0)) + " m", 14, 24);
      x.fillStyle = v > 6 ? "#e0764a" : v > 3 ? "#e0a458" : "#6d8";
      x.fillText("Speed " + v.toFixed(1) + " m/s", 14, 44);
      x.fillStyle = ink;
      x.fillText("Fuel", 14, 64);
      x.strokeStyle = ink;
      x.lineWidth = 1;
      x.strokeRect(50, 52, 100, 12);
      x.fillRect(50, 52, fuel * 1.25, 12);

      if (alt <= 0) {
        on = false;
        audio.engine(false);
        audio.thud();
        setOver(true);
        if (v <= 3) onWin("Soft touchdown, under 3 m/s.", "s3-bounce");
        else if (v <= 6) onWin("A bounce, then it settled. Landing accepted.", "s3-bounce");
        else onLose(`Too fast: ${v.toFixed(1)} m/s. Fire a little earlier and hold the burn.`);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      audio.engine(false);
      removeEventListener("keydown", kd);
      removeEventListener("keyup", ku);
    };
  }, [run, onWin, onLose]);

  return (
    <>
      <canvas ref={cv} width={560} height={330} className="cv" data-testid="lander" role="img" aria-label="Lander descending toward the surface. Height, speed and fuel are shown at the top left." />
      {over ? (
        <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={() => { setOver(false); setRun((r) => r + 1); }}>
          Fly it again
        </button>
      ) : (
        <button
          className="btn"
          style={{ width: "100%", marginTop: 10, padding: "1.1rem", touchAction: "none" }}
          onPointerDown={() => (fire.current = true)}
          onPointerUp={() => (fire.current = false)}
          onPointerLeave={() => (fire.current = false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          Hold to fire the engine (or hold Space)
        </button>
      )}
    </>
  );
}
