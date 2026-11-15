"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { say } from "@/state/store";
import type { ChallengeProps } from "./index";

export default function EntrySequence({ onWin, onLose }: ChallengeProps) {
  const [alt, setAlt] = useState(12); // km
  const [speed, setSpeed] = useState(1600); // km/h
  const [chute, setChute] = useState(false);
  const [shield, setShield] = useState(false);
  const [engines, setEngines] = useState(false);
  const [over, setOver] = useState(false);
  const running = useRef(true);

  useEffect(() => {
    running.current = true;
    let currAlt = 12;
    let currSpeed = 1600;

    const id = setInterval(() => {
      if (!running.current) return;
      currAlt -= 0.15;
      if (chute) currSpeed = Math.max(200, currSpeed - 30);
      if (engines) currSpeed = Math.max(10, currSpeed - 40);

      setAlt(+currAlt.toFixed(2));
      setSpeed(Math.round(currSpeed));

      if (currAlt <= 0) {
        running.current = false;
        clearInterval(id);
        setOver(true);

        if (chute && shield && engines && currSpeed < 50) {
          audio.discovery();
          onWin("Touchdown on Chryse Planitia! All entry sequence milestones triggered within their target flight windows.", "vk-entry");
        } else {
          audio.thud();
          onLose("Entry sequence failed: you did not execute all milestones in their designated altitude windows.");
        }
      }
    }, 150);

    return () => {
      running.current = false;
      clearInterval(id);
    };
  }, [chute, shield, engines, over, onWin, onLose]);

  const deployChute = () => {
    audio.tick();
    if (alt >= 5 && alt <= 8) {
      setChute(true);
      say("Parachute deployed successfully! Supersonic deceleration confirmed.");
    } else {
      audio.thud();
      running.current = false;
      onLose(`Parachute deployed at ${alt} km outside the safe 5.0–8.0 km aero window!`);
    }
  };

  const dropShield = () => {
    audio.tick();
    if (!chute) {
      say("Deploy the parachute before jettisoning the heat shield!");
      return;
    }
    if (alt >= 3 && alt <= 5.5) {
      setShield(true);
      say("Aeroshell heat shield released.");
    } else {
      audio.thud();
      running.current = false;
      onLose(`Heat shield dropped at ${alt} km outside the 3.0–5.5 km window!`);
    }
  };

  const fireEngines = () => {
    audio.tick();
    if (!shield) {
      say("Jettison the heat shield before igniting terminal descent engines!");
      return;
    }
    if (alt >= 0.8 && alt <= 2.5) {
      setEngines(true);
      say("Terminal descent thrusters firing!");
    } else {
      audio.thud();
      running.current = false;
      onLose(`Descent engines ignited at ${alt} km outside the 0.8–2.5 km window!`);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between" }} className="mono">
          <span>Altitude: <b>{alt > 0 ? alt : 0} km</b></span>
          <span>Descent Velocity: <b>{speed} km/h</b></span>
        </div>
        <div style={{ marginTop: 8, height: 12, background: "#1c1410", borderRadius: 6, position: "relative" }}>
          <div style={{ position: "absolute", left: `${(alt / 12) * 100}%`, width: 6, height: 12, background: "var(--accent)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <button className={"btn " + (chute ? "solid" : "")} disabled={chute || over} onClick={deployChute}>
          1. Deploy Parachute (Target: 8.0 - 5.0 km) {chute ? "✓" : ""}
        </button>
        <button className={"btn " + (shield ? "solid" : "")} disabled={!chute || shield || over} onClick={dropShield}>
          2. Jettison Heat Shield (Target: 5.5 - 3.0 km) {shield ? "✓" : ""}
        </button>
        <button className={"btn " + (engines ? "solid" : "")} disabled={!shield || engines || over} onClick={fireEngines}>
          3. Ignite Terminal Engines (Target: 2.5 - 0.8 km) {engines ? "✓" : ""}
        </button>
      </div>

      {over && (
        <button
          className="btn"
          onClick={() => {
            setAlt(12);
            setSpeed(1600);
            setChute(false);
            setShield(false);
            setEngines(false);
            setOver(false);
          }}
        >
          Retry Entry Sequence
        </button>
      )}
    </div>
  );
}
