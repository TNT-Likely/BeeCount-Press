// One source of truth for the gallery and the Node exporter.
// Copy describes only the production screens present in raw/.
export const THEMES = [
  {
    id: '01-home',
    zh: { title: '收支一目了然', sub: '收支明细 · 月度结余' },
    en: { title: 'Your money, clearly', sub: 'Daily entries and your monthly balance' },
  },
  {
    id: '02-analytics',
    zh: { title: '看清钱去哪了', sub: '支出趋势 · 分类占比 · 分类排行' },
    en: { title: 'Understand spending', sub: 'Spending trends and category breakdowns' },
  },
  {
    id: '03-accounts',
    zh: { title: '资产心中有数', sub: '总资产 · 总负债 · 净资产' },
    en: { title: 'Assets at a glance', sub: 'Assets, liabilities and net worth' },
  },
  {
    id: '04-ledgers',
    zh: { title: '生活分本记录', sub: '日常 · 旅行 · 成长，各有账本' },
    en: { title: 'Separate ledgers', sub: 'Keep daily life, travel and growth apart' },
  },
  {
    id: '05-transaction',
    zh: { title: '记下每一笔', sub: '二级分类 · 多账户 · 内置计算器' },
    en: { title: 'Add an entry', sub: 'Subcategories, accounts and a calculator' },
  },
  {
    id: '06-budgets',
    zh: { title: '花钱有计划', sub: '月度预算 · 分类预算 · 余额可见' },
    en: { title: 'Plan your spending', sub: 'Monthly and category budgets' },
  },
  {
    id: '07-mine',
    zh: { title: '常用工具在这里', sub: '数据管理 · 自动化 · 个性化设置' },
    en: { title: 'Tools in one place', sub: 'Data, automation and personalization' },
  },
  {
    id: '08-tags',
    zh: { title: '给记录加个标签', sub: '彩色标签 · 按场景整理' },
    en: { title: 'Organize with tags', sub: 'Color-coded labels for your entries' },
  },
  {
    id: '09-cloud',
    zh: { title: '连接你的云端', sub: 'BeeCount Cloud · 增量同步' },
    en: { title: 'Connect your cloud', sub: 'BeeCount Cloud · incremental sync' },
  },
  {
    id: '10-categories',
    zh: { title: '分类更有条理', sub: '一级分类 · 二级分类 · 展开管理' },
    en: { title: 'Categories, organized', sub: 'Categories and subcategories, together' },
  },
  {
    id: '11-personalization',
    zh: { title: '换个喜欢的颜色', sub: '预设配色 · 自定义主题色' },
    en: { title: 'Pick your color', sub: 'Preset palettes and your own colors' },
  },
  {
    id: '12-search',
    zh: { title: '找回那一笔', sub: '搜索记录 · 筛选条件 · 收支合计' },
    en: { title: 'Find that entry', sub: 'Search your entries and view totals' },
  },
];

export const FORMATS = {
  ios: { width: 1320, height: 2868, label: 'iPhone 6.9″', kind: 'screenshot' },
  android: { width: 1080, height: 2400, label: 'Android', kind: 'screenshot' },
  feature: { width: 1024, height: 500, label: 'Google Play feature', kind: 'feature' },
};
export const LANGUAGES = ['zh', 'en'];
export const MODES = ['light', 'dark'];
export const FEATURE_COPY = {
  zh: {
    brand: 'BeeCount', brandSub: '蜜蜂记账',
    tagline: '收支记录，一目了然',
    chips: ['日常记账', '分类统计', '月度趋势'],
  },
  en: {
    brand: 'BeeCount', brandSub: 'Personal finance',
    tagline: 'See your everyday spending',
    chips: ['Daily entries', 'Categories', 'Trends'],
  },
};

export const rawPath = (platform, lang, mode, scene) =>
  `raw/${platform}/${lang}/${mode}/${scene}.png`;

export function makeJob(platform, lang, mode, scene) {
  const format = FORMATS[platform];
  if (!format || !LANGUAGES.includes(lang)) throw new Error('Unknown platform or language');
  if (platform === 'feature') {
    return {
      platform, lang, mode: 'light', scene: 'feature', ...format,
      path: `feature/${lang}/feature.png`,
      raw: [rawPath('android', lang, 'light', '02-analytics'), rawPath('android', lang, 'light', '01-home')],
      copy: FEATURE_COPY[lang],
    };
  }
  const theme = THEMES.find(item => item.id === scene);
  if (!theme || !MODES.includes(mode)) throw new Error('Unknown scene or appearance');
  return {
    platform, lang, mode, scene, ...format,
    path: `${platform}/${lang}/${mode}/${scene}.png`,
    raw: [rawPath(platform, lang, mode, scene)],
    copy: theme[lang],
  };
}

export function exportJobs({
  platforms = Object.keys(FORMATS), languages = LANGUAGES, modes = MODES,
  scenes = THEMES.map(theme => theme.id),
} = {}) {
  return platforms.flatMap(platform => languages.flatMap(lang =>
    platform === 'feature' ? [makeJob(platform, lang, 'light', 'feature')]
      : modes.flatMap(mode => scenes.map(scene => makeJob(platform, lang, mode, scene))),
  ));
}
