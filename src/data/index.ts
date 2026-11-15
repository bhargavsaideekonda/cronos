import explorer1 from "@data/missions/explorer1.json";
import surveyor3 from "@data/missions/surveyor3.json";
import eagle from "@data/missions/eagle.json";
import lrv from "@data/missions/lrv.json";
import viking1 from "@data/missions/viking1.json";
import opportunity from "@data/missions/opportunity.json";
import ingenuity from "@data/missions/ingenuity.json";
import near from "@data/missions/near.json";
import dawn from "@data/missions/dawn.json";
import pioneer10 from "@data/missions/pioneer10.json";
import fExplorer1 from "@data/facts/explorer1.json";
import fSurveyor3 from "@data/facts/surveyor3.json";
import fEagle from "@data/facts/eagle.json";
import fLrv from "@data/facts/lrv.json";
import fViking1 from "@data/facts/viking1.json";
import fOpportunity from "@data/facts/opportunity.json";
import fIngenuity from "@data/facts/ingenuity.json";
import fNear from "@data/facts/near.json";
import fDawn from "@data/facts/dawn.json";
import fPioneer10 from "@data/facts/pioneer10.json";
import iSurveyor3 from "@data/images/surveyor3.json";

export const COMPANION_NAME = "TOCK";

export type Era = "orb" | "moon" | "mars" | "ast" | "deep";
export type ThemeId = Era | "base";
export type FactStatus = "verified" | "conflicting" | "unverified";

export interface Fact {
  id: string;
  text: string;
  source: string;
  source_url: string;
  status: FactStatus;
  safe_text?: string;
  note?: string;
}
export interface ImageRec {
  nasa_id: string;
  title: string;
  date: string;
  credit: string;
  source_url: string;
  local_path: string;
  alt: string;
  status: string;
}
export interface Hotspot { id: string; label: string; x: number; y: number; fact: string }
export interface PartData { id: string; name: string; role: string; snap: string; fact?: string }
export interface Mission {
  id: string;
  order: number;
  era: Era;
  scene: string;
  name: string;
  built: boolean;
  intro_fact?: string;
  hotspots?: Hotspot[];
  parts?: PartData[];
  challenge?: { id: string; title: string; intro: string; hint: string };
  vault?: { title: string; fact: string; image: string | null }[];
  signal?: { kind: string; fact: string }[];
  signal_note?: string;
  ending?: string;
  debrief_facts?: string[];
}

export const ERAS: { id: Era; name: string }[] = [
  { id: "orb", name: "Earth orbit" },
  { id: "moon", name: "Moon" },
  { id: "mars", name: "Mars" },
  { id: "ast", name: "Asteroids" },
  { id: "deep", name: "Deep space" },
];

export const MISSIONS = ([explorer1, surveyor3, eagle, lrv, viking1, opportunity, ingenuity, near, dawn, pioneer10] as Mission[]).sort(
  (a, b) => a.order - b.order,
);
export const mission = (id: string) => MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];

const ALL_FACTS: Fact[] = [
  ...(fExplorer1 as Fact[]),
  ...(fSurveyor3 as Fact[]),
  ...(fEagle as Fact[]),
  ...(fLrv as Fact[]),
  ...(fViking1 as Fact[]),
  ...(fOpportunity as Fact[]),
  ...(fIngenuity as Fact[]),
  ...(fNear as Fact[]),
  ...(fDawn as Fact[]),
  ...(fPioneer10 as Fact[]),
];

const FACTS = new Map<string, Fact>(ALL_FACTS.map((f) => [f.id, f]));
const IMAGES = new Map<string, ImageRec>((iSurveyor3 as ImageRec[]).map((i) => [i.nasa_id, i]));

export interface ShownFact { id: string; text: string; source: string; url: string; differs: boolean }

/** The only way facts reach the UI. Unverified facts, and conflicting facts with no safe wording, return null. */
export function fact(id?: string | null): ShownFact | null {
  const f = id ? FACTS.get(id) : undefined;
  if (!f) return null;
  if (f.status === "verified") return { id: f.id, text: f.text, source: f.source, url: f.source_url, differs: false };
  if (f.status === "conflicting" && f.safe_text) return { id: f.id, text: f.safe_text, source: f.source, url: f.source_url, differs: true };
  return null;
}

/** Only verified, credited images are returned. */
export function image(id?: string | null): ImageRec | null {
  const i = id ? IMAGES.get(id) : undefined;
  return i && i.status === "verified" && i.credit && i.source_url ? i : null;
}
