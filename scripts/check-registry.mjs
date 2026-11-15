// Fails if any fact or image that the UI could show is missing its source, credit or file.
import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const errs = [];
const facts = new Map(), images = new Map();
for (const f of fs.readdirSync("data/facts")) for (const x of read(`data/facts/${f}`)) {
  if (facts.has(x.id)) errs.push(`duplicate fact id ${x.id}`);
  facts.set(x.id, x);
  if (!["verified", "conflicting", "unverified"].includes(x.status)) errs.push(`${x.id}: bad status`);
  if (x.status !== "unverified" && !/^https:\/\//.test(x.source_url || "")) errs.push(`${x.id}: no source URL`);
  if (x.status !== "unverified" && !x.source) errs.push(`${x.id}: no source name`);
}
for (const f of fs.readdirSync("data/images")) for (const x of read(`data/images/${f}`)) {
  images.set(x.nasa_id, x);
  if (x.status !== "verified") continue;
  for (const k of ["nasa_id", "title", "date", "credit", "source_url", "local_path", "alt"]) if (!x[k]) errs.push(`image ${x.nasa_id}: missing ${k}`);
  if (!fs.existsSync("public" + x.local_path)) errs.push(`image ${x.nasa_id}: file missing`);
}
let shown = 0;
for (const f of fs.readdirSync("data/missions")) {
  const m = read(`data/missions/${f}`);
  if (!m.built) continue;
  const ids = [m.intro_fact, ...(m.hotspots || []).map((h) => h.fact), ...(m.parts || []).map((p) => p.fact), ...(m.vault || []).map((v) => v.fact), ...(m.signal || []).map((s) => s.fact), ...(m.debrief_facts || [])].filter(Boolean);
  for (const id of ids) { if (!facts.has(id)) errs.push(`${m.id}: unknown fact ${id}`); else shown++; }
  for (const v of m.vault || []) if (v.image && !images.has(v.image)) errs.push(`${m.id}: unknown image ${v.image}`);
  if ((m.parts || []).length !== 6) errs.push(`${m.id}: needs six parts`);
  if ((m.vault || []).length !== 4) errs.push(`${m.id}: needs four evidence files`);
}
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
console.log(`registry ok: ${facts.size} facts, ${images.size} images, ${shown} fact references`);
