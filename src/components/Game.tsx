"use client";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { mission, type ThemeId } from "@/data";
import { useStore, type Screen } from "@/state/store";
import Companion from "./Companion";
import SceneCanvas from "./SceneCanvas";
import { Brief, Challenge, Debrief, Hub, Intro, Lab, NameEntry, Signal, Vault } from "./screens";
import Settings from "./Settings";

const SCREENS: Record<Screen, React.ComponentType> = { intro: Intro, name: NameEntry, hub: Hub, brief: Brief, lab: Lab, challenge: Challenge, vault: Vault, signal: Signal, debrief: Debrief };
const BG: Record<ThemeId, string> = { base: "#120d0a", orb: "#06101c", moon: "#0a1017", mars: "#160c09", ast: "#0e0f14", deep: "#070a14" };

export default function Game() {
  const [mounted, setMounted] = useState(false);
  const screen = useStore((s) => s.screen);
  const missionId = useStore((s) => s.missionId);
  const selected = useStore((s) => s.selected);
  const settings = useStore((s) => s.settings);
  const name = useStore((s) => s.name);
  const iris = useRef<HTMLDivElement>(null);
  const [applied, setApplied] = useState<ThemeId>("base");

  useEffect(() => setMounted(true), []);

  // which archive's sky and palette is showing
  const m = screen === "hub" ? mission(selected) : mission(missionId);
  const theme: ThemeId = screen === "intro" || screen === "name" ? "base" : m.era;
  const scene = screen === "intro" || screen === "name" ? "base" : m.scene;

  // re-theme with an iris wipe
  useEffect(() => {
    if (theme === applied) return;
    const el = iris.current;
    const still = settings.calm || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || still) { setApplied(theme); return; }
    el.style.background = BG[theme];
    el.classList.remove("go");
    void el.offsetWidth;
    el.classList.add("go");
    const id = setTimeout(() => setApplied(theme), 550);
    return () => clearTimeout(id);
  }, [theme, applied, settings.calm]);

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.theme = applied;
    r.dataset.tint = settings.tint ? "1" : "0";
    r.dataset.contrast = settings.contrast ? "1" : "0";
    r.dataset.calm = settings.calm ? "1" : "0";
    r.dataset.text = String(settings.text);
    audio.setTheme(applied);
  }, [applied, settings]);

  useEffect(() => audio.setVolumes(settings.music, settings.sfx, settings.muted), [settings.music, settings.sfx, settings.muted]);

  // audio may only start after the first click or key; M mutes
  useEffect(() => {
    const start = () => audio.start();
    const key = (e: KeyboardEvent) => {
      audio.start();
      const t = e.target as HTMLElement;
      if (e.key.toLowerCase() === "m" && t.tagName !== "INPUT") useStore.getState().setSettings({ muted: !useStore.getState().settings.muted });
    };
    addEventListener("pointerdown", start);
    addEventListener("keydown", key);
    return () => { removeEventListener("pointerdown", start); removeEventListener("keydown", key); };
  }, []);

  if (!mounted) return null;
  const Current = SCREENS[screen];
  return (
    <MotionConfig reducedMotion={settings.calm ? "always" : "user"}>
      <SceneCanvas scene={scene} still={settings.calm} />
      <header id="top">
        <span>Project Chronos{name && screen !== "intro" ? ` · Cadet ${name}` : ""}</span>
        <span style={{ display: "flex", gap: 8 }}>
          {screen !== "intro" && screen !== "name" && screen !== "hub" && (
            <button className="icon" aria-label="Back to Chronos Base" title="Chronos Base" onClick={() => useStore.getState().go("hub")}>⌂</button>
          )}
          <button className="icon" aria-label={settings.muted ? "Unmute sound" : "Mute sound"} aria-pressed={settings.muted} title="Mute (M)" onClick={() => useStore.getState().setSettings({ muted: !settings.muted })}>
            {settings.muted ? "🔇" : "🔊"}
          </button>
          <button className="icon" aria-label="Settings" title="Settings" onClick={() => useStore.getState().setPanel(!useStore.getState().panel)}>⚙</button>
        </span>
      </header>
      <AnimatePresence mode="wait">
        <motion.main key={screen + (screen === "hub" ? "" : missionId)} className="screen" data-screen={screen} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <Current />
        </motion.main>
      </AnimatePresence>
      <Companion />
      <Settings />
      <div id="iris" ref={iris} />
    </MotionConfig>
  );
}
