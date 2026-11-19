// gta6-meme-x-01 entrypoint (Node 22, standard library only).
//
// The entry itself is the X post: a GTA 6 meme whose picture shows make.fun's
// ghost mascot, posted from a public account. This program does exactly one
// thing — it carries the post's address from the repository into the grader's
// output directory so the house can read the post from X and judge it.
//
//   POST.json (repo root)  ->  <output>/POST.json
//
// POST.json holds {"url": "https://x.com/<handle>/status/<id>"}. The
// placeholder that ships here is not a real post, so the gate refuses it
// until the post is live and its address is written in.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// No network, no clock, no files outside the repository: the two runs the
// grader makes write byte-identical output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repoDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(repoDir, "POST.json");
const target = join(outDir, "POST.json");

let postBytes: Buffer;
try {
  postBytes = readFileSync(source);
} catch (err) {
  console.error(`could not read ${source}: ${(err as Error).message}`);
  process.exit(1);
}

// A post address is a JSON object with a url string; refuse anything else
// rather than handing the gate a malformed file.
let parsed: unknown;
try {
  parsed = JSON.parse(postBytes.toString("utf8"));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== "string"
) {
  console.error("POST.json must be an object with a string url field");
  process.exit(1);
}
// NOTE: no shape check on the url itself here. The placeholder that ships
// in this repo (https://x.com/<handle>/status/<id>) is not a real post and
// the gate refuses it as it stands — that is on purpose, since a placeholder
// that passed would need no post at all. The house validates the address
// against X when the entry is graded.

mkdirSync(outDir, { recursive: true });
writeFileSync(target, postBytes);
