"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "@/audio/AudioEngine";
import { CHALLENGES } from "@/challenges";
import { COMPANION_NAME, ERAS, MISSIONS, fact, image, mission, type ImageRec, type ShownFact } from "@/data";
import { Craft } from "@/schematics";
import { prog, say, useStore } from "@/state/store";
import AssemblySheet from "./AssemblySheet";
import { FactLine, FictionLabel, SourceChip } from "./ui";

const useMission = () => mission(useStore((s) => s.missionId));

export function Intro() {
  const go = useStore((s) => s.go);
  const name = useStore((s) => s.name);
  const [n, setN] = useState(0);
  const lines = ["In 1967, a small robot landed on the Moon.", "It dug, it watched, it sent home thousands of pictures.", "Then the night came, and it went silent.", "In this story, the records of that silence are fading."];
  useEffect(() => {
    const id = setInterval(() => setN((v) => Math.min(lines.length + 1, v + 1)), 2400);
    return () => clearInterval(id);
  }, [lines.length]);
  const begin = () => {
    audio.start();
    go(name ? "hub" : "name");
  };
  return (
    <div className="ctr">
      {lines.map((l, i) => (
        <div key={i} className={"ln" + (i < n ? " in" : "")}>{l}</div>
      ))}
      <h1 className="big" style={{ opacity: n > lines.length ? 1 : 0, transition: "opacity 2s" }}>Odyssey of the Silent Fleet</h1>
      <button className="btn solid" onClick={begin}>{n > lines.length ? "Begin" : "Skip intro"}</button>
    </div>
  );
}

export function NameEntry() {
  const [v, setV] = useState("");
  const join = () => {
    useStore.getState().setName(v.trim().slice(0, 16) || "Cadet");
    useStore.getState().go("hub");
  };
  useEffect(() => say(`Hi. I am ${COMPANION_NAME}, the Corps archive droid. Something is erasing our records of the machines we left in space. Let us save them.`), []);
  return (
    <form className="ctr" onSubmit={(e) => { e.preventDefault(); join(); }}>
      <FictionLabel kind="story">Story: the Orbital Preservation Corps</FictionLabel>
      <h2 className="mid"><label htmlFor="nm">Cadet, what should I call you?</label></h2>
      <input id="nm" className="name-input" maxLength={16} placeholder="your name" value={v} onChange={(e) => setV(e.target.value)} autoComplete="off" />
      <button className="btn solid" type="submit">Join the Corps</button>
    </form>
  );
}

export function Hub() {
  const selected = useStore((s) => s.selected);
  const progress = useStore((s) => s.progress);
  const name = useStore((s) => s.name);
  const m = mission(selected);
  const doneCount = MISSIONS.filter((x) => progress[x.id]?.done).length;
  useEffect(() => {
    say(doneCount ? `${doneCount} of 10 archives preserved. Pick the next one, ${name}.` : `Welcome to Chronos Base, ${name}. Every archive has its own sky. Start with Surveyor 3.`);
  }, [doneCount, name]);
  const pick = (id: string) => {
    audio.tick();
    useStore.getState().select(id);
    const x = mission(id);
    say(x.built ? `${x.name}. This archive is ready to restore.` : `${x.name}. The Decay Wave sealed this archive. We are still rebuilding it.`);
  };
  const f = fact(m.intro_fact);
  return (
    <div className="ctr" style={{ justifyContent: "flex-start", paddingTop: "max(11vh, 70px)", overflow: "auto" }}>
      <FictionLabel kind="story">Story: the Orbital Preservation Corps</FictionLabel>
      <h2 className="mid">Chronos Base</h2>
      <div className="chips" role="tablist" aria-label="Eras">
        {ERAS.map((e) => (
          <button key={e.id} role="tab" aria-selected={m.era === e.id} className={"chip" + (m.era === e.id ? " on" : "")} onClick={() => pick(MISSIONS.find((x) => x.era === e.id)!.id)}>
            {e.name}
          </button>
        ))}
      </div>
      <div className="chips" aria-label="Missions in this era">
        {MISSIONS.filter((x) => x.era === m.era).map((x) => (
          <button key={x.id} className={"chip" + (x.id === m.id ? " on" : "")} aria-pressed={x.id === m.id} onClick={() => pick(x.id)}>
            {x.order}. {x.name}{progress[x.id]?.done ? " ✓" : ""}
          </button>
        ))}
      </div>
      <h3 style={{ fontSize: "1.6rem", marginTop: 6 }}>{m.name}</h3>
      {m.built ? (
        <>
          <FactLine f={f} className="panel" />
          <button className="btn solid" onClick={() => { audio.tick(); useStore.getState().openMission(m.id); }}>Open archive: {m.name}</button>
        </>
      ) : (
        <p className="panel" style={{ margin: 0 }}><FictionLabel kind="story" /> This archive is sealed. Restoration is in progress.</p>
      )}
      <p className="dim mono" style={{ margin: 0 }}>{doneCount} of 10 archives preserved</p>
    </div>
  );
}

