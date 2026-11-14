// One source of truth for the gallery and the Node exporter.
// Copy describes only the production screens present in raw/.
export const THEMES = [
  {
    "id": "01-home",
    "zh": {
      "title": "每一笔都清楚",
      "sub": "每一笔日常，汇成清楚的收支与结余"
    },
    "en": {
      "title": "Every entry, in view",
      "sub": "Your everyday money, all in view"
    }
  },
  {
    "id": "05-transaction",
    "zh": {
      "title": "随手记一笔",
      "sub": "分类、账户、标签，一次记清楚"
    },
    "en": {
      "title": "Make a quick entry",
      "sub": "Categories, accounts and tags, together"
    }
  },
  {
    "id": "02-analytics",
    "zh": {
      "title": "看清钱去哪了",
      "sub": "收支趋势与分类排行，让变化看得见"
    },
    "en": {
      "title": "See where it goes",
      "sub": "Trends and categories tell the story"
    }
  },
  {
    "id": "06-budgets",
    "zh": {
      "title": "花钱有计划",
      "sub": "月度总预算与分类预算，花费有分寸"
    },
    "en": {
      "title": "Plan your spending",
      "sub": "Monthly plans, down to each category"
    }
  },
  {
    "id": "03-accounts",
    "zh": {
      "title": "账户心中有数",
      "sub": "银行卡、现金与信用卡，资产一起看"
    },
    "en": {
      "title": "Know your balances",
      "sub": "Your accounts, balances and net worth"
    }
  },
  {
    "id": "04-ledgers",
    "zh": {
      "title": "生活分本记录",
      "sub": "生活、旅行与成长，各有一本账"
    },
    "en": {
      "title": "A book for every plan",
      "sub": "Everyday life, travel and learning"
    }
  },
  {
    "id": "08-tags",
    "zh": {
      "title": "给记录加标签",
      "sub": "工作或周末，按自己的方式整理"
    },
    "en": {
      "title": "Organize with tags",
      "sub": "Organize entries in your own way"
    }
  },
  {
    "id": "11-personalization",
    "zh": {
      "title": "换个喜欢的颜色",
      "sub": "预设配色与自定义主题，让记账更合心意"
    },
    "en": {
      "title": "Make it your own",
      "sub": "Pick a palette or create your own"
    }
  },
  {
    "id": "12-search",
    "zh": {
      "title": "快速找到那一笔",
      "sub": "按记录搜索与筛选，往来都有迹可循"
    },
    "en": {
      "title": "Find that one entry",
      "sub": "Search and filter your transaction history"
    }
  },
  {
    "id": "10-categories",
    "zh": {
      "title": "分类更有条理",
      "sub": "一级与二级分类，让开销更有条理"
    },
    "en": {
      "title": "Keep costs organized",
      "sub": "Categories and subcategories, organized"
    }
  },
  {
    "id": "09-cloud",
    "zh": {
      "title": "云同步按需选",
      "sub": "按需连接 BeeCount Cloud，同步你的账本"
    },
    "en": {
      "title": "Optional cloud",
      "sub": "Connect your own BeeCount Cloud"
    }
  },
  {
    "id": "07-mine",
    "zh": {
      "title": "常用工具都在这",
      "sub": "数据管理、自动化与个性化设置"
    },
    "en": {
      "title": "Your everyday tools",
      "sub": "Manage data, automation and appearance"
    }
  }
];

export const RECOMMENDED_SCENES = THEMES.slice(0, 8).map(theme => theme.id);

