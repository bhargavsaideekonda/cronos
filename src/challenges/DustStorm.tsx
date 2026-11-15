"use client";
import { useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

const SUNLIGHT = [90, 75, 40, 15, 5, 5, 25, 70];

export default function DustStorm({ onWin, onLose }: ChallengeProps) {
  const [sol, setSol] = useState(0);
  const [battery, setBattery] = useState(30);
  const [science, setScience] = useState(0);
  const [over, setOver] = useState(false);

  const act = (action: "drive" | "study" | "sleep") => {
    audio.tick();
    const costs = { drive: 22, study: 10, sleep: 0 };
    const sciGain = { drive: 2, study: 1, sleep: 0 };

    const newSci = science + sciGain[action];
    const incomingPower = SUNLIGHT[sol] * 0.4;
    const newBat = Math.min(100, battery + incomingPower - 10 - costs[action]);

    if (newBat <= 0) {
      audio.thud();
      setOver(true);
      onLose(`The battery hit zero on sol ${sol + 1} during the storm peak. The rover went dark.`);
      return;
    }

    setScience(newSci);
    setBattery(newBat);

    if (sol + 1 >= 8) {
      audio.discovery();
      setOver(true);
      onWin(
        "You survived all eight sols by rationing energy and sleeping while the sky was dark. Opportunity's real 2018 storm lasted months, eventually overwhelming its panels.",
        "opp-solar"
      );
    } else {
      setSol((s) => s + 1);
    }
  };

  const reset = () => {
    setSol(0);
    setBattery(30);
    setScience(0);
    setOver(false);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }} className="mono">
        <span>Sol: <b>{Math.min(8, sol + 1)} of 8</b></span>
        <span>Science Collected: <b>{science} pts</b></span>
      </div>

      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 74, margin: "6px 0" }}>
        {SUNLIGHT.map((s, i) => (
          <div
            key={i}
            title={`Sol ${i + 1}: ${s}% sunlight`}
            style={{
              flex: 1,
              height: `${s * 0.7 + 4}px`,
              background: "var(--accent)",
              opacity: i === sol ? 1 : i < sol ? 0.25 : 0.55,
              borderRadius: 4,
            }}
          />
        ))}
      </div>
      <small className="dim">Forecast sunlight per sol. The bright tall bar is today.</small>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
          <span>Battery Charge</span>
          <span>{Math.round(battery)}%</span>
        </div>
        <div style={{ height: 14, border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", marginTop: 4 }}>
          <div
            style={{
              width: `${Math.max(0, Math.min(100, battery))}%`,
              height: "100%",
              background: battery < 20 ? "#e0764a" : "var(--accent)",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <button className="btn" disabled={over} onClick={() => act("drive")}>
          Drive (-22 pow, +2 sci)
        </button>
        <button className="btn" disabled={over} onClick={() => act("study")}>
          Study Rock (-10 pow, +1 sci)
        </button>
        <button className="btn solid" disabled={over} onClick={() => act("sleep")}>
          Sleep / Conserve (0 pow)
        </button>
      </div>

      {over && (
        <button className="btn" onClick={reset}>
          Retry Storm Survival
        </button>
      )}
    </div>
  );
}
