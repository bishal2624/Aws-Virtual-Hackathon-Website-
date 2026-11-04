import fs from 'fs';
import path from 'path';

// Internal link checker: verifies that every static hash link in src/ has a
// matching element id in the source tree. Dynamic expressions are skipped.
const srcDir = path.resolve('src');
const extensions = new Set(['.js', '.jsx', '.html']);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

if (!fs.existsSync(srcDir)) {
  console.error('[FAIL] src/ directory does not exist.');
  process.exit(1);
}

const files = walk(srcDir);
const ids = new Set();
const anchors = [];
const idPattern = /\bid=["']([^"'{}]+)["']/g;
const hrefPattern = /\bhref=["']#([^"'{}]+)["']/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(idPattern)) {
    ids.add(match[1]);
  }
  for (const match of content.matchAll(hrefPattern)) {
    anchors.push({ id: match[1], file: path.relative(process.cwd(), file) });
  }
}

console.log(`Validating ${anchors.length} internal anchor link(s) across ${files.length} source file(s)...`);

let failures = 0;
const reported = new Set();
for (const anchor of anchors) {
  if (anchor.id === '') continue;
  if (!ids.has(anchor.id)) {
    const key = `${anchor.file}#${anchor.id}`;
    if (!reported.has(key)) {
      console.error(`[FAIL] Missing anchor target #${anchor.id} referenced in ${anchor.file}`);
      reported.add(key);
      failures++;
    }
  }
}

// Required primary navigation anchors must exist even if no static href remains.
const requiredIds = ['hero', 'gate', 'laboratory', 'chambers', 'chronicles', 'judges', 'vault', 'alliance', 'faq'];
for (const id of requiredIds) {
  if (!ids.has(id)) {
    console.error(`[FAIL] Required section anchor #${id} is missing from the source tree.`);
    failures++;
  }
}

if (failures > 0) {
  console.error(`\nInternal link check failed with ${failures} missing target(s).`);
  process.exit(1);
}

console.log('All internal anchor links validated successfully.');
process.exit(0);
