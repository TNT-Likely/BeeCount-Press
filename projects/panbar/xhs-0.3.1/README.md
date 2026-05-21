# PanBar 0.3.x · 小红书 3:4 发布物料(6 张)

跟 BeeCount 系列同一套生成机制(html2canvas 截图),但走深紫黑色调,跟 PanBar
app 内的 macOS menubar 视觉一致。

## 文件清单

| 文件 | 内容 |
|---|---|
| `01-cover.html` | 总封面:PanBar logo + 标题 + 标签 + 菜单栏 mock |
| `02-three-markets.html` | A / 港 / 美 三市卡 + 本位币汇总 |
| `03-display-modes.html` | 4 种菜单栏展现形式(滚动 / 轮播 / 固定 / 极简)mock |
| `04-features.html` | 8 个核心特性 grid |
| `05-privacy.html` | 完全本地 / 无埋点(对比传统盯盘 app) |
| `06-cta.html` | 立即下载 + GitHub URL |
| `series.css` | 共享样式 token + 组件 |
| `index.html` | 预览 + 导出 host page |
| `export.js` | html2canvas + JSZip 截图导出 |
| `export.css` | host page 自身样式 |
| `assets/` | 从 GIF 提的帧,备用素材 |
| `output/` | 导出 PNG 落到这里(空目录,被 git ignore) |

## 怎么用

1. 在浏览器(Chrome/Edge 最佳)开 `index.html`
2. 顶部「模板」下拉 6 张轮播预览
3. 「DPR 2x」推荐(2484×3312 高清,小红书放大不糊)
4. 「导出当前 PNG」 → 选 `output/` 目录直写,或下载到默认 Downloads

## 设计 token

- BG:`#0E0F1A`(深紫黑)
- Accent:`#7C5CFF`(跟 app 内 AccentColor.colorset 一致)
- Up:`#FF453A`(东方涨红)
- Down:`#30D158`(东方跌绿)
- Font:`-apple-system`(中文 fallback PingFang)+ `JetBrains Mono`(数字)

## 跟 BeeCount 的差异

| | BeeCount | PanBar |
|---|---|---|
| 色调 | 蜂蜜暖色 (`#FFF8EC`) | 深紫黑 (`#0E0F1A`) |
| 强调色 | 蜂蜜橙 (`#F4A82B`) | 紫 (`#7C5CFF`) |
| 字体 | Noto Serif SC + Caveat | -apple-system + JetBrains Mono |
| 感觉 | 治愈 / 暖 / 手账 | 科技 / 冷 / 金融 |

## 发布前 checklist

- [ ] 在 Chrome 至少全张预览一次,排版没溢出
- [ ] 导出全部 6 张(DPR 2x)
- [ ] 文案最后一次校对版本号(0.3.x → 真实最新版)
- [ ] 把 `06-cta.html` 里的链接确认是当前 release URL
- [ ] 第一张作为小红书封面,后 5 张作为图文(共 6 张正好)
