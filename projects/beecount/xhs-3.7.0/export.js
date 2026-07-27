// BeeCount · 小红书 3:4 卡片导出工具
// 风格沿用 assets/store/screenshots/templates/export.js:
//   - html2canvas 截图 + JSZip 兜底 + File System Access API 直写
//   - 多张卡片在 TEMPLATES 数组里挂,单张 / 全部 都能导出
//
// 当前系列:BeeCount 3.7.0 桌面小组件发布物料(3 张 3:4 · 按小/中/大尺寸)
// 尺寸固定 1242 × 1656(小红书封面 3:4 标准)

const CARD_W = 1242;
const CARD_H = 1656;

/// 模板配置 — 新增卡片时在这里加一项即可。
const TEMPLATES = [
  { id: '01-small',  name: '01 · 小尺寸(封面 · 4 款)', file: '01-small.html' },
  { id: '02-medium', name: '02 · 中尺寸(5 款)',        file: '02-medium.html' },
  { id: '03-large',  name: '03 · 大尺寸(3 款)',        file: '03-large.html' },
];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// 选择器:卡片根元素。.cover 是 series.css 约定的类名;.poster 保留兼容长图模板。
const ROOT_SELECTOR = '.cover, .poster';

// ============================================================
// 持久化选项
// ============================================================
const STORAGE_KEY = 'beecount-long-selections';

function saveSelections() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      template: $('#template').value,
      zoom: $('#zoom').value,
      dpr: $('#dpr').value,
    }));
  } catch (_) { /* 隐私模式忽略 */ }
}

function loadSelections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    for (const id of ['template', 'zoom', 'dpr']) {
      const el = $(`#${id}`);
      if (saved[id] != null && el && [...el.options].some(o => o.value === saved[id])) {
        el.value = saved[id];
      }
    }
  } catch (_) { /* 损坏忽略 */ }
}

function fillTemplates() {
  const sel = $('#template');
  for (const t of TEMPLATES) {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  }
}

function currentTemplate() {
  const id = $('#template').value;
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}


// ============================================================
// 预览渲染
// ============================================================
async function render() {
  const t = currentTemplate();
  const zoom = parseFloat($('#zoom').value);
  const iframe = $('#preview');

  iframe.style.width = `${CARD_W * zoom}px`;
  iframe.style.height = `${CARD_H * zoom}px`;

  await new Promise(resolve => {
    iframe.onload = resolve;
    iframe.src = `${t.file}?v=${Date.now()}`;
  });

  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.body.classList.add('exporting');
  if (doc.fonts && doc.fonts.ready) await doc.fonts.ready;

  // iframe 内整体 scale,viewport 同时收缩到对应尺寸
  const styleId = '__zoom_style';
  let s = doc.getElementById(styleId);
  if (!s) {
    s = doc.createElement('style');
    s.id = styleId;
    doc.head.appendChild(s);
  }
  s.textContent = `
    html, body { margin: 0; padding: 0; overflow: hidden; background: #ece9df; }
    body { transform-origin: top left; transform: scale(${zoom}); width: ${CARD_W}px; height: ${CARD_H}px; }
  `;

  updateMeta();
}

function updateMeta() {
  $('#m-size').textContent = `${CARD_W} × ${CARD_H}`;
  $('#m-ratio').textContent = '3 : 4 · 小红书封面';
}

// ============================================================
// 截图 & 导出
// ============================================================

/// 沿用 store 截图模板的实色背景保护(避免透明 PNG):
///   1. backgroundColor 给具体 hex,html2canvas 不产生透明
///   2. 二次画到 alpha:false canvas 上,确保 PNG 零 alpha 通道
const FLATTEN_BG = '#FFF8EC'; // 与 .cover 默认 bg-cream 一致;暗底卡(08-cta)会被卡片自身覆盖

async function captureTemplateBlob(template) {
  // 关键:在 iframe **内部**运行 html2canvas,而不是在父页面 cross-iframe 调。
  // 之前的实现是 `html2canvas(iframe.contentDocument.querySelector('.cover'))` —
  // 跨 iframe 调用时字体/CSS 上下文丢失,emoji、blur、gradient 渲染都跟预览不一致。
  // 现在改为把 html2canvas 注入到 iframe 自己的 window 里,效果跟预览完全对齐。
  const sandbox = document.createElement('iframe');
  sandbox.style.cssText = `
    position: fixed; left: -20000px; top: 0;
    width: ${CARD_W}px; height: ${CARD_H + 80}px;
    border: 0; pointer-events: none;
  `;
  document.body.appendChild(sandbox);

  try {
    await new Promise(resolve => {
      sandbox.onload = resolve;
      sandbox.src = `${template.file}?v=${Date.now()}`;
    });

    const idoc = sandbox.contentDocument;
    const iwin = sandbox.contentWindow;
    idoc.body.classList.add('exporting');

    // 1. 等字体加载完(Noto Serif SC / Caveat 等 Google Fonts 异步加载)
    if (idoc.fonts && idoc.fonts.ready) await idoc.fonts.ready;

    // 2. 等所有 <img> 加载完(03-web 的真实截图等)
    const imgs = Array.from(idoc.querySelectorAll('img'));
    await Promise.all(imgs.map(img =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise(r => {
            img.addEventListener('load', r, { once: true });
            img.addEventListener('error', r, { once: true });
            setTimeout(r, 5000);
          })
    ));

    // 3. 把 html2canvas 注入 iframe 自己的 window,确保渲染上下文一致
    if (!iwin.html2canvas) {
      await new Promise((resolve, reject) => {
        const s = idoc.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('html2canvas 在 iframe 内加载失败'));
        idoc.head.appendChild(s);
      });
    }

    // 4. 多等一帧让 SVG(如 07-cta 的二维码)、gradient、blur 都布局稳定
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await new Promise(r => setTimeout(r, 300));

    const root = idoc.querySelector(ROOT_SELECTOR);
    if (!root) throw new Error(`找不到 .cover 节点(模板 ${template.file})`);

    const dpr = parseInt($('#dpr').value, 10) || 2;
    // 在 iframe 内运行 html2canvas — 它访问 iframe 的 document/window/getComputedStyle,
    // 自然能拿到正确的字体、变量、emoji 渲染
    const canvas = await iwin.html2canvas(root, {
      scale: dpr,
      useCORS: true,
      allowTaint: true,
      backgroundColor: FLATTEN_BG,
      logging: false,
      width: CARD_W,
      height: CARD_H,
      windowWidth: CARD_W,
      windowHeight: CARD_H,
      foreignObjectRendering: false,
    });

    // 二次绘制到 alpha:false canvas,确保 PNG 零透明
    const flat = document.createElement('canvas');
    flat.width = canvas.width;
    flat.height = canvas.height;
    const ctx = flat.getContext('2d', { alpha: false });
    ctx.fillStyle = FLATTEN_BG;
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(canvas, 0, 0);

    const blob = await new Promise(r => flat.toBlob(r, 'image/png'));
    return { blob, width: canvas.width, height: canvas.height };
  } finally {
    sandbox.remove();
  }
}

