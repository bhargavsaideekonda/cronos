// Usage: node scripts/fetch-nasa-image.mjs <mission> <nasa_id> [...]
// Copies metadata from the NASA Image Library entry itself and downloads the file. Never type IDs from memory.
import fs from "node:fs";
const [mission, ...ids] = process.argv.slice(2);
const out = `data/images/${mission}.json`;
const reg = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : [];
for (const id of ids) {
  const s = await (await fetch(`https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(id)}`)).json();
  const item = s.collection.items[0];
  if (!item) { console.log("NOT FOUND", id); continue; }
  const d = item.data[0];
  const assets = await (await fetch(`https://images-api.nasa.gov/asset/${encodeURIComponent(d.nasa_id)}`)).json();
  const hrefs = assets.collection.items.map((a) => a.href);
  const pick = hrefs.find((h) => /~medium\.jpg$/i.test(h)) || hrefs.find((h) => /~large\.jpg$/i.test(h)) || hrefs.find((h) => /~orig\.jpg$/i.test(h)) || hrefs.find((h) => /\.jpg$/i.test(h));
  if (!pick) { console.log("NO JPG", id, hrefs); continue; }
  const buf = Buffer.from(await (await fetch(pick.replace(/^http:/, "https:").replace(/ /g, "%20"))).arrayBuffer());
  const local = `public/nasa/${d.nasa_id.replace(/[^\w.-]/g, "_")}.jpg`;
  fs.writeFileSync(local, buf);
  const rec = {
    nasa_id: d.nasa_id, title: d.title, date: (d.date_created || "").slice(0, 10), center: d.center || "",
    credit: d.photographer || d.secondary_creator || (d.center ? `NASA/${d.center}` : "NASA"),
    source_url: `https://images.nasa.gov/details/${d.nasa_id}`, local_path: "/" + local.replace(/^public\//, ""),
    description: d.description || "", alt: d.title, status: "verified",
  };
  const i = reg.findIndex((r) => r.nasa_id === rec.nasa_id);
  if (i >= 0) reg[i] = { ...reg[i], ...rec, alt: reg[i].alt || rec.alt }; else reg.push(rec);
  console.log(`OK ${d.nasa_id} ${buf.length}b | ${rec.date} | ${rec.credit} | ${d.title}\n   ${(d.description || "").slice(0, 330)}`);
}
fs.writeFileSync(out, JSON.stringify(reg, null, 2));
