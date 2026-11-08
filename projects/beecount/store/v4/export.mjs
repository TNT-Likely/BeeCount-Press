import { mkdir, writeFile, readFile, lstat, readdir } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { THEMES, FORMATS, LANGUAGES, MODES, exportJobs } from './store-data.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const help = `BeeCount v4 store artwork — local Chrome / Playwright element screenshots

Run from the Press repository root:
  BEECOUNT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \\
    node projects/beecount/store/v4/export.mjs \\
    --origin=http://127.0.0.1:8765 \\
    --output=./projects/beecount/store/v4/output-final

Default: 12 scenes × 2 languages × 2 platforms × 2 appearances + 2 Play features = 98 PNGs.
Filters accept comma-separated values:
  --platform=ios,android,feature  --lang=zh,en  --mode=light,dark
  --scene=05-transaction,10-categories
Feature always uses the matching language's Android light sources, once per language.
--scene filters portrait screenshots, not the feature graphic; omit feature from --platform
when exporting only selected scenes.

Output must be a separate directory inside v4. Existing directories are refused.
--overwrite replaces ONLY this invocation's planned PNGs, manifest.json,
validation.json and SHA256SUMS. No directory is deleted; unrelated files stay intact.
raw/, media/, assets/ and the old output/ are always protected.
`;
const options = {};
for (const arg of process.argv.slice(2)) {
  if (arg === '--help') { console.log(help); process.exit(0); }
  if (arg === '--overwrite') { options.overwrite = true; continue; }
  const match = /^--(origin|output|platform|lang|mode|scene)=(.+)$/.exec(arg);
  if (!match || Object.hasOwn(options, match[1])) throw new Error(`Unknown or duplicate option: ${arg}\nUse --help.`);
  options[match[1]] = match[2];
}
function selection(name, allowed) {
  const values = options[name] ? options[name].split(',') : allowed;
  if (!values.length || values.some(value => !allowed.includes(value)) || new Set(values).size !== values.length) {
    throw new Error(`Invalid --${name}. Allowed values: ${allowed.join(',')}`);
  }
  return values;
}
const selections = {
  platforms: selection('platform', Object.keys(FORMATS)),
  languages: selection('lang', LANGUAGES),
  modes: selection('mode', MODES),
  scenes: selection('scene', THEMES.map(theme => theme.id)),
};
const jobs = exportJobs(selections);
const origin = new URL(options.origin || 'http://127.0.0.1:8765');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname) || !['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('Use a local Press server origin, e.g. --origin=http://127.0.0.1:8765');
}
const output = resolve(options.output || resolve(root, 'output-final'));
const outputRelative = relative(root, output);
if (!outputRelative || outputRelative === '..' || outputRelative.startsWith(`..${sep}`) || ['raw', 'media', 'assets', 'output'].includes(outputRelative.split(sep)[0])) {
  throw new Error('Output must be a separate directory inside v4, not raw/, media/, assets/ or the old output/.');
}
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
async function exists(file) {
  try { return await lstat(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function assertNoSymlink(file) {
  const parts = relative(root, file).split(sep);
  let current = root;
  for (const part of parts) {
    current = resolve(current, part);
    const info = await exists(current);
    if (info?.isSymbolicLink()) throw new Error(`Refusing symlink in output path: ${current}`);
  }
}
const existingOutput = await exists(output);
if (existingOutput && !options.overwrite) throw new Error(`Output exists; choose a new directory. Use --overwrite explicitly to replace only known files: ${output}`);
if (existingOutput && !existingOutput.isDirectory()) throw new Error('Output is not a directory');
const knownFiles = [...jobs.map(job => job.path), 'manifest.json', 'validation.json', 'SHA256SUMS'];
for (const name of knownFiles) await assertNoSymlink(resolve(output, name));

function pngDimensions(bytes, label) {
  if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.subarray(12, 16).toString('ascii') !== 'IHDR') throw new Error(`Not a PNG: ${label}`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
// Inventory every expected native source before opening Chrome. No fallback exists.
const allNativeJobs = exportJobs({ platforms: ['ios', 'android'] });
const sourceMap = new Map();
const providedManifest = JSON.parse(await readFile(resolve(root, 'raw/manifest.json'), 'utf8'));
for (const job of allNativeJobs) {
  const source = job.raw[0];
  const bytes = await readFile(resolve(root, source));
  const dimensions = pngDimensions(bytes, source);
  if (dimensions.width !== job.width || dimensions.height !== job.height) throw new Error(`Native source has wrong dimensions: ${source}`);
  const entry = { path: source, ...dimensions, bytes: bytes.length, sha256: sha256(bytes) };
  const provided = providedManifest.files.find(file => `raw/${file.path}` === source);
  if (!provided || provided.sha256 !== entry.sha256 || provided.width !== entry.width || provided.height !== entry.height) throw new Error(`Source differs from raw/manifest.json: ${source}`);
  sourceMap.set(source, entry);
}
if (sourceMap.size !== 96) throw new Error(`Expected 96 independent native sources; found ${sourceMap.size}`);

let playwright;
try {
  playwright = await import(process.env.BEECOUNT_PLAYWRIGHT_MODULE ? pathToFileURL(resolve(process.env.BEECOUNT_PLAYWRIGHT_MODULE)).href : 'playwright');
} catch (error) {
  throw new Error('Install Playwright in your tool environment, or set BEECOUNT_PLAYWRIGHT_MODULE to its index.mjs. The gallery needs no npm dependencies.', { cause: error });
}
let serverCheck;
try {
  serverCheck = await fetch(new URL('/projects/beecount/store/v4/store-data.mjs', origin), { signal: AbortSignal.timeout(10_000) });
} catch (error) {
  throw new Error(`Press preview server is unavailable at ${origin.origin}. Restore the existing preview_start server and retry; no output directory has been created.`, { cause: error });
}
if (!serverCheck.ok) throw new Error(`Press preview server returned ${serverCheck.status}. Start the existing preview configuration; this exporter never starts a server.`);
const browser = await playwright.chromium.launch({ channel: 'chrome', headless: true });
const images = [];
const fontFamilies = new Set();
const runtimeErrors = [];
const failedRequests = [];
let minTextToScreenshotGap = Infinity;
let cdp;
try {
  const page = await browser.newPage({ deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page.on('pageerror', error => runtimeErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
  page.on('requestfailed', request => failedRequests.push(`${request.url()} ${request.failure()?.errorText}`));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === origin.origin || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
    runtimeErrors.push(`Unexpected external dependency: ${url.href}`);
    return route.abort();
  });
  cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  await mkdir(output, { recursive: true });
  let lastGroup;
  for (const job of jobs) {
    const group = `${job.platform}/${job.lang}/${job.mode}`;
    if (group !== lastGroup) {
      await page.setViewportSize({ width: job.width, height: job.height });
      const url = new URL('/projects/beecount/store/v4/', origin);
      url.search = new URLSearchParams({ platform: job.platform, lang: job.lang, mode: job.mode, scene: 'all', export: '1' });
      await page.goto(url.href, { waitUntil: 'networkidle', timeout: 20_000 });
      await page.waitForFunction(() => window.BeeCountStore && window.storeReady, null, { timeout: 10_000 });
      const ready = await page.evaluate(() => window.storeReady);
      if (!ready.ok) throw new Error(`Missing images: ${ready.missing.join(', ')}`);
      const count = await page.evaluate(() => window.BeeCountStore.totalCount);
      if (count !== 98) throw new Error(`Gallery/exporter mismatch: ${count}`);
      lastGroup = group;
    }
    await page.evaluate(scene => window.BeeCountStore.selectScene(scene), job.scene);
    const layout = await page.evaluate(scene => window.BeeCountStore.validatePoster(scene), job.scene);
    if (!layout.ok || !layout.noSimulatedDeviceFrames) throw new Error(`Invalid or framed layout: ${group}/${job.scene}\n${JSON.stringify(layout.issues)}`);
    const selector = `.poster[data-scene="${job.scene}"]`;
    const { root: documentRoot } = await cdp.send('DOM.getDocument');
    const fonts = [];
    for (const text of layout.texts) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: documentRoot.nodeId, selector: `${selector} [data-font-node="${text.node}"]` });
      const result = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      if (!result.fonts.length || result.fonts.some(font => font.glyphCount < 1 || /lastresort|times new roman/i.test(font.familyName))) throw new Error(`Missing or unexpected font glyphs: ${job.path} ${text.text}`);
      for (const font of result.fonts) fontFamilies.add(font.familyName);
      fonts.push({ text: text.text, fonts: result.fonts.map(({ familyName, postScriptName, isCustomFont, glyphCount }) => ({ familyName, postScriptName, isCustomFont, glyphCount })) });
    }
    if (runtimeErrors.length || failedRequests.length) throw new Error(`Browser errors: ${JSON.stringify({ runtimeErrors, failedRequests })}`);
    const png = await page.locator(selector).screenshot({ animations: 'disabled', type: 'png', scale: 'css' });
    const dimensions = pngDimensions(png, job.path);
    if (dimensions.width !== job.width || dimensions.height !== job.height) throw new Error(`Export dimensions do not match: ${job.path}`);
    const target = resolve(output, job.path);
    await assertNoSymlink(target);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, png, { flag: options.overwrite ? 'w' : 'wx' });
    minTextToScreenshotGap = Math.min(minTextToScreenshotGap, layout.textToScreenshotGap);
    images.push({
      path: job.path, kind: job.kind, platform: job.platform, language: job.lang, appearance: job.mode,
      scene: job.scene, width: job.width, height: job.height, bytes: png.length, sha256: sha256(png),
      copy: job.copy, raw: job.raw.map(source => sourceMap.get(source)),
      checks: { missing: 0, overlaps: 0, clipped: 0, noSimulatedDeviceFrames: true, textToScreenshotGap: layout.textToScreenshotGap, fonts },
    });
    console.log(`${images.length}/${jobs.length} ${job.path}`);
  }
  // Confirm this run did not alter even one byte of any raw screenshot.
  for (const source of sourceMap.values()) {
    if (sha256(await readFile(resolve(root, source.path))) !== source.sha256) throw new Error(`Raw source changed during export: ${source.path}`);
  }
  // Read back each final image, rather than trusting the write or screenshot call.
  for (const image of images) {
    const actual = await readFile(resolve(output, image.path));
    if (sha256(actual) !== image.sha256) throw new Error(`Output checksum changed: ${image.path}`);
  }
  const count = { screenshots: images.filter(image => image.kind === 'screenshot').length, featureGraphics: images.filter(image => image.kind === 'feature').length, total: images.length };
  const validation = {
    schemaVersion: 1, ok: true, count, nativeSourcesChecked: sourceMap.size,
    missing: [], overlaps: [], clipped: [], fontErrors: [], runtimeErrors, failedRequests,
    minTextToScreenshotGap, fontFamilies: [...fontFamilies].sort(),
    sourceHashesUnchanged: true, outputHashesReadBack: true,
    noCrossPlatformFallback: true, nativeScreenshotsUncropped: true, noSimulatedDeviceFrames: true,
  };
  const manifest = {
    schemaVersion: 3, kind: 'beecount-v4-store-artwork', generatedAt: new Date().toISOString(),
    renderer: `Chrome ${browser.version()} / Playwright`, origin: origin.origin, count,
    themeCount: THEMES.length, selections, nativeScreenshotsUncropped: true, noSimulatedDeviceFrames: true,
    featureSources: 'Android light only, matching language', images,
  };
  for (const [name, content] of [
    ['manifest.json', `${JSON.stringify(manifest, null, 2)}\n`],
    ['validation.json', `${JSON.stringify(validation, null, 2)}\n`],
    ['SHA256SUMS', `${images.map(image => `${image.sha256}  ${image.path}`).join('\n')}\n`],
  ]) {
    await assertNoSymlink(resolve(output, name));
    await writeFile(resolve(output, name), content, { flag: options.overwrite ? 'w' : 'wx' });
  }
  const untouched = existingOutput ? (await readdir(output)).filter(name => !knownFiles.some(file => file.split('/')[0] === name)) : [];
  console.log(`Exported ${count.total} PNGs: ${count.screenshots} screenshots + ${count.featureGraphics} Play features.`);
  console.log(`Missing 0 / overlap 0 / clipped 0 / font errors 0. Sources unchanged: ${sourceMap.size}.`);
  console.log(`Manifest and SHA256SUMS: ${output}`);
  if (untouched.length) console.log(`Unrelated output entries left untouched: ${untouched.join(', ')}`);
} finally {
  await cdp?.detach().catch(() => {});
  await browser.close();
}
