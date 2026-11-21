// Twin Worlds — a spot the difference game (Node 22, standard library only). The
// game is this directory's game/ folder: plain static files a desktop browser loads
// offline (game/index.html and its ES modules, no library and no network request).
// This program hands it in: it copies game/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Before it copies anything it checks the entry against the scorer's caps, so a
// broken hand-in fails here with a clear message instead of at the gate: game/ must
// hold game/index.html at most 1 MiB, at most 993 files and 48 MiB in all, and
// screenshots/ must hold 3 or 4 images, each at most 256 KiB.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GAME_MAX_FILES = 993;
const GAME_MAX_BYTES = 50331648;
const INDEX_MAX_BYTES = 1048576;
const SHOTS_MAX = 4;
const SHOTS_MIN = 3;
const SHOT_MAX_BYTES = 262144;

function fail(message) {
  throw new Error(`main.ts: ${message}`);
}

function countFiles(dir) {
  let files = 0;
  let bytes = 0;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) {
      const sub = countFiles(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (name.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

// Pre-flight: the entry must be within the scorer's caps before it is copied.
const gameDir = join(here, 'game');
const indexPath = join(gameDir, 'index.html');
if (!existsSync(indexPath)) fail('game/index.html is missing');
if (statSync(indexPath).size > INDEX_MAX_BYTES) fail('game/index.html is over 1 MiB');
const gameTotals = countFiles(gameDir);
if (gameTotals.files > GAME_MAX_FILES) fail(`game/ has ${gameTotals.files} files, over the 993 cap`);
if (gameTotals.bytes > GAME_MAX_BYTES) fail(`game/ is ${gameTotals.bytes} bytes, over the 48 MiB cap`);
const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shotNames = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
if (shotNames.length < SHOTS_MIN || shotNames.length > SHOTS_MAX) {
  fail(`screenshots/ has ${shotNames.length} images, need ${SHOTS_MIN}-${SHOTS_MAX}`);
}
for (const name of shotNames) {
  const size = statSync(join(shotsDir, name)).size;
  if (size > SHOT_MAX_BYTES) fail(`screenshots/${name} is ${size} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse, and were checked above.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

if (!existsSync(join(out, 'dossier.json'))) fail('dossier.json was not written');
console.log(`Twin Worlds handed in: ${gameTotals.files} game files, ${shotNames.length} screenshots, dossier written.`);
