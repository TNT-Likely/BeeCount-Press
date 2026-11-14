# BeeCount 4.0 商店素材

本轮素材以 2026-11-12 的 `v4` 工作区为来源，在全新隔离模拟器中生成中英文合成账本并采集。所有页面来自实际 App；使用用户指定的样例头像。旧 `output/` 和 `output-final/` 保留为历史版本。

## 2026-11-13 · 经典文案新版

默认工作台现在打开 `?suite=classic&platform=ios-medium`。经典版只提供 **1206 × 2622**，对应用户 App Store Connect 截图中的「带灵动岛的 iPhone（中等显示屏）」上传槽。旧 A/B 套的 1320 × 2868 属于另一设备组，不能上传到这个槽；旧版 1284 × 2778 也不用于这个槽。尺寸已对照 [Apple 截图规范](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) 和用户提供的后台提示，核对日期为 2026-11-13。

经典版沿用老版的主副标题层级与卖点顺序：开源隐私、云服务、统计、AI、快速记账、多账本、标签、资产，最后用预算页替换旧设置页。标题使用思源黑体 Bold；背景按用户反馈恢复为原有的米白蜂蜜渐变、柔和光斑与星星装饰。截图完整等比展示、轻微圆角与柔和阴影，不加手机框。AI 页沿用上一轮实际操作原图，本轮没有重新采集 App。

文案按真实界面调整：不承诺「一秒入账」，不把标签描述为自动归类；云服务列出当前支持的 iCloud、WebDAV、S3 与自托管。不同步新增韩文或繁体中文。

成图位于 `output-appstore-20261113-legacy-bg/ios-medium/{zh,en}/{light,dark}/`，共 **36 张：2 种语言 × 2 种外观 × 9 张**。每次上传同一文件夹内的 9 张，按文件名顺序排列。所有 PNG 为不透明 RGB，并附带尺寸、字体、布局与原图哈希校验结果。独立交付包及离线预览位于 BeeCount 的忽略目录 `.docs/store-refresh-20261113/`。

```bash
BEECOUNT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node projects/beecount/store/v4/export.mjs \
  --suite=classic --platform=ios-medium \
  --origin=http://127.0.0.1:8767 \
  --output=./projects/beecount/store/v4/output-appstore-new
```

经典版导出器拒绝其他设备尺寸。A/B 的预览和导出仍可用。

## 两套表达

| 顺序 | A · 页面展示 | B · 产品特色 |
| --- | --- | --- |
| 1 | 每一笔都清楚 | 本地优先 |
| 2 | 随手记一笔 | 云服务按需选 |
| 3 | 看清钱去哪了 | AI 按需开启 |
| 4 | 花钱有计划 | 图片也能记账 |
| 5 | 账户心中有数 | 开源透明 |
| 6 | 生活分本记录 | 旧账轻松导入 |
| 7 | 给记录加标签 | 多账本分开记 |
| 8 | 换个喜欢的颜色 | 外观由你决定 |

A 另备搜索、分类、云服务、工具四张候选图。B 的 AI 对话和图片记账界面来自本轮实际模型调用后的原生画面。两套统一沿用旧版蜂蜜色背景，只保留一行短标题，放大真实截图并添加轻微圆角；不加手机框。

两套均有中文 / 英文、浅色 / 深色和三个竖版输出尺寸。每组推荐上传 8 张；同一组不要混用明暗版本。特色文案明确云和 AI 按需使用，不承诺启用云或第三方 AI 后数据仍永不离开设备。

## 当前文件

- `store-data.mjs`：两套文案、推荐顺序、原图引用与尺寸。
- `index.html`、`styles.css`、`screenshots.js`：无 CDN 的本地预览工作台。方案筛选对应 `?suite=pages` / `?suite=features`。
- `raw/{ios,ios-medium,android}/{zh,en}/{light,dark}/`：144 张基础原图。
- `raw/stills/{ios,android}/…`：16 张操作中的原生静态画面；中尺寸 iPhone 的 B 套按实际原图比例排入大尺寸 iPhone 操作画面，不拉伸、不跨操作系统借图。
- `raw/manifest.json`：尺寸、源码身份和 SHA256。
- `media/{ios,android}/{zh,en}/{light,dark}/`：六种实际工作流及 iOS 快捷指令的 MP4、GIF 与静态封面。
- `output-launch-20261112/pages/`：A 全部 146 张 PNG（含 48 张额外候选）。
- `output-launch-20261112/features/`：B 全部 98 张 PNG。

本轮定稿导出 `output-launch-20261112/{pages,features}/` 与原图、动图和生成器一起在本仓维护。完整交付包在 BeeCount 忽略的 `.docs/v4-launch-refresh-20261112/delivery/`。

