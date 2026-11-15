"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Screen = "intro" | "name" | "hub" | "brief" | "lab" | "challenge" | "vault" | "signal" | "debrief";
export type Mood = "" | "hop" | "spin" | "alert" | "quiet";

export interface Settings {
  tint: boolean;
  contrast: boolean;
  calm: boolean; // motion off
  sfx: number;
  music: number;
  muted: boolean;
  text: 0 | 1 | 2;
}
export interface Progress { done: boolean; vault: number[]; tries: number; built: boolean }
const blank = (): Progress => ({ done: false, vault: [], tries: 0, built: false });

interface State {
  screen: Screen;
  missionId: string;
  selected: string;
  name: string;
  settings: Settings;
  progress: Record<string, Progress>;
  speech: { text: string; mood: Mood; n: number };
  target: { x: number; scan?: boolean } | null;
  panel: boolean;
  go: (s: Screen) => void;
  select: (id: string) => void;
  openMission: (id: string) => void;
  say: (text: string, mood?: Mood) => void;
  setTarget: (t: State["target"]) => void;
  setName: (n: string) => void;
  setSettings: (p: Partial<Settings>) => void;
  setPanel: (v: boolean) => void;
  patch: (id: string, p: Partial<Progress>) => void;
  reset: () => void;
}

export const DEFAULTS: Settings = { tint: false, contrast: false, calm: false, sfx: 0.7, music: 0.5, muted: false, text: 0 };

export const useStore = create<State>()(
  persist(
    (set) => ({
      screen: "intro",
      missionId: "surveyor3",
      selected: "surveyor3",
      name: "",
      settings: DEFAULTS,
      progress: {},
      speech: { text: "", mood: "", n: 0 },
      target: null,
      panel: false,
      go: (screen) => set({ screen, target: null }),
      select: (selected) => set({ selected }),
      openMission: (id) => set({ missionId: id, selected: id, screen: "brief", target: null }),
      say: (text, mood = "") => set((s) => ({ speech: { text, mood, n: s.speech.n + 1 } })),
      setTarget: (target) => set({ target }),
      setName: (name) => set({ name }),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      setPanel: (panel) => set({ panel }),
      patch: (id, p) => set((s) => ({ progress: { ...s.progress, [id]: { ...(s.progress[id] ?? blank()), ...p } } })),
      reset: () => set({ name: "", progress: {}, screen: "intro", panel: false, selected: "surveyor3" }),
    }),
    {
      name: "chronos-save-v1",
      partialize: (s) => ({ name: s.name, settings: s.settings, progress: s.progress, selected: s.selected }),
    },
  ),
);

export const prog = (id: string): Progress => useStore.getState().progress[id] ?? blank();
export const say = (text: string, mood: Mood = "") => useStore.getState().say(text, mood);