function downloadBlob(blob, name) {
  const link = document.createElement('a');
  link.download = name;
  link.href = URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 60000);
}

let lastDirHandle = null;
async function pickOutputDir() {
  if (!('showDirectoryPicker' in window)) return null;
  if (lastDirHandle) {
    try {
      const perm = await lastDirHandle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') return lastDirHandle;
      const re = await lastDirHandle.requestPermission({ mode: 'readwrite' });
      if (re === 'granted') return lastDirHandle;
    } catch (_) { lastDirHandle = null; }
  }
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      id: 'beecount-long-output',
      startIn: 'documents',
    });
    lastDirHandle = handle;
    return handle;
  } catch (e) {
    if (e.name === 'AbortError') return 'cancelled';
    return null;
  }
}

async function writeFileToDir(dirHandle, name, blob) {
  const parts = name.split('/');
  let cur = dirHandle;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = await cur.getDirectoryHandle(parts[i], { create: true });
  }
  const fh = await cur.getFileHandle(parts[parts.length - 1], { create: true });
  const w = await fh.createWritable();
  await w.write(blob);
  await w.close();
}

function setBtnState(text, disabled = true) {
  for (const id of ['export-current', 'export-all']) {
    const b = $(`#${id}`);
    if (!b) continue;
    b.disabled = disabled;
    if (disabled) b.dataset.savedText ||= b.textContent;
    if (text != null) b.textContent = text;
    if (!disabled && b.dataset.savedText) {
      b.textContent = b.dataset.savedText;
      delete b.dataset.savedText;
    }
  }
}

function ensureJSZip() {
  if (typeof JSZip === 'undefined') {
    alert('JSZip 加载失败(CDN 网络?)\n请确保通过 http server 访问,且能联网下载 jsdelivr。');
    return false;
  }
  return true;
}

async function exportCurrent() {
  const t = currentTemplate();
  setBtnState('截图中...');
  try {
    const { blob } = await captureTemplateBlob(t);
    const fileName = `${t.id}.png`;

    const dirHandle = await pickOutputDir();
    if (dirHandle === 'cancelled') return;

    if (dirHandle) {
      setBtnState('写入...');
      await writeFileToDir(dirHandle, fileName, blob);
      alert(`已写入 "${dirHandle.name}/${fileName}"`);
    } else {
      downloadBlob(blob, fileName);
    }
  } catch (e) {
    console.error(e);
    alert(`导出失败:${e.message ?? e}`);
  } finally {
    setBtnState(null, false);
  }
}

async function exportAll() {
  if (!ensureJSZip()) return;
  setBtnState(`截图 0/${TEMPLATES.length}...`);
  try {
    const items = [];
    for (let i = 0; i < TEMPLATES.length; i++) {
      setBtnState(`截图 ${i + 1}/${TEMPLATES.length}...`);
      const t = TEMPLATES[i];
      const { blob } = await captureTemplateBlob(t);
      items.push({ name: `${t.id}.png`, blob });
    }

    const dirHandle = await pickOutputDir();
    if (dirHandle === 'cancelled') return;

    if (dirHandle) {
      setBtnState('写入...');
      for (const { name, blob } of items) {
        await writeFileToDir(dirHandle, name, blob);
      }
      alert(`已写入 ${items.length} 张到 "${dirHandle.name}/"`);
    } else {
      setBtnState('打包 zip...');
      const zip = new JSZip();
      items.forEach(({ name, blob }) => zip.file(name, blob));
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(zipBlob, `beecount-launch-3x-${date}.zip`);
    }
  } catch (e) {
    console.error(e);
    alert(`批量导出失败:${e.message ?? e}`);
  } finally {
    setBtnState(null, false);
  }
}

// ============================================================
// 初始化
// ============================================================
fillTemplates();
loadSelections();

['template', 'zoom', 'dpr'].forEach(id =>
  $(`#${id}`).addEventListener('change', () => {
    saveSelections();
    if (id !== 'dpr') render(); // DPR 只影响导出,不影响预览
  })
);
$('#export-current').addEventListener('click', exportCurrent);
$('#export-all').addEventListener('click', exportAll);

render();
