"use client";
import type { ShownFact } from "@/data";

/** REAL = verified NASA history. MODEL = game values and simulations. STORY = the fiction. */
export function FictionLabel({ kind, children }: { kind: "real" | "model" | "story"; children?: React.ReactNode }) {
  const text = { real: "Real", model: "Simplified model", story: "Story" }[kind];
  return <span className={"lbl " + kind}>{children ?? text}</span>;
}

export function SourceChip({ f }: { f: ShownFact }) {
  return (
    <a className="src" href={f.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
      Source: {f.source}
      {f.differs ? " · sources differ" : ""}
    </a>
  );
}

/** A verified fact with its label and source. Renders nothing if the fact cannot be shown. */
export function FactLine({ f, className }: { f: ShownFact | null; className?: string }) {
  if (!f) return null;
  return (
    <p className={className} style={{ margin: 0 }} data-fact={f.id}>
      <FictionLabel kind="real" /> {f.text} <SourceChip f={f} />
    </p>
  );
}
