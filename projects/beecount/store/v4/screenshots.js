'use strict';
import { THEMES, FORMATS, LANGUAGES, MODES, FEATURE_COPY, makeJob } from './store-data.mjs';

const params = new URLSearchParams(location.search);
const exportMode = params.get('export') === '1';
const controls = Object.fromEntries(['platform', 'lang', 'mode', 'scene'].map(key => [key, document.getElementById(key)]));
const cards = document.getElementById('cards');
const status = document.getElementById('status');
const totalCount = THEMES.length * 2 * 2 * 2 + 2;
let resizeObserver;
let renderVersion = 0;
const ui = {
  zh: {
    heading: 'BeeCount v4 商店素材',
    intro: '12 个真实界面，中文与英文、iOS 与 Android、浅色与深色完整对应。延续蜂蜜渐变与居中标题，完整原生截图直接展示，不加模拟手机框，不裁切，不跨平台借图。',
    readme: '使用说明', platform: '平台', language: '语言', appearance: '外观', scene: '主题',
    download: '下载当前清单', allScenes: '全部 12 个主题', featureScene: 'Play 横版宣传图',
    exportHelp: '批量导出与预览说明',
    exportIntro: '页面不依赖 CDN。PNG 由 Node + Playwright 使用本机 Chrome 按元素截图，下面的按钮复制命令，不会在浏览器中重绘原图。',
    copyCurrent: '复制当前筛选导出命令', copyAll: '复制全部 98 张导出命令',
    commandLabel: '在 Press 仓库根目录运行；如未安装 Playwright，请先设置 BEECOUNT_PLAYWRIGHT_MODULE。',
    outputNote: '输出目录默认拒绝覆盖。Play feature 固定使用 Android 浅色原图，只按语言导出两张；12 个主题是完整候选素材集，可按商店名额挑选上传。',
    source: '查看原图', homeSource: '首页原图', analyticsSource: '统计原图',
    featureNote: 'Play feature 使用本语言的 Android 浅色首页与统计原图，不使用 iOS 图片。',
    deviceNote: '画面来自独立模拟器的合成数据；完整原生截图直接展示，无模拟手机框，不裁切。',
    loading: '正在核对原图…', copied: '导出命令已复制。请在 Press 仓库根目录运行。',
    copyFallback: '浏览器未允许复制。命令已选中，请手动复制。',
    missing: '原图载入失败，不使用替代图：',
  },
  en: {
    heading: 'BeeCount v4 store artwork',
    intro: '12 real screens in Chinese and English, for iOS and Android, in light and dark. Honey gradients and centered headlines continue the original artwork. Native screenshots are shown whole, without device mockups.',
    readme: 'Instructions', platform: 'Platform', language: 'Language', appearance: 'Appearance', scene: 'Scene',
    download: 'Download current manifest', allScenes: 'All 12 scenes', featureScene: 'Play feature graphic',
    exportHelp: 'Batch export and preview',
    exportIntro: 'This page has no CDN dependencies. Node + Playwright captures each element in local Chrome. The buttons copy terminal commands; the browser does not redraw the source screenshots.',
    copyCurrent: 'Copy filtered export command', copyAll: 'Copy all 98 exports command',
    commandLabel: 'Run from the Press repository root. Set BEECOUNT_PLAYWRIGHT_MODULE first if Playwright is not installed in your tool environment.',
    outputNote: 'Existing output directories are refused by default. Play feature uses Android light sources, once per language. All 12 scenes are provided as candidates; select uploads to fit each store’s limits.',
    source: 'Source image', homeSource: 'Home source', analyticsSource: 'Analytics source',
    featureNote: 'Play feature uses the matching language’s Android light home and analytics sources, never iOS images.',
    deviceNote: 'Real isolated-simulator screens with synthetic data. Complete native screenshots, with no simulated device frame.',
    loading: 'Checking source images…', copied: 'Export command copied. Run it from the Press repository root.',
    copyFallback: 'Clipboard access was not available. The command is selected for manual copying.',
    missing: 'Source failed to load. No substitute image is used: ',
  },
};

