"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

export default function EarthPointing({ onWin, onLose }: ChallengeProps) {
  const [angle, setAngle] = useState(42); // degrees off Earth line
  const [angularRate, setAngularRate] = useState(1.8); // deg/s drift
  const [pulses, setPulses] = useState(8); // hydrazine fuel pulses left
  const [lockedTime, setLockedTime] = useState(0);
  const [over, setOver] = useState(false);

  const angleRef = useRef(42);
  const rateRef = useRef(1.8);
  angleRef.current = angle;
  rateRef.current = angularRate;

  useEffect(() => {
    let currLock = 0;
    let active = true;

    const id = setInterval(() => {
      if (!active) return;
      const nextAngle = angleRef.current + rateRef.current * 0.1;
      angleRef.current = nextAngle;
      setAngle(+nextAngle.toFixed(1));

      // Target cone: -4.0 to +4.0 degrees
      if (Math.abs(nextAngle) <= 4.0 && Math.abs(rateRef.current) <= 0.8) {
        currLock += 0.1;
        setLockedTime(+currLock.toFixed(1));
        if (currLock >= 2.5) {
          active = false;
          setOver(true);
          audio.discovery();
          onWin("Signal locked! Deep Space Network beacon established with Dawn's high-gain dish.", "dw-hydrazine");
          return;
        }
      } else {
        currLock = Math.max(0, currLock - 0.05);
        setLockedTime(+currLock.toFixed(1));
      }
    }, 100);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [onWin, onLose]);

  const pulse = (dir: -1 | 1) => {
    if (pulses <= 0) {
      say("Hydrazine tank empty! No thruster pressure remaining.");
      return;
    }
    audio.tick();
    const newPulses = pulses - 1;
    setPulses(newPulses);
    const newRate = rateRef.current + dir * 1.5;
    rateRef.current = newRate;
    setAngularRate(+newRate.toFixed(1));

    if (newPulses === 0 && Math.abs(angleRef.current) > 4.0) {
      setTimeout(() => {
        if (Math.abs(angleRef.current) > 4.0) {
          setOver(true);
          audio.thud();
          onLose("Hydrazine depleted while antenna was unaligned with Earth.");
        }
      }, 1500);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono">
          <span>Antenna Misalignment: <b style={{ color: Math.abs(angle) <= 4 ? "#5fa8a0" : "inherit" }}>{angle}°</b></span>
          <span>Hydrazine Pulses: <b>{pulses} remaining</b></span>
        </div>
        <div style={{ marginTop: 8, height: 16, background: "#1c1410", borderRadius: 8, position: "relative" }}>
          {/* Earth target cone centered at 50% (-4 to +4 deg of -60 to +60 scale) */}
          <div style={{ position: "absolute", left: `${(56 / 120) * 100}%`, width: `${(8 / 120) * 100}%`, height: "100%", background: "rgba(95,168,160,0.35)" }} />
          <div
            style={{
              position: "absolute",
              left: `${Math.max(0, Math.min(100, ((angle + 60) / 120) * 100))}%`,
              width: 8,
              height: "100%",
              background: "var(--accent)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }} className="mono dim">
          <span>-60°</span>
          <span>Earth Lock Cone (0°)</span>
          <span>+60°</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="btn" disabled={pulses <= 0 || over} onClick={() => pulse(-1)}>
          ◀ Fire Thruster Left
        </button>
        <button className="btn" disabled={pulses <= 0 || over} onClick={() => pulse(1)}>
          Fire Thruster Right ▶
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
        <span>Drift Rate: {angularRate}°/s</span>
        <span>Beacon Lock Duration: <b>{lockedTime}s / 2.5s</b></span>
      </div>

      {over && (
        <button
          className="btn"
          onClick={() => {
            setAngle(42);
            setAngularRate(1.8);
            setPulses(8);
            setLockedTime(0);
            setOver(false);
          }}
        >
          Reset Orientation
        </button>
      )}
    </div>
  );
}
