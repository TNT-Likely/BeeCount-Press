import {readFile, writeFile, mkdir, lstat} from 'node:fs/promises';
import {resolve, dirname, relative} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const options = {};
for (const arg of process.argv.slice(2)) {
  const match = /^--(origin|output)=(.+)$/.exec(arg);
  if (!match || options[match[1]]) throw Error(`Unknown or duplicate argument: ${arg}`);
  options[match[1]] = match[2];
}
const origin = new URL(options.origin || 'http://127.0.0.1:8766');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname) || origin.pathname !== '/' || !['http:', 'https:'].includes(origin.protocol)) throw Error('Use a local Press server origin');
const output = resolve(options.output || resolve(root, 'output'));
if (!relative(root, output) || relative(root, output).startsWith('..')) throw Error('Output must be a subdirectory of xhs-v4');
for (let current = output; current !== root; current = dirname(current)) {
  const info = await lstat(current).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (info?.isSymbolicLink()) throw Error('Symlink output paths are refused');
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const rawRoot = resolve(root, '../store/v4/raw');
const rawManifest = JSON.parse(await readFile(resolve(rawRoot, 'manifest.json')));
const names = ['01-home', '02-analytics', '03-accounts', '04-ledgers', '05-transaction', '06-budgets'];
const sources = [];
for (const mode of ['light', 'dark']) for (const name of names) {
  const path = `ios/zh/${mode}/${name}.png`;
  const bytes = await readFile(resolve(rawRoot, path));
  const entry = rawManifest.files.find(file => file.path === path);
  if (!entry || entry.sha256 !== sha(bytes) || bytes.readUInt32BE(16) !== 1320 || bytes.readUInt32BE(20) !== 2868) throw Error(`Source differs from validated native capture: ${path}`);
  sources.push({path, sha256: sha(bytes)});
}
const playwright = await import(process.env.BEECOUNT_PLAYWRIGHT_MODULE ? pathToFileURL(resolve(process.env.BEECOUNT_PLAYWRIGHT_MODULE)) : 'playwright');
const browser = await playwright.chromium.launch({channel: 'chrome', headless: true});
const files = []; const layouts = []; const errors = [];
try {
  await mkdir(output, {recursive: true});
  for (const [index, mode] of ['light', 'dark'].entries()) {
    const page = await browser.newPage({viewport: {width: 1440, height: 1920}, deviceScaleFactor: 1});
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(request.url()));
    const cdp = await page.context().newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    await page.goto(`${origin.origin}/projects/beecount/xhs-v4/?mode=${mode}&export=1`, {waitUntil: 'networkidle'});
    const ready = await page.evaluate(() => window.posterReady);
    const layout = await page.evaluate(() => {
      const poster = document.getElementById('poster'); const title = poster.querySelector('.poster-title');
      const tr = title.getBoundingClientRect(); const range = document.createRange(); range.selectNodeContents(title); const gr = range.getBoundingClientRect();
      const images = [...poster.querySelectorAll('.screen img')];
      const screens = images.map(image => {const r = image.getBoundingClientRect(); return {source: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, left:r.left, top:r.top, right:r.right, bottom:r.bottom};});
      return {width:poster.offsetWidth, height:poster.offsetHeight, title:title.textContent, font:getComputedStyle(title).fontFamily, weight:getComputedStyle(title).fontWeight, titleFits:gr.left>=tr.left && gr.right<=tr.right && gr.top>=tr.top && gr.bottom<=tr.bottom && title.scrollWidth<=title.clientWidth, headlineClear:screens.every(r=>r.top>tr.bottom+24), sourceAspectRatiosUnchanged:images.every(image=>Math.abs(image.offsetWidth/image.offsetHeight-1320/2868)<.001), screenshots:screens, angle:getComputedStyle(poster.querySelector('.wall')).transform};
    });
    if (ready.screenshots !== 6 || layout.width !== 1440 || layout.height !== 1920 || !layout.titleFits || !layout.headlineClear || !layout.sourceAspectRatiosUnchanged || layout.weight !== '700') throw Error(`Invalid layout: ${JSON.stringify(layout)}`);
    const {root: documentRoot} = await cdp.send('DOM.getDocument');
    const {nodeId} = await cdp.send('DOM.querySelector', {nodeId:documentRoot.nodeId, selector:'.poster-title'});
    const fonts = (await cdp.send('CSS.getPlatformFontsForNode', {nodeId})).fonts;
    if (!fonts.length || !fonts.every(font => font.isCustomFont && font.postScriptName === 'SourceHanSansSC-Bold')) throw Error('Expected bundled upright Source Han Sans SC Bold');
    if (errors.length) throw Error(JSON.stringify(errors));
    for (const type of ['png', 'jpeg']) {
      const bytes = await page.locator('#poster').screenshot({type, ...(type==='jpeg'?{quality:96}:{}), animations:'disabled'});
      const path = `${String(index+1).padStart(2,'0')}-tilted-pages-${mode}.${type==='jpeg'?'jpg':'png'}`;
      await writeFile(resolve(output,path),bytes);
      if (sha(await readFile(resolve(output,path)))!==sha(bytes)) throw Error('Output hash readback failed');
      files.push({path, mode, width:1440, height:1920, bytes:bytes.length, sha256:sha(bytes)});
    }
    await page.close();
    layouts.push({mode,...layout,fonts}); console.log(`${mode}: 3:4 tilted collage exported`);
  }
  for (const source of sources) if (sha(await readFile(resolve(rawRoot,source.path)))!==source.sha256) throw Error('Native source changed during render');
  await writeFile(resolve(output,'manifest.json'),JSON.stringify({kind:'xiaohongshu-tilted-native-screens',ratio:'3:4',font:'Source Han Sans SC Bold',sourcePlatform:'ios',sourceLocale:'zh',nativeSourcesUnchanged:true,sources,files},null,2)+'\n');
  await writeFile(resolve(output,'validation.json'),JSON.stringify({ok:true,count:files.length,originalNativeSourcesChecked:sources.length,noRuntimeErrors:true,headlinesClearOfScreens:true,layouts},null,2)+'\n');
  await writeFile(resolve(output,'SHA256SUMS'),files.map(file=>`${file.sha256}  ${file.path}\n`).join(''));
  console.log(`Saved ${files.length} images to ${output}`);
} finally { await browser.close(); }
