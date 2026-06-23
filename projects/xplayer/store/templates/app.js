// XPlayer 商店截图生成器 — 数据 + 渲染逻辑。
// render.html(单卡 headless 截图)和 index.html(预览画廊)共用。
// 设计:深色卡片(呼应 app 暗色 UI)+ 绿色点缀(呼应 app 的绿色选中/按钮)。

// 竖屏手机 5 个场景。raw 按 raw/<lang>/<file> 取(home/player 中英同图;search/groups/remote 分语言)。
const SCENES = [
  { id: 'home',   file: '01-home.png',
    en: { title: 'Your own IPTV',   sub: 'Add any M3U / M3U8 — channels, logos, groups' },
    zh: { title: '你的直播源',        sub: '导入任意 M3U,频道 / 台标 / 分组齐全' } },
  { id: 'player', file: '02-player.png',
    en: { title: 'Live, your way',   sub: 'A clean, smooth player with simple controls' },
    zh: { title: '随心看直播',        sub: '简洁流畅,操作顺手' } },
  { id: 'search', file: '03-search.png',
    en: { title: 'Instant search',   sub: 'Find channels by name across your playlist' },
    zh: { title: '频道秒搜',          sub: '按名称即时搜索整个列表' } },
  { id: 'groups', file: '04-groups.png',
    en: { title: 'Sorted by group',  sub: 'Jump to any category in a single tap' },
    zh: { title: '智能分组',          sub: '一键直达任意分类' } },
  { id: 'remote', file: '05-remote.png',
    en: { title: 'Phone as remote',  sub: 'Type to your TV over the local network' },
    zh: { title: '手机变遥控',        sub: '局域网给 TV 输入文字、远程操控' } },
];

// 竖屏手机 raw 1179×2556(≈0.461)。设备框用同比例 → object-fit:cover 不裁切、不变形。
const RAW_AR = 1179 / 2556;

// 输出尺寸:
//   apple   = App Store iPhone 6.5"(1284×2778;ASC 也接受 1242×2688)
//   android = Google Play 手机(1080×2400)
//   feature = Google Play Feature Graphic(1024×500 横版)
//   mac     = App Store macOS(1440×900 横版窗口)
//   ipad    = App Store iPad(2732×2048 横版,12.9"/13" 槽都接受)
const DEVICES = {
  apple:   { w: 1284, h: 2778, kind: 'phone',   devW: 0.72, h1: 110, h2: 47 },
  android: { w: 1080, h: 2400, kind: 'phone',   devW: 0.74, h1: 92,  h2: 40 },
  feature: { w: 1024, h: 500,  kind: 'feature' },
  mac:     { w: 1440, h: 900,  kind: 'mac',  devW: 0.74, h1: 56, h2: 27, radius: 14 },
  ipad:    { w: 2732, h: 2048, kind: 'ipad', devW: 0.78, h1: 80, h2: 38, radius: 28 },
};

const FEATURE_COPY = {
  en: { brand: 'XPlayer', brandSub: 'IPTV / M3U Player', tagline: 'Bring your own playlist.',
        chips: ['M3U / IPTV', 'Grouping', 'Search', 'EPG'] },
  zh: { brand: 'XPlayer', brandSub: 'IPTV / M3U 播放器', tagline: '播放你自己的直播源',
        chips: ['M3U / IPTV', '分组', '搜索', 'EPG'] },
};

// Mac:横版窗口截图 1377×819(≈1.681)。输出 1440×900 时窗口缩到 ~1066 宽 → 清晰。
const MAC_AR = 1377 / 819;
const MAC_SCENES = [
  { id: 'home',   file: 'mac-01-home.png',
    en: { title: 'Your own IPTV',       sub: 'Add any M3U / M3U8 — grouped, searchable, ready' },
    zh: { title: '你的直播源',            sub: '导入任意 M3U,分组 / 搜索 / 即点即看' } },
  { id: 'player', file: 'mac-02-player.png',
    en: { title: 'Live TV on your Mac',  sub: 'Full-window playback with a clean, simple player' },
    zh: { title: '在 Mac 上看直播',       sub: '整窗播放,简洁顺手' } },
  { id: 'groups', file: 'mac-03-groups.png',
    en: { title: 'Sorted by group',      sub: 'Jump to any category across thousands of channels' },
    zh: { title: '智能分组',              sub: '上千频道,一键直达任意分类' } },
];

