"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

export default function BoulderField({ onWin, onLose }: ChallengeProps) {
  const cv = useRef<HTMLCanvasElement>(null);
  const posX = useRef(200);
  const [fuel, setFuel] = useState(100);
  const [alt, setAlt] = useState(100);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let currentAlt = 100;
    let currentFuel = 100;
    let active = true;

    // Boulder hazards (x intervals)
    const safeZone = { min: 340, max: 480 };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "KeyA") {
        posX.current = Math.max(40, posX.current - 18);
        audio.tick();
      } else if (e.key === "ArrowRight" || e.key === "KeyD") {
        posX.current = Math.min(520, posX.current + 18);
        audio.tick();
      }
    };
    window.addEventListener("keydown", handleKey);

    const step = () => {
      if (!active) return;
      currentAlt = Math.max(0, currentAlt - 0.28);
      currentFuel = Math.max(0, currentFuel - 0.22);
      setAlt(Math.round(currentAlt));
      setFuel(Math.round(currentFuel));

      ctx.clearRect(0, 0, 560, 320);

      // Lunar surface
      ctx.fillStyle = "#161c24";
      ctx.fillRect(0, 260, 560, 60);

      // Crater with boulders (hazardous zone 100 to 320)
      ctx.fillStyle = "#0c1017";
      ctx.beginPath();
      ctx.ellipse(210, 280, 110, 25, 0, 0, 7);
      ctx.fill();

      // Boulders
      ctx.fillStyle = "#7b8a99";
      const boulders = [130, 160, 195, 230, 270, 300];
      boulders.forEach((bx) => {
        ctx.beginPath();
        ctx.arc(bx, 270, 10, 0, 7);
        ctx.fill();
      });

      // Safe landing zone (340 to 480)
      ctx.strokeStyle = "#5fa8a0";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(safeZone.min, 262, safeZone.max - safeZone.min, 30);
      ctx.setLineDash([]);
      ctx.fillStyle = "#5fa8a0";
      ctx.font = "11px sans-serif";
      ctx.fillText("CLEAR LANDING SITE", safeZone.min + 12, 280);

      // Eagle lander
      const landerY = 40 + ((100 - currentAlt) / 100) * 200;
      const lx = posX.current;
      ctx.fillStyle = "#e0a458";
      ctx.fillRect(lx - 14, landerY, 28, 16);
      ctx.fillStyle = "#ece6d6";
      ctx.fillRect(lx - 10, landerY - 10, 20, 10);
      ctx.strokeStyle = "#cfd6db";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - 14, landerY + 16); ctx.lineTo(lx - 22, landerY + 26);
      ctx.moveTo(lx + 14, landerY + 16); ctx.lineTo(lx + 22, landerY + 26);
      ctx.stroke();

      // Exhaust flame
      ctx.fillStyle = "#e0a458";
      ctx.beginPath();
      ctx.moveTo(lx - 6, landerY + 16);
      ctx.lineTo(lx, landerY + 28 + Math.random() * 8);
      ctx.lineTo(lx + 6, landerY + 16);
      ctx.fill();

      if (currentAlt <= 0 || currentFuel <= 0) {
        active = false;
        setOver(true);
        if (lx >= safeZone.min && lx <= safeZone.max) {
          audio.discovery();
          onWin("Tranquility Base: the Eagle has landed. You manually guided the lander past the boulder field.", "ea-boulders");
        } else {
          audio.thud();
          onLose("Touchdown in the boulder field! Steer right toward the clear designated landing area.");
        }
        return;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKey);
    };
  }, [over, onWin, onLose]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <canvas ref={cv} width={560} height={320} className="cv" role="img" aria-label="Eagle lander descending over lunar boulders and safe landing zone." />
      <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
        <span>Altitude: {alt} m</span>
        <span>Fuel remaining: {fuel}%</span>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="btn" onClick={() => { posX.current = Math.max(40, posX.current - 35); audio.tick(); }}>
          ← Steer Left
        </button>
        <button className="btn" onClick={() => { posX.current = Math.min(520, posX.current + 35); audio.tick(); }}>
          Steer Right →
        </button>
      </div>
      {over && (
        <button className="btn" onClick={() => { setOver(false); posX.current = 200; }}>
          Try descent again
        </button>
      )}
    </div>
  );
}
