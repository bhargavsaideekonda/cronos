"use client";
import { useMemo, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { fact, type Mission } from "@/data";
import { SCHEMATICS } from "@/schematics";
import { say, useStore } from "@/state/store";

/**
 * Model-kit assembly: dashed outlines on the sheet, true-shape silhouettes in the tray.
 * Three ways to place a part: drag it, tap it then tap its slot, or Tab + Enter on both.
 */
export default function AssemblySheet({ m, onDone }: { m: Mission; onDone: () => void }) {
  const parts = SCHEMATICS[m.id];
  const data = m.parts!;
  const [placed, setPlaced] = useState<string[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const order = useMemo(() => [...data].sort((a, b) => (a.role > b.role ? 1 : -1)), [data]);
  const done = placed.length === parts.length;

  const attempt = (slot: string, part: string) => {
    if (placed.includes(slot)) return;
    if (slot !== part) {
      audio.wrong();
      say("Not quite. Think about what that part does and where it would sit.", "alert"); // a hint, never a penalty
      return;
    }
    const d = data.find((p) => p.id === part)!;
    const f = fact(d.fact);
    const next = [...placed, part];
    setPlaced(next);
    setSel(null);
    audio.snap();
    const el = document.querySelector(`[data-slot="${slot}"]`)?.getBoundingClientRect();
    if (el) useStore.getState().setTarget({ x: el.left + el.width / 2 });
    if (next.length === parts.length) {
      useStore.getState().patch(m.id, { built: true });
      audio.discovery();
      setTimeout(() => say(`All six parts placed. That is ${m.name}, as a simplified model.`, "spin"), 1900);
      setTimeout(onDone, 600);
    }
    say(d.snap + (f ? " " + f.text : ""), "hop");
  };

  return (
    <>
      <svg className={"sheet" + (done ? " done" : "")} viewBox="0 0 400 380" role="group" aria-label={`Exploded diagram of ${m.name}, ${placed.length} of ${parts.length} parts placed`}>
        {parts.map((p, i) => {
          const d = data.find((x) => x.id === p.id)!;
          const ok = placed.includes(p.id);
          const left = p.label[0] < 200;
          return (
            <g
              key={p.id}
              className={"slot" + (ok ? " ok" : sel ? " hint" : "")}
              data-slot={p.id}
              tabIndex={ok ? -1 : 0}
              role="button"
              aria-label={ok ? `${d.name}, placed` : `Empty slot ${i + 1}`}
              onClick={() => sel && attempt(p.id, sel)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && sel) {
                  e.preventDefault();
                  attempt(p.id, sel);
                }
              }}
            >
              <g className="hit">{p.shape}</g>
              <path className="lead" d={`M${p.anchor[0]} ${p.anchor[1]} L${p.label[0] + (left ? 10 : -10)} ${p.label[1]}`} />
              <g className="sh">{p.shape}</g>
              <circle className="num" cx={p.label[0]} cy={p.label[1]} r="10" />
              <text className="numt" x={p.label[0]} y={p.label[1]}>{i + 1}</text>
              <text className="pl" x={p.label[0]} y={p.label[1] + 22} textAnchor={left ? "start" : "end"} dx={left ? -10 : 10}>{d.name}</text>
            </g>
          );
        })}
      </svg>
      <div className="tray" aria-label="Parts tray">
        {order.filter((d) => !placed.includes(d.id)).map((d) => {
          const p = parts.find((x) => x.id === d.id)!;
          return (
            <button
              key={d.id}
              className={"part" + (sel === d.id ? " sel" : "")}
              data-part={d.id}
              aria-pressed={sel === d.id}
              onPointerDown={(e) => {
                drag.current = { id: d.id, x: e.clientX, y: e.clientY, moved: false };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                const g = drag.current;
                if (!g) return;
                if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) > 8) g.moved = true;
                if (g.moved) setGhost({ id: g.id, x: e.clientX, y: e.clientY });
              }}
              onPointerUp={(e) => {
                const g = drag.current;
                drag.current = null;
                setGhost(null);
                if (g?.moved) {
                  const slot = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-slot]");
                  if (slot) attempt(slot.getAttribute("data-slot")!, g.id);
                }
              }}
              onPointerCancel={() => { drag.current = null; setGhost(null); }}
              onClick={() => { audio.tick(); setSel(sel === d.id ? null : d.id); }}
            >
              <svg viewBox={p.box.join(" ")} aria-hidden="true">{p.shape}</svg>
              <span>
                {d.name}
                <small>{d.role}</small>
              </span>
            </button>
          );
        })}
      </div>
      {ghost && (
        <svg className="ghost-part" style={{ left: ghost.x, top: ghost.y }} viewBox={parts.find((p) => p.id === ghost.id)!.box.join(" ")} aria-hidden="true">
          {parts.find((p) => p.id === ghost.id)!.shape}
        </svg>
      )}
    </>
  );
}