export const FEATURE_THEMES = [
  {
    "id": "01-local",
    "sourceScene": "01-home",
    "zh": {
      "title": "本地优先",
      "sub": "账本默认保存在设备上，日常记账不必连接云服务。",
      "points": [
        "账本默认存本地",
        "离线也能记录收支",
        "云端与 AI 按需启用"
      ]
    },
    "en": {
      "title": "Local first",
      "sub": "Keep your books on your device. Cloud is optional.",
      "points": [
        "Stored on your device",
        "Record entries offline",
        "Cloud and AI are optional"
      ]
    }
  },
  {
    "id": "02-cloud",
    "sourceScene": "09-cloud",
    "zh": {
      "title": "云服务按需选",
      "sub": "从本地记账开始，再选择适合自己的同步方式。",
      "points": [
        "不连接云也能记账",
        "按需选择同步服务",
        "支持自托管 BeeCount Cloud"
      ]
    },
    "en": {
      "title": "Choose your cloud",
      "sub": "Start locally. Connect a sync service when you need it.",
      "points": [
        "Works without cloud",
        "Choose your sync service",
        "Self-host BeeCount Cloud"
      ]
    }
  },
  {
    "id": "03-ai",
    "sourceScene": "07-mine",
    "mediaScene": "13-aichat",
    "zh": {
      "title": "AI 按需开启",
      "sub": "按自己的需要配置 AI，让助手读懂你的账本。",
      "points": [
        "AI 功能按需配置",
        "选择自己的模型服务",
        "不用 AI 也能完整记账"
      ]
    },
    "en": {
      "title": "AI, on your terms",
      "sub": "Configure an assistant that works with your books.",
      "points": [
        "Configure AI when needed",
        "Choose a model provider",
        "Everyday tracking works without AI"
      ]
    }
  },
  {
    "id": "04-photo",
    "sourceScene": "05-transaction",
    "mediaScene": "14-photo",
    "zh": {
      "title": "图片也能记账",
      "sub": "从账单图片提取收支，让日常记录更轻松。",
      "points": [
        "从相册选择账单图片",
        "模型识别金额与分类",
        "入账后回到账本查看"
      ]
    },
    "en": {
      "title": "A picture, an entry",
      "sub": "Extract transaction details from a receipt or bill.",
      "points": [
        "Pick a bill or receipt",
        "Recognize amount and category",
        "Find the entry in your ledger"
      ]
    }
  },
  {
    "id": "05-open",
    "sourceScene": "01-home",
    "zh": {
      "title": "开源透明",
      "sub": "代码公开可查，让每一份信任都有据可循。",
      "points": [
        "源代码公开可查",
        "日常记账没有广告打扰",
        "持续改进的开源项目"
      ]
    },
    "en": {
      "title": "Open source",
      "sub": "Public source code, built for your everyday books.",
      "points": [
        "Public source code",
        "No ads inside the App",
        "An evolving open-source project"
      ]
    }
  },
  {
    "id": "06-import",
    "sourceScene": "07-mine",
    "zh": {
      "title": "旧账轻松导入",
      "sub": "导入已有账单，确认映射后继续你的记账习惯。",
      "points": [
        "导入 CSV 账单",
        "确认字段与分类映射",
        "导出数据，自主保管"
      ]
    },
    "en": {
      "title": "Bring your history",
      "sub": "Import existing bills and keep your history together.",
      "points": [
        "Import CSV records",
        "Review fields and categories",
        "Export and keep your data"
      ]
    }
  },
  {
    "id": "07-ledgers",
    "sourceScene": "04-ledgers",
    "zh": {
      "title": "多账本分开记",
      "sub": "日常、旅行与成长，按自己的生活方式分本记录。",
      "points": [
        "日常生活一本账",
        "旅行计划分开记录",
        "同一个 App，自由切换"
      ]
    },
    "en": {
      "title": "Separate your books",
      "sub": "Separate books for everyday life, travel and learning.",
      "points": [
        "A book for everyday life",
        "Travel plans kept separate",
        "Switch books in one App"
      ]
    }
  },
  {
    "id": "08-theme",
    "sourceScene": "11-personalization",
    "zh": {
      "title": "外观由你决定",
      "sub": "浅色、暗黑与主题色，让每天打开都合心意。",
      "points": [
        "浅色与暗黑外观",
        "多种预设主题色",
        "自定义喜欢的颜色"
      ]
    },
    "en": {
      "title": "Your colors, your way",
      "sub": "Light, dark and a palette that feels like you.",
      "points": [
        "Light and dark modes",
        "Ready-to-use palettes",
        "Your own custom colors"
      ]
    }
  }
];

// Classic store story: legacy headlines with current native v4 screens.
export const CLASSIC_THEMES = [
  {
    "id": "01-privacy",
    "sourceScene": "01-home",
    "zh": {
      "title": "开源透明 数据隐私",
      "sub": "开源 · 隐私优先 · 离线优先"
    },
    "en": {
      "title": "Open-source, privacy-first",
      "sub": "Open source · local first · no ads"
    }
  },
  {
    "id": "02-cloud",
    "sourceScene": "09-cloud",
    "zh": {
      "title": "云服务 你做主",
      "sub": "iCloud · WebDAV · S3 · 自托管"
    },
    "en": {
      "title": "Cloud, your way",
      "sub": "iCloud · WebDAV · S3 · self-hosting"
    }
  },
  {
    "id": "03-analytics",
    "sourceScene": "02-analytics",
    "zh": {
      "title": "看清钱去哪了",
      "sub": "分类排行 · 月度趋势 · 一目了然"
    },
    "en": {
      "title": "See where money goes",
      "sub": "Category rankings · monthly trends"
    }
  },
  {
    "id": "04-ai",
    "sourceScene": "07-mine",
    "zh": {
      "title": "AI 智能记账",
      "sub": "对话记账 · 收支查询 · 智能分析"
    },
    "en": {
      "title": "AI smart logging",
      "sub": "Chat to log · ask about your spending"
    },
    "mediaScene": "13-aichat"
  },
  {
    "id": "05-add",
    "sourceScene": "05-transaction",
    "zh": {
      "title": "极速记一笔",
      "sub": "分类 · 账户 · 标签，一次记清楚"
    },
    "en": {
      "title": "Instant entry",
      "sub": "Categories, accounts and tags together"
    }
  },
  {
    "id": "06-ledgers",
    "sourceScene": "04-ledgers",
    "zh": {
      "title": "多账本管理",
      "sub": "日常 · 旅行 · 成长，各自独立"
    },
    "en": {
      "title": "Multi-ledger",
      "sub": "Everyday life · travel · learning"
    }
  },
  {
    "id": "07-tags",
    "sourceScene": "08-tags",
    "zh": {
      "title": "彩色标签 灵活归类",
      "sub": "工作 · 周末 · 与朋友，自由整理"
    },
    "en": {
      "title": "Color-coded tags",
      "sub": "Work · weekends · friends, organized"
    }
  },
  {
    "id": "08-accounts",
    "sourceScene": "03-accounts",
    "zh": {
      "title": "资产清晰 净值一屏",
      "sub": "多账户 · 总资产 · 总负债 · 净资产"
    },
    "en": {
      "title": "Net worth at a glance",
      "sub": "Accounts · assets · liabilities"
    }
  },
  {
    "id": "09-budgets",
    "sourceScene": "06-budgets",
    "zh": {
      "title": "花钱有计划",
      "sub": "月度预算 · 分类预算 · 进度随时看"
    },
    "en": {
      "title": "Plan your spending",
      "sub": "Monthly plans · category budgets"
    }
  }
];

