const esbuild = require('esbuild');
const fs = require('node:fs/promises');
const path = require('node:path');

const watch = process.argv.includes('--watch');
const packageRoot = __dirname;
const distDir = path.join(packageRoot, 'dist');

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyFile(from, to) {
  await ensureDir(path.dirname(to));
  await fs.copyFile(from, to);
}

async function writeStaticFiles() {
  await ensureDir(path.join(distDir, 'assets'));
  await copyFile(path.join(packageRoot, 'src', 'index.html'), path.join(distDir, 'index.html'));
  await copyFile(
    path.join(packageRoot, '..', 'json-tree-size', 'docs', 'icon.png'),
    path.join(distDir, 'assets', 'json-icon.png')
  );
  await copyFile(
    path.join(packageRoot, '..', 'xml-tree-size', 'docs', 'icon.svg'),
    path.join(distDir, 'assets', 'xml-icon.svg')
  );
  await copyFile(
    path.join(packageRoot, '..', 'json-tree-size', 'docs', 'demo.json'),
    path.join(distDir, 'assets', 'demo.json')
  );
  await copyFile(
    path.join(packageRoot, '..', 'xml-tree-size', 'docs', 'demo.xml'),
    path.join(distDir, 'assets', 'demo.xml')
  );
  await fs.writeFile(path.join(distDir, '.nojekyll'), '', 'utf8');
}

const staticAssetsPlugin = {
  name: 'static-assets',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) {
        return;
      }
      await writeStaticFiles();
    });
  },
};

const buildOptions = {
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: 'browser',
  format: 'iife',
  outbase: 'src',
  outdir: 'dist',
  entryNames: '[dir]/[name]',
  entryPoints: [
    'src/site.ts',
    'src/workers/json-worker.ts',
    'src/workers/xml-worker.ts',
  ],
  plugins: [staticAssetsPlugin],
};

async function run() {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('watching tree-size-preview...');
    return;
  }

  await esbuild.build(buildOptions);
}

run().catch(() => process.exit(1));