for (const [key, values] of Object.entries({ platform: Object.keys(FORMATS), lang: LANGUAGES, mode: MODES })) {
  if (values.includes(params.get(key))) controls[key].value = params.get(key);
}

function textNode(tag, className, text, check = false) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  if (check) node.dataset.checkText = '';
  return node;
}

function addDecorations(poster) {
  for (const name of ['honey-glow-one', 'honey-glow-two', 'honey-glow-three']) {
    const node = document.createElement('span');
    node.className = `honey-glow ${name}`;
    node.setAttribute('aria-hidden', 'true');
    poster.append(node);
  }
  for (const name of ['spark-one', 'spark-two', 'spark-three']) {
    const node = document.createElement('span');
    node.className = `spark ${name}`;
    node.setAttribute('aria-hidden', 'true');
    poster.append(node);
  }
}

function addScreenshot(poster, { source, width, left, top, alt, name }) {
  // Position the entire native image directly. There is no simulated device,
  // border, rounded mask, added notch or outer shadow.
  const sourcePlatform = poster.dataset.platform === 'feature' ? 'android' : poster.dataset.platform;
  const native = FORMATS[sourcePlatform];
  const height = width * native.height / native.width;
  const surface = document.createElement('div');
  surface.className = `screenshot-surface ${name || ''}`;
  Object.assign(surface.style, { width: `${width}px`, height: `${height}px`, left: `${left}px`, top: `${top}px` });
  const image = document.createElement('img');
  image.className = 'native-image';
  image.src = source;
  image.alt = alt;
  image.draggable = false;
  image.width = native.width;
  image.height = native.height;
  Object.assign(image.style, { width: `${width}px`, height: `${height}px` });
  surface.append(image);
  poster.append(surface);
}

function buildPoster(job) {
  const poster = document.createElement('article');
  poster.className = 'poster';
  Object.assign(poster.dataset, { scene: job.scene, platform: job.platform, lang: job.lang, mode: job.mode, kind: job.kind });
  Object.assign(poster.style, { width: `${job.width}px`, height: `${job.height}px` });
  poster.setAttribute('aria-label', job.copy.title || job.copy.tagline);
  if (job.kind === 'feature') {
    poster.classList.add('card-feature');
    const copy = FEATURE_COPY[job.lang];
    const zone = document.createElement('div');
    zone.className = 'feature-content-zone';
    const logoRow = document.createElement('div');
    logoRow.className = 'feature-logo-row';
    const logo = document.createElement('img');
    logo.className = 'feature-logo';
    logo.src = 'assets/logo.png';
    logo.alt = '';
    logo.width = 68;
    logo.height = 68;
    const stack = document.createElement('div');
    stack.className = 'feature-brand-stack';
    stack.append(textNode('h1', 'feature-brand', copy.brand, true), textNode('p', 'feature-brand-sub', copy.brandSub, true));
    logoRow.append(logo, stack);
    const chips = document.createElement('div');
    chips.className = 'feature-chips';
    for (const label of copy.chips) chips.append(textNode('span', 'feature-chip', label, true));
    zone.append(logoRow, textNode('p', 'feature-tagline', copy.tagline, true), chips);
    poster.append(zone);
    addScreenshot(poster, { source: job.raw[0], width: 176, left: 575, top: 70, alt: job.lang === 'zh' ? 'Android 分类统计界面' : 'Android spending analytics', name: 'feature-analytics' });
    addScreenshot(poster, { source: job.raw[1], width: 176, left: 801, top: 36, alt: job.lang === 'zh' ? 'Android 收支明细界面' : 'Android daily entries', name: 'feature-home' });
  } else {
    addDecorations(poster);
    const header = document.createElement('header');
    header.className = 'poster-header';
    header.append(textNode('h1', 'headline', job.copy.title, true), textNode('p', 'subtitle', job.copy.sub, true));
    poster.append(header);
    const imageWidth = job.width * .765;
    addScreenshot(poster, {
      source: job.raw[0], width: imageWidth, left: (job.width - imageWidth) / 2,
      top: job.height * .178, alt: job.copy.title,
    });
  }
  return poster;
}

