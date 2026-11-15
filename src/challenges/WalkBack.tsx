"use client";
import { useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

interface Station {
  id: number;
  name: string;
  dist: number; // km from LM
  science: number;
  walkMinutes: number; // minutes needed to walk back at 4 km/h = 15 min per km
}

const STATIONS: Station[] = [
  { id: 1, name: "Station 1: Elbow Crater", dist: 3.2, science: 35, walkMinutes: 48 },
  { id: 2, name: "Station 2: St. George Crater", dist: 4.8, science: 50, walkMinutes: 72 },
  { id: 3, name: "Station 3: Hadley Rille Brink", dist: 7.5, science: 85, walkMinutes: 112 },
  { id: 4, name: "Station 4: Deep North Complex", dist: 9.8, science: 120, walkMinutes: 147 },
];

export default function WalkBack({ onWin, onLose }: ChallengeProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const totalOxygenMinutes = 180; // 3 hours of PLSS oxygen reserve

  const maxDist = selected.length > 0 ? Math.max(...selected.map((id) => STATIONS.find((s) => s.id === id)!.dist)) : 0;
  const maxWalkBackMinutes = maxDist * 15; // 15 mins per km walking
  const driveTimeMinutes = selected.reduce((acc, id) => acc + STATIONS.find((s) => s.id === id)!.dist * 4, 0); // 15 km/h driving
  const totalScience = selected.reduce((acc, id) => acc + STATIONS.find((s) => s.id === id)!.science, 0);
  const remainingOxygenMinutes = totalOxygenMinutes - maxWalkBackMinutes - driveTimeMinutes;

  const toggle = (id: number) => {
    audio.tick();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const evaluateTraverse = () => {
    if (selected.length === 0) {
      say("Select at least one geological station for your traverse.");
      return;
    }
    if (remainingOxygenMinutes < 0) {
      audio.thud();
      onLose(
        `Walk-back limit exceeded! If the rover broke down at ${maxDist.toFixed(1)} km, walking back would take ${Math.round(
          maxWalkBackMinutes
        )} min, which exceeds your PLSS oxygen reserve.`
      );
    } else if (totalScience >= 85) {
      audio.discovery();
      onWin(
        `Traverse approved with ${totalScience} science points! Max distance remained within the safe walk-back radius of the Lunar Module.`,
        "lrv-walkback"
      );
    } else {
      say("Safe, but more science is needed. Select more stations within safe walking distance.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panel" style={{ fontSize: "0.9rem" }}>
        <p style={{ margin: "0 0 6px" }}>
          <b>Walk-Back Safety Rule:</b> At any moment, the crew must have enough oxygen to walk back to the Lunar Module on foot at 4 km/h (15 min/km).
        </p>
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
          <span>Max distance from LM: {maxDist.toFixed(1)} km</span>
          <span>Walk-back time required: {Math.round(maxWalkBackMinutes)} min</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }} className="mono dim">
          <span>Total science: {totalScience} pts</span>
          <span style={{ color: remainingOxygenMinutes < 0 ? "#e0764a" : "#5fa8a0" }}>
            Oxygen safety margin: {Math.round(remainingOxygenMinutes)} min
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {STATIONS.map((st) => {
          const on = selected.includes(st.id);
          return (
            <button
              key={st.id}
              className={"btn " + (on ? "solid" : "")}
              style={{ display: "flex", justifyContent: "space-between", textAlign: "left", padding: "0.6rem 1rem" }}
              onClick={() => toggle(st.id)}
            >
              <span>{st.name} ({st.dist} km)</span>
              <span className="mono dim">+{st.science} pts · {st.walkMinutes}m walk</span>
            </button>
          );
        })}
      </div>

      <button className="btn solid" onClick={evaluateTraverse} style={{ marginTop: 6 }}>
        Execute Traverse Plan
      </button>
    </div>
  );
}
