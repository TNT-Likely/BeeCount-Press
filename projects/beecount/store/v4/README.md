# BeeCount v4 商店素材

本目录是 v4 商店素材的独立排版与导出入口，沿用 `../templates/` 的蜂蜜色渐变、光晕、星芒与居中标题。按最新要求，完整原生截图直接展示，不添加模拟手机框、黑色边框、刘海或设备圆角遮罩。文案只描述当前真实界面中可见的功能，不沿用旧版的 AI、OCR、Widget 或未出现在本轮截图中的宣传承诺。

## 完整素材集

默认导出 **98 张 PNG**：

| 内容 | 组合 | 张数 | 尺寸 |
| --- | --- | ---: | --- |
| iOS 商店截图 | 12 主题 × 中文/英文 × 浅色/深色 | 48 | 1320 × 2868，原生 iPhone 6.9″ |
| Android 商店截图 | 12 主题 × 中文/英文 × 浅色/深色 | 48 | 1080 × 2400 |
| Google Play feature graphic | 中文、英文各一张 | 2 | 1024 × 500 |

12 个主题全部使用：

- `01-home` 收支明细
- `02-analytics` 统计分析
- `03-accounts` 账户资产
- `04-ledgers` 多账本
- `05-transaction` 记账与展开的二级分类
- `06-budgets` 月度与分类预算
- `07-mine` 常用工具与设置
- `08-tags` 彩色标签
- `09-cloud` BeeCount Cloud 云同步入口
- `10-categories` 分类与展开的二级分类
- `11-personalization` 主题配色
- `12-search` 记录搜索

这里提供的是完整候选素材集，而不是要求在单个商店截图位上传全部 12 张。上架时按对应商店的截图数量限制选择。

## 原图与文件

- `raw/{ios,android}/{zh,en}/{light,dark}/`：96 张原生真实 PNG，来自独立模拟器与本地合成账本数据。
- `raw/manifest.json`：已有原图尺寸与 SHA256 来源清单；本轮不修改。
- `assets/logo.png`：已有 BeeCount 标志。
- `store-data.mjs`：主题、文案、尺寸与导出任务的唯一数据源。
- `index.html`、`styles.css`、`screenshots.js`：无 npm/CDN 依赖的筛选预览页。
- `export.mjs`：Node + Playwright + 本机 Chrome 元素截图导出器。
- `output-final/`：本轮全新导出目录；旧 `output/` 不修改。

**原图不裁切、不拉伸、不涂改。** 每张完整矩形原图等比缩放，直接展示；不绘制手机外框、黑边、外框阴影、刘海或圆角遮罩，原图自带的系统状态栏保持原样。深色版使用独立深色原图，并搭配深色蜂蜜光晕背景。

**没有跨平台或跨语言 fallback。** iOS 只读 iOS 图，Android 只读 Android 图。Play feature 只用本语言的 Android 浅色 `01-home`、`02-analytics` 两张完整原图，同样不添加模拟设备框；不使用 iOS 图，也不按外观重复导出。

截图采集和设备操作不属于本排版工具的工作；合成展示截图也不代表业务或云同步链路已通过验收。

## 操作演示视频

`media/{ios,android}/{zh,en}/{light,dark}/{01-add-transaction,02-ai-chat,04-data-analysis,05-copy-transaction,06-import-ledger}.{mp4,gif}`：真实工作流录屏（记一笔、AI 对话、数据分析、复制交易、导入账单），来自独立模拟器原生录制，按墙钟时间戳切分，无合成指针指示、无调试痕迹。`media/manifest.json` 记录来源 App SHA、时长与 SHA256。主工程 README 与官网使用其中的 iOS 浅色/暗黑版本作为通用展示；双平台完整矩阵保留在本目录。

## 预览与筛选

使用 Press 会话已有的本地 HTTP 预览配置，打开：

```text
http://127.0.0.1:8765/projects/beecount/store/v4/
```

页面可按平台、语言、外观和主题筛选。切换会同步到 URL，方便分享固定组合；手机宽度也可操作。原图链接打开完整来源 PNG；“下载当前清单”下载当前筛选的来源、目标路径与命令，不伪装成图片导出。

固定组合示例：