function currentJobs() {
  const state = window.screenshotState;
  return state.scenes.map(scene => makeJob(state.platform, state.lang, state.mode, scene));
}

function selectScene(scene) {
  const match = [...cards.querySelectorAll('.item')].find(item => item.querySelector('.poster').dataset.scene === scene);
  if (!match) throw new Error(`Scene not rendered: ${scene}`);
  for (const item of cards.querySelectorAll('.item')) item.classList.toggle('selected', item === match);
}

function commandFor(all = false) {
  const state = window.screenshotState;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  const args = [`--origin=${location.protocol === 'http:' ? location.origin : 'http://127.0.0.1:8765'}`];
  let suffix = 'all';
  if (!all) {
    args.push(`--platform=${state.platform}`, `--lang=${state.lang}`);
    if (state.platform !== 'feature') args.push(`--mode=${state.mode}`);
    if (state.scene !== 'all' && state.platform !== 'feature') args.push(`--scene=${state.scene}`);
    suffix = `${state.platform}-${state.lang}-${state.mode}${state.scene === 'all' || state.platform === 'feature' ? '' : `-${state.scene}`}`;
  }
  args.push(`--output=./projects/beecount/store/v4/output-${suffix}-${stamp}`);
  return `node projects/beecount/store/v4/export.mjs ${args.join(' ')}`;
}

async function copyCommand(all) {
  const input = document.getElementById('export-command');
  input.value = commandFor(all);
  document.getElementById('export-help').open = true;
  try {
    await navigator.clipboard.writeText(input.value);
    status.textContent = ui[controls.lang.value].copied;
  } catch {
    input.focus(); input.select();
    status.textContent = ui[controls.lang.value].copyFallback;
  }
}

function updateSceneOptions(platform, lang, requested) {
  const options = platform === 'feature'
    ? [['feature', ui[lang].featureScene]]
    : [['all', ui[lang].allScenes], ...THEMES.map(theme => [theme.id, theme[lang].title])];
  controls.scene.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
  controls.scene.value = options.some(([value]) => value === requested) ? requested : options[0][0];
  controls.scene.disabled = platform === 'feature';
}

