"use client";
import { useEffect } from "react";
import { audio } from "@/audio/AudioEngine";
import { useStore } from "@/state/store";

export default function Settings() {
  const open = useStore((s) => s.panel);
  const s = useStore((st) => st.settings);
  const set = useStore((st) => st.setSettings);
  const close = () => useStore.getState().setPanel(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open]);
  if (!open) return null;
  const check = (label: string, key: "tint" | "contrast" | "calm" | "muted") => (
    <label className="row">
      {label}
      <input type="checkbox" checked={s[key]} onChange={(e) => set({ [key]: e.target.checked })} />
    </label>
  );
  return (
    <aside className="sheet-panel" role="dialog" aria-label="Settings">
      <h2 style={{ fontSize: "1.4rem" }}>Settings</h2>
      <label className="row">
        Music
        <input type="range" min={0} max={1} step={0.05} value={s.music} onChange={(e) => set({ music: +e.target.value })} />
      </label>
      <label className="row">
        Effects
        <input type="range" min={0} max={1} step={0.05} value={s.sfx} onChange={(e) => { set({ sfx: +e.target.value }); audio.tick(); }} />
      </label>
      {check("Mute everything (M)", "muted")}
      {check("Motion off", "calm")}
      {check("High contrast", "contrast")}
      {check("Alternate tint", "tint")}
      <div className="row">
        Text size
        <span className="chips">
          {(["A", "A+", "A++"] as const).map((t, i) => (
            <button key={t} className={"chip" + (s.text === i ? " on" : "")} aria-pressed={s.text === i} onClick={() => set({ text: i as 0 | 1 | 2 })}>{t}</button>
          ))}
        </span>
      </div>
      <button className="btn" onClick={close}>Close</button>
      <button
        className="btn ghost"
        onClick={() => {
          if (confirm("Erase your name and all progress?")) useStore.getState().reset();
        }}
      >
        Reset name and progress
      </button>
      <p className="dim" style={{ fontSize: "0.8rem" }}>All music and sound is generated in your browser. NASA does not endorse this project.</p>
    </aside>
  );
}
