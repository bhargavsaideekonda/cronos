"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

export default function RadiationBelts({ onWin, onLose }: ChallengeProps) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [val, setVal] = useState(0);
  const [logs, setLogs] = useState<[number, number][]>([]);

  const rp = 90, e = 0.14, ox = 250, oy = 150;
  const rr = (th: number) => (rp * (1 + e)) / (1 + e * Math.cos(th));
  const getAlt = (th: number) => (rr(th) * 6736) / 90 - 6371;
  const getCnt = (alt: number) => (alt < 900 ? 30 : alt < 2000 ? 30 + ((alt - 900) / 1100) * 170 : 0);

  const th = (val / 100) * Math.PI;
  const alt = Math.round(getAlt(th));
  const cnt = Math.round(getCnt(alt));

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const x = c.getContext("2d");
    if (!x) return;

    x.clearRect(0, 0, 560, 230);
    // Earth globe
    x.fillStyle = "#2f6fae";
    x.beginPath();
    x.arc(ox, oy, 85, 0, 7);
    x.fill();

    // Radiation belts
    x.lineWidth = 14;
    x.strokeStyle = "rgba(224,164,88,.28)";
    x.beginPath();
    x.arc(ox, oy, 104, Math.PI, 0);
    x.stroke();

    x.lineWidth = 10;
    x.strokeStyle = "rgba(201,99,58,.25)";
    x.beginPath();
    x.arc(ox, oy, 119, Math.PI, 0);
    x.stroke();

    // Orbit ellipse
    x.strokeStyle = "rgba(255,255,255,.25)";
    x.lineWidth = 1;
    x.beginPath();
    x.ellipse(ox - ((rp * (1 + e)) / (1 - e * e)) * e, oy, (rp * (1 + e)) / (1 - e * e), (rp * (1 + e)) / Math.sqrt(1 - e * e), 0, 0, 7);
    x.stroke();

    // Satellite point
    const r = rr(th);
    const px = ox + r * Math.cos(th);
    const py = oy - r * Math.sin(th);
    x.fillStyle = "#fff";
    x.fillRect(px - 4, py - 4, 8, 8);

    // Labels
    x.fillStyle = "#ece6d6";
    x.font = "12px sans-serif";
    x.fillText("gold band: strong radiation", 340, 40);
    x.fillText("red band: counter overloaded", 340, 58);
  }, [th]);

  const handleSlide = (newVal: number) => {
    setVal(newVal);
    const currTh = (newVal / 100) * Math.PI;
    const currAlt = getAlt(currTh);
    const currCnt = getCnt(currAlt);
    if (currCnt === 0 && currAlt > 2000) {
      audio.discovery();
      say("Zero?! The counter isn't broken. It's overwhelmed by intense trapped radiation.");
    } else {
      audio.tick();
    }
  };

  const logReading = () => {
    audio.tick();
    const updated = [...logs, [alt, cnt] as [number, number]];
    setLogs(updated);

    if (updated.length >= 3) {
      const hasHigh = updated.some((l) => l[1] >= 100);
      const hasZero = updated.some((l) => l[1] === 0);
      if (hasHigh && hasZero) {
        onWin(
          "Counts climbed, then dropped to zero near the top. The counter was overwhelmed by trapped radiation—the discovery of the Van Allen belts.",
          "e1-zero"
        );
      } else {
        onLose("Not enough variety in your data points. Make sure to log a low altitude, mid altitude, and high altitude reading.");
      }
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <canvas ref={cv} width={560} height={230} className="cv" role="img" aria-label="Explorer 1 orbital trajectory and Geiger counter radiation zones." />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
          <span>Altitude: {alt} km</span>
          <span>Geiger Counter: <b style={{ color: cnt === 0 && alt > 2000 ? "#e0a458" : "inherit" }}>{cnt}</b> counts/sec</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={val}
          onChange={(e) => handleSlide(+e.target.value)}
          aria-label="Orbit position slider"
          style={{ width: "100%", accentColor: "var(--accent)" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button className="btn" onClick={logReading} disabled={logs.length >= 3}>
          Log reading ({logs.length}/3)
        </button>
        {logs.length >= 3 && (
          <button className="btn ghost" onClick={() => setLogs([])}>
            Reset logs
          </button>
        )}
      </div>
      {logs.length > 0 && (
        <div className="panel" style={{ fontSize: "0.85rem" }}>
          <b>Recorded data points:</b>
          {logs.map((l, i) => (
            <div key={i} className="mono dim">
              Reading {i + 1}: {l[0]} km altitude · {l[1]} counts/sec
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