function render() {
  const version = ++renderVersion;
  const platform = controls.platform.value;
  const lang = controls.lang.value;
  updateSceneOptions(platform, lang, version === 1 ? params.get('scene') : controls.scene.value);
  controls.mode.disabled = platform === 'feature';
  if (platform === 'feature') controls.mode.value = 'light';
  const mode = controls.mode.value;
  const scene = controls.scene.value;
  const scenes = platform === 'feature' ? ['feature'] : scene === 'all' ? THEMES.map(theme => theme.id) : [scene];
  window.screenshotState = { platform, lang, mode, scene, scenes, totalCount };
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.body.classList.toggle('export', exportMode);
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = ui[lang][node.dataset.i18n]; });
  document.getElementById('source-note').textContent = ui[lang][platform === 'feature' ? 'featureNote' : 'deviceNote'];
  document.getElementById('export-command').value = commandFor();
  status.classList.remove('error');
  status.textContent = ui[lang].loading;
  cards.classList.toggle('feature-gallery', platform === 'feature');
  cards.classList.toggle('single-gallery', scenes.length === 1);
  cards.replaceChildren();
  for (const job of currentJobs()) {
    const item = document.createElement('section');
    item.className = 'item';
    const stage = document.createElement('div');
    stage.className = 'stage';
    stage.append(buildPoster(job));
    const caption = document.createElement('div');
    caption.className = 'caption';
    const links = document.createElement('span');
    links.className = 'source-links';
    job.raw.forEach((source, index) => {
      const link = document.createElement('a');
      link.href = source; link.target = '_blank'; link.rel = 'noopener';
      link.textContent = job.kind === 'feature' ? ui[lang][index === 0 ? 'analyticsSource' : 'homeSource'] : ui[lang].source;
      links.append(link);
    });
    caption.append(textNode('span', 'caption-title', job.copy.title || ui[lang].featureScene), links);
    item.append(stage, caption);
    cards.append(item);
  }
  selectScene(scenes[0]);
  const resize = () => {
    const { width, height } = FORMATS[platform];
    for (const stage of cards.querySelectorAll('.stage')) {
      const scale = exportMode ? 1 : stage.clientWidth / width;
      stage.style.height = `${height * scale}px`;
      stage.firstElementChild.style.transform = `scale(${scale})`;
    }
  };
  resizeObserver?.disconnect();
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(cards);
  resize();
  const query = new URLSearchParams({ platform, lang, mode, scene });
  if (exportMode) query.set('export', '1');
  history.replaceState(null, '', `${location.pathname}?${query}`);
  window.storeReady = (async () => {
    await document.fonts.ready;
    const results = await Promise.all([...cards.querySelectorAll('img')].map(async image => {
      try { await image.decode(); return image.naturalWidth > 0 ? null : image.getAttribute('src'); }
      catch { return image.getAttribute('src'); }
    }));
    const missing = results.filter(Boolean);
    if (version === renderVersion) {
      status.classList.toggle('error', missing.length > 0);
      const format = FORMATS[platform];
      status.textContent = missing.length ? ui[lang].missing + missing.join(', ')
        : `${scenes.length} ${lang === 'zh' ? '张预览' : scenes.length === 1 ? 'preview' : 'previews'} · ${format.width} × ${format.height} · ${lang === 'zh' ? '全套' : 'full set'} ${totalCount}`;
    }
    return { ok: missing.length === 0, missing };
  })();
}

