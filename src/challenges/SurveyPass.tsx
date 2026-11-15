"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

export default function SurveyPass({ onWin, onLose }: ChallengeProps) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [imaged, setImaged] = useState<boolean[]>([false, false, false]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [over, setOver] = useState(false);
  const imagedRef = useRef([false, false, false]);
  imagedRef.current = imaged;

  const targets = [
    [-0.65, 0.05],
    [0.2, -0.4],
    [0.55, 0.3],
  ];

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let active = true;
    let t0 = performance.now();
    let raf = 0;

    const getPos = (i: number, t: number) => {
      const a = t * 0.5;
      const tx = targets[i][0] * 190;
      const ty = targets[i][1] * 70;
      return [280 + tx * Math.cos(a) - ty * Math.sin(a), 160 + tx * Math.sin(a) + ty * Math.cos(a)];
    };

    const handleClick = (e: MouseEvent) => {
      if (!active) return;
      const rect = c.getBoundingClientRect();
      const px = ((e.clientX - rect.left) * 560) / rect.width;
      const py = ((e.clientY - rect.top) * 320) / rect.height;
      const t = (performance.now() - t0) / 1000;

      const updated = [...imagedRef.current];
      targets.forEach((_, i) => {
        const [tx, ty] = getPos(i, t);
        if (!updated[i] && Math.hypot(px - tx, py - ty) < 32) {
          updated[i] = true;
          audio.tick();
        }
      });
      setImaged(updated);

      if (updated.every(Boolean)) {
        active = false;
        setOver(true);
        audio.discovery();
        onWin("All three geological regions imaged during the pass! NEAR mapped asteroid 433 Eros before landing.", "nr-images");
      }
    };
    c.addEventListener("click", handleClick);

    const step = (now: number) => {
      if (!active) return;
      const t = (now - t0) / 1000;
      const remaining = Math.max(0, 30 - t);
      setTimeLeft(Math.round(remaining));

      ctx.clearRect(0, 0, 560, 320);

      // Rotating asteroid Eros silhouette
      ctx.save();
      ctx.translate(280, 160);
      ctx.rotate(t * 0.5);
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const th = (i / 60) * 6.283;
        const j = 1 + 0.07 * Math.sin(3 * th + 1);
        ctx.lineTo(Math.cos(th) * 190 * j, Math.sin(th) * 70 * j);
      }
      ctx.fillStyle = "#8a7a62";
      ctx.fill();
      ctx.restore();

      // Glowing targets
      targets.forEach((_, i) => {
        const [tx, ty] = getPos(i, t);
        ctx.strokeStyle = imagedRef.current[i] ? "#5fa8a0" : "#e0a458";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(tx, ty, imagedRef.current[i] ? 12 : 16 + Math.sin(t * 6) * 3, 0, 7);
        ctx.stroke();
      });

      if (remaining <= 0) {
        active = false;
        setOver(true);
        audio.thud();
        onLose("Pass expired! Eros kept spinning before all three sites were imaged.");
        return;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      c.removeEventListener("click", handleClick);
    };
  }, [onWin, onLose]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <canvas ref={cv} width={560} height={320} className="cv" role="img" aria-label="Asteroid Eros spinning with target craters." />
      <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
        <span>Sites Imaged: <b>{imaged.filter(Boolean).length} of 3</b></span>
        <span>Flyby Time Left: <b>{timeLeft}s</b></span>
      </div>
      {over && (
        <button
          className="btn"
          onClick={() => {
            setImaged([false, false, false]);
            setTimeLeft(30);
            setOver(false);
          }}
        >
          Retry Survey Pass
        </button>
      )}
    </div>
  );
}