export function themesForSuite(suite) {
  if (suite === 'classic') return CLASSIC_THEMES;
  if (suite === 'features') return FEATURE_THEMES;
  if (suite === 'pages') return THEMES;
  throw new Error(`Unknown suite: ${suite}`);
}

export const FORMATS = {
  ios: { width: 1320, height: 2868, label: 'iPhone 6.9″', kind: 'screenshot' },
  'ios-medium': { width: 1206, height: 2622, label: 'iPhone Dynamic Island · medium', kind: 'screenshot' },
  android: { width: 1080, height: 1920, label: 'Android', kind: 'screenshot' },
  feature: { width: 1024, height: 500, label: 'Google Play feature', kind: 'feature' },
};
// This revision targets the exact upload slot shown in App Store Connect.
export function platformsForSuite(suite) {
  return suite === 'classic' ? ['ios-medium'] : Object.keys(FORMATS);
}

export const NATIVE_FORMATS = {...FORMATS, android: {...FORMATS.android, height: 2400}};
export const LANGUAGES = ['zh', 'en'];
export const MODES = ['light', 'dark'];
export const FEATURE_COPY = {
  zh: {
    brand: 'BeeCount', brandSub: '蜜蜂记账',
    tagline: '生活有数，心里有底',
    chips: ['日常记账', '收支洞察', '预算计划'],
  },
  en: {
    brand: 'BeeCount', brandSub: 'Personal finance',
    tagline: 'Keep life in balance',
    chips: ['Track', 'Understand', 'Plan'],
  },
};

export const FEATURE_FOCUS_COPY = {
  zh: {brand: 'BeeCount', brandSub: '蜜蜂记账', tagline: '本地优先，选择自由', chips: ['本地账本', '可选云服务', '可选 AI']},
  en: {brand: 'BeeCount', brandSub: 'Personal finance', tagline: 'Local first. Your choice.', chips: ['Local books', 'Optional cloud', 'Optional AI']},
};

export const rawPath = (platform, lang, mode, scene) =>
  `raw/${platform}/${lang}/${mode}/${scene}.png`;

export function makeJob(platform, lang, mode, scene, suite = 'pages') {
  const format = FORMATS[platform];
  if (!format || !LANGUAGES.includes(lang) || !platformsForSuite(suite).includes(platform)) throw new Error('Unknown platform or language');
  if (platform === 'feature') {
    return {
      platform, lang, mode: 'light', scene: 'feature', sourceFormat: NATIVE_FORMATS.android, ...format,
      path: `feature/${lang}/feature.png`,
      raw: [rawPath('android', lang, 'light', '02-analytics'), rawPath('android', lang, 'light', '01-home')],
      copy: (suite === 'features' ? FEATURE_FOCUS_COPY : FEATURE_COPY)[lang],
    };
  }
  const theme = themesForSuite(suite).find(item => item.id === scene);
  if (!theme || !MODES.includes(mode)) throw new Error('Unknown scene or appearance');
  const sourcePlatform = theme.mediaScene && platform === 'ios-medium' ? 'ios' : platform;
  return {
    sourceFormat: NATIVE_FORMATS[sourcePlatform],
    platform, lang, mode, scene, suite, ...format,
    path: `${platform}/${lang}/${mode}/${scene}.png`,
    raw: [theme.mediaScene ? `raw/stills/${sourcePlatform}/${lang}/${mode}/${theme.mediaScene}.png` : rawPath(platform, lang, mode, theme.sourceScene || scene)],
    copy: theme[lang],
  };
}

export function exportJobs({
  suite = 'pages', platforms = platformsForSuite(suite), languages = LANGUAGES, modes = MODES,
  scenes = themesForSuite(suite).map(theme => theme.id),
} = {}) {
  return platforms.flatMap(platform => languages.flatMap(lang =>
    platform === 'feature' ? [makeJob(platform, lang, 'light', 'feature', suite)]
      : modes.flatMap(mode => scenes.map(scene => makeJob(platform, lang, mode, scene, suite))),
  ));
}