function validatePoster(scene) {
  const poster = [...cards.querySelectorAll('.poster')].find(item => item.dataset.scene === scene);
  if (!poster) throw new Error(`Missing poster: ${scene}`);
  const job = makeJob(poster.dataset.platform, poster.dataset.lang, poster.dataset.mode, scene);
  const bounds = poster.getBoundingClientRect();
  const relativeRect = node => {
    const r = node.getBoundingClientRect();
    return { left: r.left - bounds.left, top: r.top - bounds.top, right: r.right - bounds.left, bottom: r.bottom - bounds.top, width: r.width, height: r.height };
  };
  const inside = (inner, outer, tolerance = .5) => inner.left >= outer.left - tolerance && inner.top >= outer.top - tolerance && inner.right <= outer.right + tolerance && inner.bottom <= outer.bottom + tolerance;
  const intersects = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > .5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > .5;
  const artboard = { left: 0, top: 0, right: job.width, bottom: job.height };
  const issues = [];
  if (Math.abs(bounds.width - job.width) > .1 || Math.abs(bounds.height - job.height) > .1) issues.push('Artboard is not at native export size');
  if (document.fonts.status !== 'loaded') issues.push('Fonts are not ready');
  const texts = [...poster.querySelectorAll('[data-check-text]')].map((node, index) => {
    node.dataset.fontNode = String(index);
    const rect = relativeRect(node);
    const range = document.createRange(); range.selectNodeContents(node);
    const glyphBounds = range.getBoundingClientRect();
    const glyphs = { left: glyphBounds.left - bounds.left, top: glyphBounds.top - bounds.top, right: glyphBounds.right - bounds.left, bottom: glyphBounds.bottom - bounds.top };
    const style = getComputedStyle(node);
    if (!node.textContent.trim() || !inside(rect, artboard) || !inside(glyphs, rect, 2) || node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1) issues.push(`Text clipped or empty: ${node.textContent}`);
    if (Number.parseFloat(style.fontSize) <= 0 || style.fontFamily.includes('Times New Roman')) issues.push(`Unexpected font: ${node.textContent}`);
    return { text: node.textContent, rect, glyphs, fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, node: index };
  });
  for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
    if (intersects(texts[a].rect, texts[b].rect)) issues.push(`Text overlap: ${texts[a].text} / ${texts[b].text}`);
  }
  const surfaceNodes = [...poster.querySelectorAll('.screenshot-surface')];
  const surfaces = surfaceNodes.map(relativeRect);
  const nativePlatform = job.kind === 'feature' ? 'android' : job.platform;
  const expected = FORMATS[nativePlatform];
  const checkFrameless = (node, label) => {
    const style = getComputedStyle(node);
    const sides = ['Top', 'Right', 'Bottom', 'Left'];
    if (style.borderRadius !== '0px' || style.boxShadow !== 'none' || style.clipPath !== 'none' || style.maskImage !== 'none' || style.backgroundColor !== 'rgba(0, 0, 0, 0)' || sides.some(side => Number.parseFloat(style[`border${side}Width`]) !== 0 || Number.parseFloat(style[`padding${side}`]) !== 0)) issues.push(`Simulated device decoration on ${label}`);
  };
  if (poster.querySelector('.device-frame,.bezel,.notch')) issues.push('Simulated device markup remains');
  surfaceNodes.forEach((node, index) => checkFrameless(node, `source surface ${index}`));
  const sources = [...poster.querySelectorAll('.native-image')].map((image, index) => {
    const rect = relativeRect(image);
    const style = getComputedStyle(image);
    checkFrameless(image, job.raw[index]);
    if (image.getAttribute('src') !== job.raw[index] || image.naturalWidth !== expected.width || image.naturalHeight !== expected.height) issues.push(`Missing or wrong-platform source: ${image.getAttribute('src')}`);
    // Chromium lays boxes out in 1/64 CSS-pixel units. Allow that single
    // rounding unit, not a visible change to the screenshot's aspect ratio.
    const ratioTolerance = 1 / 64 / Math.min(expected.width, expected.height);
    if (Math.abs(rect.width / expected.width - rect.height / expected.height) > ratioTolerance) issues.push(`Source aspect ratio changed: ${job.raw[index]}`);
    if (!inside(rect, artboard) || !inside(rect, surfaces[index]) || !inside(surfaces[index], artboard)) issues.push(`Source extends outside the artboard: ${job.raw[index]}`);
    if (style.objectFit !== 'contain' || style.transform !== 'none') issues.push(`Source has cropping styles: ${job.raw[index]}`);
    return { path: job.raw[index], naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, rect };
  });
  const header = poster.querySelector('.poster-header');
  let textToScreenshotGap;
  if (header) {
    textToScreenshotGap = surfaces[0].top - relativeRect(header).bottom;
    if (textToScreenshotGap < 24) issues.push('Headline area overlaps or sits too close to the screenshot');
  } else {
    const zone = relativeRect(poster.querySelector('.feature-content-zone'));
    textToScreenshotGap = Math.min(...surfaces.map(surface => surface.left)) - zone.right;
    if (textToScreenshotGap < 24 || !inside(zone, artboard)) issues.push('Feature copy overlaps a screenshot or artboard edge');
    if (intersects(surfaces[0], surfaces[1])) issues.push('Feature screenshots overlap');
  }
  return { ok: issues.length === 0, issues, width: bounds.width, height: bounds.height, textToScreenshotGap, noSimulatedDeviceFrames: true, texts, surfaces, sources };
}

window.BeeCountStore = { version: 3, themes: THEMES, formats: FORMATS, totalCount, selectScene, currentJobs, validatePoster };
for (const control of Object.values(controls)) control.addEventListener('change', render);
document.getElementById('copy-current').addEventListener('click', () => copyCommand(false));
document.getElementById('copy-all').addEventListener('click', () => copyCommand(true));
document.getElementById('download').addEventListener('click', () => {
  const { platform, lang, mode } = window.screenshotState;
  const jobs = currentJobs();
  const json = { kind: 'beecount-v4-export-plan', images: jobs, command: commandFor() };
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(json, null, 2)}\n`], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url;
  anchor.download = `beecount-v4-${platform}-${lang}-${mode}.json`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render();
