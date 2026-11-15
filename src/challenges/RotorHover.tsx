"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

export default function RotorHover({ onWin, onLose }: ChallengeProps) {
  const [rpm, setRpm] = useState(1200);
  const [alt, setAlt] = useState(0); // meters
  const [hoverTime, setHoverTime] = useState(0); // seconds in target zone
  const [over, setOver] = useState(false);
  const rpmRef = useRef(1200);
  rpmRef.current = rpm;

  useEffect(() => {
    let currAlt = 0;
    let currHover = 0;
    let active = true;

    const id = setInterval(() => {
      if (!active) return;
      // Mars 1% atmosphere lift curve: lift matches gravity at ~2400 RPM
      const lift = Math.pow(rpmRef.current / 2400, 2) * 3.7;
      const vertAcc = lift - 3.7; // Mars gravity 3.7 m/s^2
      currAlt = Math.max(0, Math.min(6, currAlt + vertAcc * 0.08));
      setAlt(+currAlt.toFixed(2));

      // Target hover band: 2.7 to 3.3 m
      if (currAlt >= 2.7 && currAlt <= 3.3) {
        currHover += 0.2;
        setHoverTime(+currHover.toFixed(1));
        if (currHover >= 5) {
          active = false;
          setOver(true);
          audio.discovery();
          onWin("Hover confirmed! Ingenuity held a steady 3-meter altitude in Mars' razor-thin atmosphere.", "ing-flight1");
          return;
        }
      } else {
        currHover = Math.max(0, currHover - 0.1);
        setHoverTime(+currHover.toFixed(1));
      }

      if (currAlt >= 5.5) {
        active = false;
        setOver(true);
        audio.thud();
        onLose("Altitude exceeded! Lower rotor RPM to stabilize around 3.0 meters.");
      }
    }, 200);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [onWin, onLose]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono">
          <span>Altitude: <b>{alt} m</b> (Target: 3.0 m)</span>
          <span>Rotor Speed: <b>{rpm} RPM</b></span>
        </div>
        <div style={{ marginTop: 8, height: 16, background: "#1c1410", borderRadius: 8, position: "relative", overflow: "hidden" }}>
          {/* Target green zone 2.7 to 3.3 m of 6 m total */}
          <div style={{ position: "absolute", left: `${(2.7 / 6) * 100}%`, width: `${(0.6 / 6) * 100}%`, height: "100%", background: "rgba(95,168,160,0.3)" }} />
          <div style={{ position: "absolute", left: `${(alt / 6) * 100}%`, width: 8, height: "100%", background: "var(--accent)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }} className="mono dim">
          <span>0 m</span>
          <span>Target Window: 3.0 m</span>
          <span>6 m</span>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono dim">
          <span>Rotor Throttle</span>
          <span>Stable hover is around ~2,400 RPM</span>
        </div>
        <input
          type="range"
          min="1000"
          max="2800"
          step="50"
          value={rpm}
          onChange={(e) => {
            setRpm(+e.target.value);
            audio.tick();
          }}
          style={{ width: "100%", accentColor: "var(--accent)" }}
          disabled={over}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="mono dim">
        <span>Hover Stability Time: <b>{hoverTime}s / 5.0s</b></span>
      </div>

      {over && (
        <button
          className="btn"
          onClick={() => {
            setRpm(1200);
            setAlt(0);
            setHoverTime(0);
            setOver(false);
          }}
        >
          Try Hover Again
        </button>
      )}
    </div>
  );
}
