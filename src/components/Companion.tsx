"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { COMPANION_NAME } from "@/data";
import { useStore } from "@/state/store";

/**
 * TOCK: an original archive droid, built as a small agent rather than an icon.
 * Each frame it perceives (cursor, hotspot target, idle time, screen), scores its behaviours,
 * and runs the highest-scoring one. Speech is always captioned.
 */
type Behaviour = "quiet" | "goto" | "talk" | "follow" | "emote" | "wander" | "rest";
const EMOTES = ["look", "yawn", "polish", "sky"] as const;

export default function Companion() {
  const speech = useStore((s) => s.speech);
  const screen = useStore((s) => s.screen);
  const calm = useStore((s) => s.settings.calm);
  const [shown, setShown] = useState("");
  const [gone, setGone] = useState(true);
  const [hatch, setHatch] = useState(false);
  const root = useRef<HTMLButtonElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const st = useRef({ x: 40, vx: 0, tx: 40, wheel: 0, talking: false, mood: "", moodUntil: 0, cursorX: -1, cursorY: 0, cursorT: 0, acted: 0, wanderAt: 0, emote: "", emoteUntil: 0, moving: false, squashUntil: 0 });

  // typed, captioned speech with chirps
  useEffect(() => {
    if (!speech.text) return;
    const s = st.current;
    let i = 0;
    s.talking = true;
    s.acted = performance.now();
    setGone(false);
    setShown("");
    const step = calm ? speech.text.length : 1;
    const id = setInterval(() => {
      i = Math.min(speech.text.length, i + step);
      setShown(speech.text.slice(0, i));
      if (i % 3 === 0) audio.chirp();
      if (i >= speech.text.length) {
        clearInterval(id);
        s.talking = false;
        s.mood = speech.mood;
        s.moodUntil = performance.now() + (speech.mood === "quiet" ? 1e12 : 1400);
      }
    }, 17);
    const hide = setTimeout(() => setGone(true), 17 * speech.text.length + 9000);
    return () => {
      clearInterval(id);
      clearTimeout(hide);
      s.talking = false;
    };
  }, [speech, calm]);

  useEffect(() => {
    const s = st.current;
    const move = (e: PointerEvent) => {
      s.cursorX = e.clientX;
      s.cursorY = e.clientY;
      s.cursorT = performance.now();
    };
    addEventListener("pointermove", move);
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const el = root.current;
      if (!el || document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = innerWidth, size = W < 600 ? 66 : 92, maxX = W - size - 8;
      el.style.setProperty("--tk", size + "px");
      document.documentElement.style.setProperty("--tk", size + "px");
      const { target, screen, settings } = useStore.getState();
      const still = settings.calm || matchMedia("(prefers-reduced-motion: reduce)").matches;
      const idle = now - Math.max(s.acted, s.cursorT);

      // utility scores
      const u: Record<Behaviour, number> = {
        quiet: screen === "signal" ? 10 : 0,
        goto: target ? 5 : 0,
        talk: s.talking ? 3 : 0,
        emote: now < s.emoteUntil ? 2.5 : idle > 9000 ? 1.2 : 0,
        follow: !still && s.cursorX >= 0 && now - s.cursorT < 2500 ? 1 : 0,
        wander: !still && idle > 4000 ? 0.8 : 0,
        rest: 0.1,
      };
      const b = (Object.keys(u) as Behaviour[]).reduce((a, k) => (u[k] > u[a] ? k : a), "rest" as Behaviour);

      if (b === "goto" && target) s.tx = target.x - size * 1.15;
      else if (b === "follow") {
        const d = s.cursorX - (s.x + size / 2);
        if (Math.abs(d) > 200) s.tx = s.cursorX - Math.sign(d) * 160 - size / 2;
      } else if (b === "wander") {
        if (now > s.wanderAt) {
          s.tx = 12 + Math.random() * (maxX - 12);
          s.wanderAt = now + 4000 + Math.random() * 4000;
        }
      } else if (b === "emote") {
        if (now >= s.emoteUntil) {
          s.emote = EMOTES[Math.floor(Math.random() * EMOTES.length)];
          s.emoteUntil = now + 2600;
          s.acted = now - 5000; // after the emote, wander before emoting again
        }
        s.tx = s.x;
      } else if (b === "quiet" || b === "talk" || b === "rest") s.tx = s.x;
      if (now >= s.emoteUntil) s.emote = "";
      s.tx = Math.max(8, Math.min(maxX, s.tx));

      // motion: ease velocity toward the target, wheels turn with distance travelled
      if (still) { s.x = s.tx; s.vx = 0; }
      else {
        const want = Math.max(-280, Math.min(280, (s.tx - s.x) * 3.2));
        s.vx += (want - s.vx) * Math.min(1, dt * 7);
        if (Math.abs(s.tx - s.x) < 1.5 && Math.abs(s.vx) < 12) s.vx = 0;
        s.x += s.vx * dt;
      }
      s.wheel += ((s.vx * dt) / (0.13 * size)) * 57.3;
      const moving = Math.abs(s.vx) > 14;
      if (s.moving && !moving) s.squashUntil = now + 220; // squash and stretch on stops
      s.moving = moving;

      // dome swivels toward what it is attending to
      const look = target ? target.x : s.cursorX >= 0 ? s.cursorX : s.x;
      const dir = Math.max(-1, Math.min(1, (look - (s.x + size / 2)) / 300));
      const dome = el.querySelector<SVGGElement>(".dome")!;
      if (!s.emote) dome.style.transform = `rotate(${(moving ? Math.sign(s.vx) * 6 : 0) + dir * 9}deg)`;
      else dome.style.transform = "";
      const pupil = el.querySelector<SVGCircleElement>(".pupil")!;
      const dy = Math.max(-1, Math.min(1, (s.cursorY - (innerHeight - size)) / 300));
      pupil.style.transform = `translate(${dir * 4}px, ${dy * 3}px)`;
      el.querySelectorAll<SVGGElement>(".spokes").forEach((w) => (w.style.transform = `rotate(${s.wheel}deg)`));
      el.style.transform = `translateX(${s.x}px)`;

      const mood = now < s.moodUntil ? s.mood : "";
      el.className = [s.talking ? "talk" : mood, b === "quiet" ? "quiet" : "", now < s.squashUntil ? "squash" : "", target?.scan && !moving ? "scan" : ""].join(" ");
      el.dataset.emote = b === "emote" ? s.emote : "";
      el.dataset.behaviour = b;
      el.dataset.x = String(Math.round(s.x));

      const bub = bubble.current;
      if (bub) bub.style.left = Math.max(10, Math.min(W - bub.offsetWidth - 10, s.x + size * 0.3)) + "px";
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
    };
  }, []);

  if (screen === "intro") return null;
  const vaultCount = Object.values(useStore.getState().progress).reduce((n, p) => n + p.vault.length, 0);
  return (
    <>
      <div id="say" ref={bubble} className={gone ? "gone" : ""} role="status" aria-live="polite">
        <b>{COMPANION_NAME}</b>
        {shown}
      </div>
      <button
        id="tock"
        ref={root}
        aria-label={`${COMPANION_NAME}, your archive droid. Press to repeat the last line.`}
        onClick={() => {
          setHatch(true);
          setTimeout(() => setHatch(false), 2600);
          const sp = useStore.getState().speech;
          useStore.getState().say(sp.text || `${vaultCount} evidence files in my hatch.`, "hop");
        }}
      >
        <svg viewBox="0 0 100 110" aria-hidden="true" className={hatch ? "open" : ""}>
          <g className={"rig" + (hatch ? " open" : "")}>
            <g className="dome">
              <path className="beam" d="M37 36 L-60 10 L-60 70 Z" fill="var(--accent)" />
              <line x1="68" y1="18" x2="74" y2="5" stroke="var(--accent)" strokeWidth="2" />
              <circle className="lt" cx="74" cy="5" r="3.5" />
              <g className="spark" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M74 -3V-8M81 2L85 -1M67 2L63 -1" />
              </g>
              <path d="M20 48 A30 30 0 0 1 80 48 Z" fill="#d6dde2" stroke="#6b757c" strokeWidth="1.5" />
              <path d="M52 22V48M60 26 A24 24 0 0 1 76 48" fill="none" stroke="#9aa4ab" />
              <rect x="58" y="31" width="14" height="6" rx="2" fill="#2d6a8f" />
              <rect x="58" y="40" width="14" height="4" rx="2" fill="var(--accent)" />
              <circle cx="37" cy="36" r="10.5" fill="#101417" stroke="var(--accent)" strokeWidth="2" />
              <circle className="pupil" cx="37" cy="36" r="5" fill="var(--accent)" />
              <circle cx="34" cy="33" r="1.8" fill="#fff" />
              <path className="lid" d="M26.5 36 A10.5 10.5 0 0 1 47.5 36 L47.5 47 L26.5 47 Z" fill="#d6dde2" />
            </g>
            <rect className="arm l" x="9" y="52" width="7" height="22" rx="3.5" fill="#8e979d" />
            <rect className="arm r" x="84" y="52" width="7" height="22" rx="3.5" fill="#8e979d" />
            <rect x="22" y="48" width="56" height="34" rx="9" fill="#aeb7bc" stroke="#6b757c" strokeWidth="1.5" />
            <rect x="34" y="56" width="32" height="18" rx="4" fill="#20262a" />
            <text x="50" y="68" textAnchor="middle" fontSize="9" fill="var(--accent)" fontFamily="monospace">{vaultCount}</text>
            <g className="hatch" style={hatch ? { transform: "rotate(-80deg)" } : undefined}>
              <rect x="34" y="56" width="32" height="18" rx="4" fill="#8e979d" stroke="#6b757c" />
              <circle cx="42" cy="65" r="3" fill="var(--accent)" />
              <rect x="50" y="61" width="12" height="2.5" rx="1" fill="#3a4147" />
              <rect x="50" y="67" width="12" height="2.5" rx="1" fill="#3a4147" />
            </g>
            <rect x="36" y="86" width="28" height="11" rx="5" fill="#3a4147" />
            {[25, 75].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="92" r="13" fill="#2b3034" stroke="#6b757c" strokeWidth="2" />
                <g className="spokes" style={{ transformOrigin: `${cx}px 92px` }}>
                  <path d={`M${cx - 11} 92H${cx + 11}M${cx} 81V103`} stroke="#6b757c" strokeWidth="2" />
                  <circle cx={cx} cy="92" r="5" fill="var(--accent-2)" />
                  <circle cx={cx + 8} cy="92" r="1.6" fill="#d6dde2" />
                </g>
              </g>
            ))}
          </g>
        </svg>
      </button>
    </>
  );
}