export function Brief() {
  const m = useMission();
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<ShownFact | null>(null);
  const name = useStore((s) => s.name);
  useEffect(() => say(`${name}, this is ${m.name}. Tap the three glowing rings.`), [m, name]);
  const inspect = (id: string, factId: string, el: HTMLElement) => {
    const f = fact(factId);
    const r = el.getBoundingClientRect();
    useStore.getState().setTarget({ x: r.left + r.width / 2, scan: true });
    if (!found.includes(id)) { setFound([...found, id]); audio.discovery(); }
    setLast(f);
    say(f ? f.text : "I have no verified record for this one.", "hop");
  };
  const pos: Record<string, React.CSSProperties> = {
    soil: { left: "76%", bottom: "calc(var(--floor) + var(--lift, 4vh) + 8px)", top: "auto" },
    sky: { left: "72%", top: "30%" },
  };
  const spots = m.hotspots ?? [];
  const craft = spots.find((h) => h.id === "craft");
  return (
    <>
      {spots.filter((h) => h.id !== "craft").map((h) => (
        <button key={h.id} className={"hot" + (found.includes(h.id) ? " done" : "")} style={pos[h.id]} data-hot={h.id} aria-label={h.label} onClick={(e) => inspect(h.id, h.fact, e.currentTarget)} />
      ))}
      <div className="hero">
        <Craft mission={m.id} />
        {craft && (
          <button className={"hot" + (found.includes("craft") ? " done" : "")} style={{ left: "50%", top: "50%", pointerEvents: "auto" }} data-hot="craft" aria-label={craft.label} onClick={(e) => inspect("craft", craft.fact, e.currentTarget)} />
        )}
      </div>
      <div className="ctr" style={{ justifyContent: "flex-start", paddingTop: "max(9vh, 64px)", pointerEvents: "none", gap: 12 }}>
        <h2 className="mid">{m.name}</h2>
        <FactLine f={last ?? fact(m.intro_fact)} className="panel" />
        <div style={{ pointerEvents: "auto", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <span className="mono dim" data-testid="found">{found.length} of {spots.length} investigated</span>
          <button className="btn solid" disabled={found.length < spots.length} onClick={() => useStore.getState().go("lab")}>Open the assembly sheet</button>
        </div>
      </div>
    </>
  );
}

export function Lab() {
  const m = useMission();
  const [done, setDone] = useState(false);
  useEffect(() => say("Drag each part to its outline. Or pick a part, then pick its slot. Think about what each part does."), []);
  return (
    <div className="wrap">
      <h2 className="mid">Assembly sheet: {m.name}</h2>
      <FictionLabel kind="model">Simplified model. Not a NASA specification.</FictionLabel>
      {done && <button className="btn solid" onClick={() => useStore.getState().go("challenge")}>Start the challenge</button>}
      <AssemblySheet m={m} onDone={() => setDone(true)} />
    </div>
  );
}

export function Challenge() {
  const m = useMission();
  const ch = m.challenge!;
  const Comp = CHALLENGES[ch.id];
  const [res, setRes] = useState<{ win: boolean; msg: string; f: ShownFact | null } | null>(null);
  useEffect(() => say(ch.hint), [ch]);
  const onWin = useCallback((msg: string, factId?: string) => {
    setRes({ win: true, msg, f: fact(factId) });
    audio.discovery();
    say("Challenge complete.", "spin");
  }, []);
  const onLose = useCallback((msg: string) => {
    useStore.getState().patch(m.id, { tries: prog(m.id).tries + 1 });
    setRes({ win: false, msg, f: null });
    say("No problem. Go again.", "alert");
  }, [m.id]);
  return (
    <div className="wrap">
      <FictionLabel kind="model">Challenge · simplified model</FictionLabel>
      <h2 className="mid">{ch.title}</h2>
      <p className="dim" style={{ maxWidth: "48ch", textAlign: "center", margin: 0 }}>{ch.intro}</p>
      <div style={{ width: "min(560px, 94vw)" }}>
        <Comp onWin={onWin} onLose={onLose} />
        {res && (
          <div className="panel" style={{ marginTop: 12 }} data-testid={res.win ? "win" : "lose"} role="status">
            <p style={{ margin: "0 0 6px" }}><FictionLabel kind="model" /> <b>{res.win ? "Challenge complete." : "Not this time."}</b> {res.msg}</p>
            <FactLine f={res.f} />
          </div>
        )}
      </div>
      {res?.win ? (
        <button className="btn solid" onClick={() => useStore.getState().go("vault")}>Continue to the vault</button>
      ) : (
        <button className="btn ghost" onClick={() => useStore.getState().go("vault")}>Skip challenge</button>
      )}
    </div>
  );
}

function ImageModal({ img, onClose }: { img: ImageRec; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={img.title} onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.local_path} alt={img.alt} />
      <p className="cr" style={{ maxWidth: 700, textAlign: "center" }}>
        {img.title} · {img.date} · Credit: {img.credit} · <a className="src" href={img.source_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>NASA ID {img.nasa_id}</a>
      </p>
      <button ref={ref} className="btn" onClick={onClose}>Close</button>
    </div>
  );
}

export function Vault() {
  const m = useMission();
  const has = useStore((s) => s.progress[m.id]?.vault ?? []);
  const [zoom, setZoom] = useState<ImageRec | null>(null);
  useEffect(() => say("Sealed files. Tap one to restore it. Evidence first, story second."), []);
  const items = m.vault ?? [];
  return (
    <div className="wrap">
      <h2 className="mid">Evidence vault</h2>
      <p className="dim" style={{ maxWidth: "52ch", textAlign: "center", margin: 0 }}>
        <FictionLabel kind="story" /> The Decay Wave scrambled these files. Restore each one. Every file names its source.
      </p>
      <button className="btn solid" onClick={() => useStore.getState().go("signal")}>Final signal</button>
      <div className="grid">
        {items.map((v, i) => {
          const open = has.includes(i);
          const f = fact(v.fact);
          const img = image(v.image);
          const act = () => {
            if (!open) {
              const next = [...has, i];
              useStore.getState().patch(m.id, { vault: next });
              audio.static(0.35);
              audio.discovery();
              say(next.length === items.length ? "Archive restored. Now the ending." : `Restored: ${v.title}.`, "hop");
            } else if (img) setZoom(img);
          };
          return (
            <article key={i} className={"card" + (open ? "" : " lock")} data-file={i}>
              <button className="ph" onClick={act} aria-label={open ? (img ? `Zoom photo: ${v.title}` : `${v.title}, restored`) : `Restore sealed file ${i + 1}`}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.local_path} alt={open ? img.alt : ""} loading="lazy" />
                ) : (
                  <span style={{ padding: 10 }}>No verified photo for this file. Placeholder, not a NASA image.</span>
                )}
              </button>
              <div className="tx">
                <h3>{v.title}</h3>
                {f && <p><FictionLabel kind="real" /> {f.text}</p>}
                {f && <span className="cr"><SourceChip f={f} /></span>}
                {img && <span className="cr">Photo credit: {img.credit} · NASA ID {img.nasa_id}</span>}
              </div>
            </article>
          );
        })}
      </div>
      <p className="cr" style={{ textAlign: "center" }}>NASA does not endorse this project. Images courtesy of NASA unless noted.</p>
      {zoom && <ImageModal img={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

export function Signal() {
  const m = useMission();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    say("This part is quiet on purpose. An honest ending can have more than one date.", "quiet");
    audio.heartbeat(true);
    const id = setTimeout(() => setReady(true), 4500); // a long pause before Continue
    return () => { clearTimeout(id); audio.heartbeat(false); };
  }, []);
  return (
    <div className="wrap" style={{ justifyContent: "center" }}>
      <div className="one-light" aria-hidden="true" />
      <h2 className="mid">Last signal: {m.name}</h2>
      <div className="tl">
        {(m.signal ?? []).map((s) => {
          const f = fact(s.fact);
          return (
            <div key={s.kind} className={f ? "" : "q"}>
              {f ? <FictionLabel kind="real" /> : <span className="lbl story">Not shown</span>}
              <b>{s.kind}</b>
              {f ? <>{f.text} <SourceChip f={f} /></> : <span className="mono dim">Not shown: no verified date</span>}
            </div>
          );
        })}
      </div>
      <p className="note">{m.signal_note}</p>
      <button className="btn" style={{ opacity: ready ? 1 : 0, transition: "opacity 2s", pointerEvents: ready ? "auto" : "none" }} disabled={!ready} onClick={() => useStore.getState().go("debrief")}>Continue</button>
    </div>
  );
}

export function Debrief() {
  const m = useMission();
  const name = useStore((s) => s.name);
  const p = useStore((s) => s.progress[m.id]) ?? { vault: [], tries: 0, built: false, done: false };
  useEffect(() => {
    useStore.getState().patch(m.id, { done: true });
    audio.complete();
    say(`That is the whole ${m.name} file. Preserved.`, "spin");
  }, [m]);
  const badges: [string, boolean][] = [["Reconstructor", p.built], ["Archivist", p.vault.length === (m.vault?.length ?? 0)], ["Clean run", p.tries === 0]];
  return (
    <div className="wrap" style={{ textAlign: "center" }}>
      <h2 className="big">{name}, {m.name} preserved</h2>
      <p style={{ maxWidth: "46ch", font: "500 1.15rem var(--display)", margin: 0 }}>{m.ending}</p>
      <div className="chips">
        {badges.map(([b, on]) => <span key={b} className="lbl model" style={{ opacity: on ? 1 : 0.35 }}>{b}{on ? " ✓" : ""}</span>)}
      </div>
      <div className="note" style={{ display: "grid", gap: 8 }}>
        {(m.debrief_facts ?? []).map((id) => <FactLine key={id} f={fact(id)} />)}
        <p style={{ margin: 0 }}><FictionLabel kind="story" /> The Temporal Decay Wave, the Corps and {COMPANION_NAME} are fiction. {COMPANION_NAME} is a scripted character, not a spacecraft mind.</p>
      </div>
      <p className="dim" style={{ margin: 0 }}>Machines may fall silent. Their discoveries never do.</p>
      <button className="btn solid" onClick={() => useStore.getState().go("hub")}>Return to Chronos Base</button>
    </div>
  );
}