```text
?platform=ios&lang=zh&mode=light&scene=all
?platform=android&lang=en&mode=dark&scene=10-categories
?platform=feature&lang=zh
```

“批量导出与预览说明”中可以复制当前筛选或全部 98 张的终端命令。复制的命令使用带时间戳的新输出目录。`file://` 不适用 ES module 页面；请沿用既有 HTTP 预览，不需要 CDN，也无需另开一套导出服务。

## 批量导出

要求 Node.js 20+、Playwright 和本机 Google Chrome。Playwright 可以装在独立工具环境，通过环境变量指定入口；不需要往 Press 仓库安装依赖。

从 **Press 仓库根目录** 运行，默认生成全部 98 张：

```bash
BEECOUNT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node projects/beecount/store/v4/export.mjs \
  --origin=http://127.0.0.1:8765 \
  --output=./projects/beecount/store/v4/output-final
```

本机已有模块可使用：

```text
/Users/sunxiao/code/mine/BeeCount-Design/card-refresh/node_modules/playwright/index.mjs
```

筛选导出示例，需选择尚不存在的目录：

```bash
# 两个平台的中文深色版，共 24 张
node projects/beecount/store/v4/export.mjs \
  --platform=ios,android --lang=zh --mode=dark \
  --output=./projects/beecount/store/v4/output-zh-dark

# Android 英文浅色的两个二级分类主题，共 2 张
node projects/beecount/store/v4/export.mjs \
  --platform=android --lang=en --mode=light \
  --scene=05-transaction,10-categories \
  --output=./projects/beecount/store/v4/output-categories

# 仅两张 Play feature；来源固定为 Android 浅色
node projects/beecount/store/v4/export.mjs \
  --platform=feature \
  --output=./projects/beecount/store/v4/output-feature
```

以上筛选命令同样需要已安装 Playwright 或已设置 `BEECOUNT_PLAYWRIGHT_MODULE`。省略 `--origin` 时默认使用 `http://127.0.0.1:8765`。`--scene` 只筛选竖版截图；如不需要 feature，应在 `--platform` 中排除它。`--help` 显示完整参数。

### 覆盖保护

- 输出必须是 v4 内的独立目录，不能指向 `raw/`、`media/`、`assets/` 或旧 `output/`。
- **默认拒绝任何已存在的输出目录。** 失败后改用新的目录，或者明确加上 `--overwrite`。
- `--overwrite` 仅替换本次参数所列 PNG，以及本次的 `manifest.json`、`validation.json`、`SHA256SUMS`；不删除目录、不清理其他文件、不跟随输出路径的符号链接。
- 筛选导出的清单只列本次任务，不会把该目录以前留下的其他 PNG 冒充成本次结果。

## 输出清单与校验

```text
output-final/
  ios/{zh,en}/{light,dark}/01-home.png … 12-search.png
  android/{zh,en}/{light,dark}/01-home.png … 12-search.png
  feature/{zh,en}/feature.png
  manifest.json
  validation.json
  SHA256SUMS
```

导出器会在完成前检查：

1. 96 张原图全部存在、尺寸正确，且与已有 `raw/manifest.json` 的 SHA256 一致。
2. 每个标题、副标题与截图不重叠；文字和完整原生截图不越界，英文不溢出。
3. 图片保持完整原始宽高比，且来源的平台、语言、外观严格对应；同时检查截图容器与图片不存在模拟设备边框、背景、圆角、遮罩或外框阴影。
4. 等待图片解码与系统字体就绪；通过 Chrome 实际字体记录检查标题、副标题和 feature 文案的字形，不依赖远程字体。
5. 页面无 JS 错误、失败请求或外部 CDN 请求；每张最终 PNG 的尺寸正确。
6. 导出后重读全部成图核对 SHA256，并再次核对 96 张原图字节未改变。

`manifest.json` 包含每张图的尺寸、语言、外观、标题、原图路径/哈希、成图 SHA256 与字体记录。`validation.json` 汇总 missing、overlap、clipped、font 检查和数量。只有全部检查通过才写出完成清单。

可在输出目录使用 `shasum -a 256 -c SHA256SUMS` 独立复核文件。上架前仍应人工查看代表性成图，尤其是中英文标题、深色界面和 Play 横版。
