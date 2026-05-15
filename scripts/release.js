#!/usr/bin/env node
// ──────────────────────────────────────────────────────────
// Monorepo release helper
// Usage:  node scripts/release.js <json|xml> <patch|minor|major>
//
// Steps performed:
//   1. Validate clean working tree
//   2. Run npm version (--no-git-tag-version) inside the package
//      – preversion hook runs tests + compile
//   3. Sync root package-lock.json
//   4. git add + commit + tag + push
//
// Why this exists:
//   npm version inside a workspace sub-package doesn't stage the root
//   package-lock.json, so the auto-commit either fails or leaves the
//   version bump uncommitted. This script handles everything in one
//   reliable flow.
// ──────────────────────────────────────────────────────────
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const PACKAGES = {
  json: { dir: 'packages/json-tree-size', name: 'JSON Tree Size', tagPrefix: 'json-v' },
  xml:  { dir: 'packages/xml-tree-size',  name: 'XML Tree Size',  tagPrefix: 'xml-v' },
};

const [format, bump] = process.argv.slice(2);

if (!PACKAGES[format] || !['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: node scripts/release.js <json|xml> <patch|minor|major>');
  process.exit(1);
}

const pkg = PACKAGES[format];

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

// 1. Ensure clean working tree
const status = execSync('git status --porcelain').toString().trim();
if (status) {
  console.error('\n✖ Working tree is not clean. Commit or stash changes first.\n');
  console.error(status);
  process.exit(1);
}

// 2. Bump version (preversion hook runs tests + compile)
run(`npm --prefix ${pkg.dir} run release:${bump}`);

// 3. Read the new version
const newVersion = require(path.resolve(pkg.dir, 'package.json')).version;
const tag = `${pkg.tagPrefix}${newVersion}`;

console.log(`\n✔ Version bumped to ${newVersion}`);

// 4. Sync root lock file
run('npm install --package-lock-only');

// 5. Stage, commit, tag, push
run(`git add ${pkg.dir}/package.json package-lock.json`);
run(`git commit -m "Release ${pkg.name} ${newVersion}"`);
run(`git tag ${tag}`);
run('git push');
run('git push --tags');

console.log(`\n✔ Released ${pkg.name} ${newVersion} (tag: ${tag})`);
console.log('  GitHub Actions will publish to the Marketplace automatically.\n');
