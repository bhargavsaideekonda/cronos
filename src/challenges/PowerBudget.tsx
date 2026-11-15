"use client";
import { useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

const STAGES = [
  { name: "1973: Jupiter flyby", power: 100 },
  { name: "1983: Past Neptune's orbit", power: 80 },
  { name: "1997: Routine contact ends", power: 60 },
  { name: "2002: Last telemetry", power: 45 },
  { name: "2003: Last signal", power: 28 },
];

const SYSTEMS = [
  { name: "Transmitter", watts: 20, lock: true },
  { name: "Photopolarimeter (Imager)", watts: 35, lock: false },
  { name: "Charged Particle Detector", watts: 25, lock: false },
  { name: "Helium Vector Magnetometer", watts: 20, lock: false },
];

export default function PowerBudget({ onWin, onLose }: ChallengeProps) {
  const [stage, setStage] = useState(0);
  const [on, setOn] = useState([true, true, true, true]);

  const currStage = STAGES[stage];
  const totalWatts = SYSTEMS.reduce((sum, s, i) => sum + (on[i] ? s.watts : 0), 0);
  const ok = totalWatts <= currStage.power;

  const toggle = (i: number) => {
    if (SYSTEMS[i].lock) {
      say("The transmitter must remain powered to reach Earth.");
      return;
    }
    audio.tick();
    setOn((prev) => {
      const copy = [...prev];
      copy[i] = !copy[i];
      return copy;
    });
  };

  const advanceYear = () => {
    if (!ok) {
      audio.thud();
      say("Power overload! Turn off more instruments to fit the available RTG wattage.");
      return;
    }
    audio.tick();
    if (stage === STAGES.length - 1) {
      audio.discovery();
      onWin(
        "Final signal beamed from 12 billion km! Only the transmitter could be powered with the remaining RTG output.",
        "p10-last-signal"
      );
    } else {
      setStage((s) => s + 1);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono">
          <span><b>{currStage.name}</b></span>
          <span>RTG Output: <b>{currStage.power} W</b></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }} className="mono dim">
          <span>Current Draw: <b style={{ color: ok ? "var(--ink)" : "#e0764a" }}>{totalWatts} W</b></span>
          <span style={{ color: ok ? "#5fa8a0" : "#e0764a" }}>{ok ? "Within budget" : "OVER BUDGET"}</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {SYSTEMS.map((sys, i) => (
          <button
            key={sys.name}
            className={"btn " + (on[i] ? "solid" : "ghost")}
            style={{ display: "flex", justifyContent: "space-between", textAlign: "left", padding: "0.6rem 1rem" }}
            onClick={() => toggle(i)}
          >
            <span>
              {sys.name} {sys.lock ? "· (Mission Critical)" : ""}
            </span>
            <span className="mono dim">
              {sys.watts} W · {on[i] ? "ONLINE" : "STANDBY"}
            </span>
          </button>
        ))}
      </div>

      <button className="btn solid" disabled={!ok} onClick={advanceYear}>
        {stage === STAGES.length - 1 ? "Send Final Signal (2003)" : "Advance to Next Decade"}
      </button>
    </div>
  );
}
