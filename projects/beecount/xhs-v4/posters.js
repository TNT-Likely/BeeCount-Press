const query = new URLSearchParams(location.search);
const mode = query.get('mode') === 'dark' ? 'dark' : 'light';
const exportMode = query.get('export') === '1';
if (exportMode) document.body.classList.add('export');
const poster = document.getElementById('poster');
poster.dataset.mode = mode;
const scenes = [
  ['02-analytics', '收支洞察'], ['06-budgets', '预算管理'],
  ['01-home', '收支明细'], ['03-accounts', '资产账户'],
  ['05-transaction', '记账编辑'], ['04-ledgers', '多账本'],
];
poster.innerHTML = `
  <div class="glow glow-one"></div><div class="glow glow-two"></div>
  <header class="poster-header">
    <div class="brand"><img src="../store/v4/assets/logo.png" alt="蜜蜂记账图标"><p>蜜蜂记账<span>4.0</span></p></div>
    <h1 class="poster-title">每一笔，都清楚</h1>
  </header>
  <div class="screens" aria-label="真实 App 页面"><div class="wall"></div></div>
  <div class="edge-fade"></div>`;
const wall = poster.querySelector('.wall');
for (let col = 0; col < 3; col++) {
  const column = document.createElement('div'); column.className = 'column';
  for (const [scene, label] of scenes.slice(col * 2, col * 2 + 2)) {
    const figure = document.createElement('figure'); figure.className = 'screen';
    const image = document.createElement('img');
    image.src = `../store/v4/raw/ios/zh/${mode}/${scene}.png`;
    image.alt = label; image.width = 1320; image.height = 2868;
    figure.append(image); column.append(figure);
  }
  wall.append(column);
}
document.getElementById('download').href = `output/${mode === 'light' ? '01' : '02'}-tilted-pages-${mode}.png`;
function fit() {
  if (exportMode) return;
  const stage = document.querySelector('.stage'); const scale = stage.clientWidth / 1440;
  stage.style.height = `${1920 * scale}px`; poster.style.transform = `scale(${scale})`;
}
addEventListener('resize', fit); fit();
window.posterReady = (async () => {
  await document.fonts.ready;
  // Wait for the resource before decoding, and decode one full-resolution
  // screenshot at a time to avoid Chromium aborting concurrent large decodes.
  for (const image of poster.querySelectorAll('img')) {
    if (!image.complete) await new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, {once: true});
      image.addEventListener('error', reject, {once: true});
    });
    if (!image.naturalWidth) throw new Error(`Missing source: ${image.getAttribute('src')}`);
    for (let attempt = 0; ; attempt++) {
      try { await image.decode(); break; }
      catch {
        if (attempt === 2) throw new Error(`Cannot decode source: ${image.getAttribute('src')}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  return {mode, width: 1440, height: 1920, screenshots: 6};
})();
