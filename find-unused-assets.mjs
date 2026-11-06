// List .glb / .hdr files under public/ that are NOT referenced by any active
// (non-commented) entry in models.config.js. Nothing is deleted.
//
// Usage (from project root):
//   node find-unused-assets.mjs [path/to/models.config.js] [publicDir]
//   node find-unused-assets.mjs [config] [publicDir] --move <archiveDir>
//
// --move relocates unused files to <archiveDir>, preserving the folder
// structure relative to publicDir, so they can be restored at any time.

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const moveIdx = args.indexOf('--move');
const archiveDir = moveIdx !== -1 ? args[moveIdx + 1] : null;
if (moveIdx !== -1) {
  if (!archiveDir) {
    console.error('--move requires a target directory');
    process.exit(1);
  }
  args.splice(moveIdx, 2);
}

const configPath = args[0] || 'src/config/models.config.js';
const publicDir  = args[1] || 'public';

if (!fs.existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}

// Drop commented-out lines so disabled models don't count as "used"
const activeSource = fs.readFileSync(configPath, 'utf8')
  .split(/\r?\n/)
  .filter(line => !line.trim().startsWith('//'))
  .join('\n');

// Collect referenced asset basenames (glb + hdr)
const used = new Set();
for (const m of activeSource.matchAll(/['"]([^'"]+\.(?:glb|hdr))['"]/gi)) {
  used.add(path.basename(m[1]).toLowerCase());
}

// Walk public/ recursively
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const assets = walk(publicDir).filter(f => /\.(glb|hdr)$/i.test(f));

let usedMB = 0, unusedMB = 0;
const unused = [];
for (const file of assets) {
  const mb = fs.statSync(file).size / (1024 * 1024);
  if (used.has(path.basename(file).toLowerCase())) {
    usedMB += mb;
  } else {
    unusedMB += mb;
    unused.push({ file, mb });
  }
}

unused.sort((a, b) => b.mb - a.mb);

console.log(`\nUnused assets (${unused.length}):`);
for (const { file, mb } of unused) {
  console.log(`  ${mb.toFixed(1).padStart(8)} MB  ${file}`);
}

// Referenced but missing on disk (would fail to load on the live site)
const onDisk = new Set(assets.map(f => path.basename(f).toLowerCase()));
const missing = [...used].filter(n => !onDisk.has(n));

console.log(`\nUsed assets total : ${usedMB.toFixed(1)} MB`);
console.log(`Unused total      : ${unusedMB.toFixed(1)} MB`);
if (missing.length) {
  console.log(`\nReferenced in config but NOT found in ${publicDir}/:`);
  missing.forEach(n => console.log(`  ${n}`));
}

// Optional: move unused files out of the project
if (archiveDir) {
  console.log(`\nMoving ${unused.length} unused files to ${archiveDir} ...`);
  for (const { file } of unused) {
    const target = path.join(archiveDir, path.relative(publicDir, file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    try {
      fs.renameSync(file, target);
    } catch (err) {
      // rename fails across drives (EXDEV): fall back to copy + delete
      if (err.code !== 'EXDEV') throw err;
      fs.copyFileSync(file, target);
      fs.unlinkSync(file);
    }
    console.log(`  moved  ${file}`);
  }
  console.log('Done. Run "npm run build" and redeploy.');
} else if (unused.length) {
  console.log(`\nTo move them out of the project, re-run with:  --move <archiveDir>`);
}