// iPad:用户截的是 iPad Pro 13" 横屏 2752×2064(≈1.333 / 4:3)。输出 2732×2048。
const IPAD_AR = 2752 / 2064;
const IPAD_SCENES = [
  { id: 'home',   file: 'ipad-01-home.png',
    en: { title: 'Your own IPTV',     sub: 'Add any M3U / M3U8 — channels, logos, groups' },
    zh: { title: '你的直播源',          sub: '导入任意 M3U,频道 / 台标 / 分组齐全' } },
  { id: 'player', file: 'ipad-02-player.png',
    en: { title: 'Live TV on iPad',   sub: 'Full-screen playback with a clean, simple player' },
    zh: { title: '在 iPad 上看直播',    sub: '全屏播放,简洁顺手' } },
  { id: 'search', file: 'ipad-03-search.png',
    en: { title: 'Instant search',    sub: 'Find channels by name across your playlist' },
    zh: { title: '频道秒搜',            sub: '按名称即时搜索整个列表' } },
  { id: 'groups', file: 'ipad-04-groups.png',
    en: { title: 'Sorted by group',   sub: 'Jump to any category in a single tap' },
    zh: { title: '智能分组',            sub: '一键直达任意分类' } },
];

function rawSrc(lang, file) { return `../raw/${lang}/${file}`; }

function renderPhoneCard(card, scene, lang, store) {
  const dev = DEVICES[store];
  const t = scene[lang];
  card.innerHTML = `
    <span class="d-glow d-glow-1"></span>
    <span class="d-glow d-glow-2"></span>
    <span class="d-star d-star-1">&#10022;</span>
    <span class="d-star d-star-2">&#10023;</span>
    <div class="header"><h1>${t.title}</h1><h2>${t.sub}</h2></div>
    <div class="device"><img src="${rawSrc(lang, scene.file)}" alt="${scene.id}"></div>
  `;
  const W = dev.w, H = dev.h;
  const dW = Math.round(W * dev.devW);
  const dH = Math.round(dW / RAW_AR);
  const device = card.querySelector('.device');
  device.style.left = `${Math.round((W - dW) / 2)}px`;
  device.style.width = `${dW}px`;
  device.style.height = `${dH}px`;
  device.style.bottom = `${Math.round(H * 0.06)}px`;
  device.style.borderRadius = `${Math.round(dW * 0.055)}px`;
  card.querySelector('.header h1').style.fontSize = `${dev.h1}px`;
  card.querySelector('.header h2').style.fontSize = `${dev.h2}px`;
}

// Mac / iPad 共用:横版,窗口/全屏截图浮在深色卡上。
function renderLandscapeCard(card, scene, lang, store, ar) {
  const dev = DEVICES[store];
  const t = scene[lang];
  card.innerHTML = `
    <span class="d-glow d-glow-1"></span>
    <span class="d-glow d-glow-2"></span>
    <span class="d-star d-star-1">&#10022;</span>
    <div class="header"><h1>${t.title}</h1><h2>${t.sub}</h2></div>
    <div class="device mac-window"><img src="${rawSrc(lang, scene.file)}" alt="${scene.id}"></div>
  `;
  const W = dev.w, H = dev.h;
  const dW = Math.round(W * dev.devW);
  const dH = Math.round(dW / ar);
  const win = card.querySelector('.device');
  win.style.left = `${Math.round((W - dW) / 2)}px`;
  win.style.width = `${dW}px`;
  win.style.height = `${dH}px`;
  win.style.bottom = `${Math.round(H * 0.07)}px`;
  win.style.borderRadius = `${dev.radius}px`;
  card.querySelector('.header h1').style.fontSize = `${dev.h1}px`;
  card.querySelector('.header h2').style.fontSize = `${dev.h2}px`;
}

function renderFeatureCard(card, lang) {
  const t = FEATURE_COPY[lang];
  card.classList.add('card-feature');
  const chips = t.chips.map((c) => `<span class="feature-chip">${c}</span>`).join('');
  card.innerHTML = `
    <div class="feature-zone">
      <div class="feature-logo-row">
        <img class="feature-logo" src="../logo.png" alt="XPlayer">
        <div class="feature-brand-stack">
          <div class="feature-brand">${t.brand}</div>
          <div class="feature-brand-sub">${t.brandSub}</div>
        </div>
      </div>
      <div class="feature-tagline">${t.tagline}</div>
      <div class="feature-chips">${chips}</div>
    </div>
    <div class="feature-device feature-device-back"><img src="${rawSrc(lang, '02-player.png')}" alt="player"></div>
    <div class="feature-device feature-device-front"><img src="${rawSrc(lang, '01-home.png')}" alt="home"></div>
  `;
}

function renderCard(card, store, lang, sceneIdx) {
  const dev = DEVICES[store];
  card.className = 'card';
  card.dataset.device = store;
  card.style.width = `${dev.w}px`;
  card.style.height = `${dev.h}px`;
  if (dev.kind === 'feature') renderFeatureCard(card, lang);
  else if (dev.kind === 'mac') renderLandscapeCard(card, MAC_SCENES[sceneIdx], lang, 'mac', MAC_AR);
  else if (dev.kind === 'ipad') renderLandscapeCard(card, IPAD_SCENES[sceneIdx], lang, 'ipad', IPAD_AR);
  else renderPhoneCard(card, SCENES[sceneIdx], lang, store);
}