## 尺寸

| 目标 | 成图 | 原生来源 |
| --- | --- | --- |
| iPhone Dynamic Island · medium | 1206 × 2622 | 独立 iPhone 17 Pro；操作静态画面见上文 |
| iPhone Dynamic Island · large | 1320 × 2868 | 独立 iPhone 17 Pro Max |
| Google Play 手机 | 1080 × 1920 | 独立 Android，完整 1080 × 2400 原图等比排入 |
| Play feature graphic | 1024 × 500 | 对应语言的 Android 原图 |

苹果当前要求提供中尺寸 Dynamic Island iPhone 截图，每个尺寸最多 10 张；本套另提供大尺寸。来源：[Apple 截图规范](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)。Google Play 每种设备最多 8 张；本套采用推荐的 9:16 手机比例，feature graphic 为 1024 × 500。来源：[Google Play 素材规范](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)。核对日期：2026-11-12。

原图完整、等比展示，截图外沿仅有轻微圆角，成图不添加模拟手机框、刘海或设备外壳；不涂改 App 里的金额、界面文案或模型回答。

标题字体采用端正的思源黑体 Source Han Sans SC Bold（v2.005），使用真实 700 字重、正常直立字形。遵循 SIL Open Font License 1.1，可免费商用。原始字体与许可证保存在 `assets/fonts/`；[官方许可](https://github.com/adobe-fonts/source-han-sans/blob/release/LICENSE.txt)。

## 预览与重新导出

在 Press 根目录运行 `python3 -m http.server 8766 --bind 127.0.0.1`，打开：

- A：<http://127.0.0.1:8766/projects/beecount/store/v4/?suite=pages>
- B：<http://127.0.0.1:8766/projects/beecount/store/v4/?suite=features>

导出要求 Node 20+、Playwright、本机 Google Chrome。Playwright 可位于外部工具环境，无需为 Press 安装依赖：

```bash
BEECOUNT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node projects/beecount/store/v4/export.mjs \
  --suite=pages --origin=http://127.0.0.1:8766 \
  --output=./projects/beecount/store/v4/output-new/pages

BEECOUNT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node projects/beecount/store/v4/export.mjs \
  --suite=features --origin=http://127.0.0.1:8766 \
  --output=./projects/beecount/store/v4/output-new/features
```

可使用 `--platform=ios,ios-medium,android,feature`、`--lang=zh,en`、`--mode=light,dark`、`--scene=<主题ID>` 筛选。已有目录默认拒绝覆盖；`--overwrite` 只替换本次清单中的文件，不删除其他内容。禁止输出到 `raw/`、`media/`、`assets/` 或旧 `output/`。

导出器核对实际字体、文字越界与重叠、完整原图比例、原图与成图哈希、PNG 尺寸、网络及 JS 错误。结果见各输出目录的 `manifest.json`、`validation.json`、`SHA256SUMS`。A 和 B 分别导出，不能把 B 所需的操作静态画面缺失伪装成 A 原图替代。

## 工作流动图

六种流程：手动记账、图片识别记账、AI 对话、收支分析、复制交易、CSV 导入。图片识别调用真实视觉模型，并断言新增支出合计为合成小票的 28 元、记录及原图附件存在；AI 对话调用实际模型。iOS 使用真实系统相册选择合成小票，并停留约 3.5 秒；入账后打开原图附件。Android 图片与 CSV 文件由夹具提供。

另有一条中文浅色的 iOS 快捷指令演示：手动点击原生快捷指令，打开小票、系统截屏、调用真实 AutoBillingAppIntent，再查看实际新增的 28 元支出。此条使用正常 App 入口，不是集成测试回调，不表示实录了物理敲击背面。文件名 `07-ios-shortcut`。

App README 默认展示手动、图片、AI 三种记录方式，其余操作与暗黑模式折叠。官网使用同一套 iOS 通用展示视频与各自实际首帧封面；双平台原录屏在本仓保留。

## 苹果产品页测试

建议以 A 的同语言、同外观 8 张作为原始产品页，以 B 对应的 8 张作为一个处理版本，保持图标、视频及其他文案一致。测试的是两种完整叙事，不将结论归因于单独一张图。所需的两个 iPhone 尺寸均按相同顺序准备。

在 App Store Connect 的 Product Page Optimization 中创建、提交并启动测试；本次只准备素材，不替用户启动公开测试或提交商店审核。功能与可测试素材以 [Apple 产品页优化说明](https://developer.apple.com/app-store/product-page-optimization/) 为准。
