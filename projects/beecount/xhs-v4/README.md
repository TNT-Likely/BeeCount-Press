# 蜜蜂记账 4.0 · 小红书倾斜截图墙

两张 3:4 宣传图，均为 **1440 × 1920**，提供 PNG 原图和高质量 JPG：

| 成图 | 外观 | 页面 |
| --- | --- | --- |
| `output/01-tilted-pages-light.png` | 浅色主封面 | 首页、洞察、记账、预算、账户、多账本 |
| `output/02-tilted-pages-dark.png` | 深色备选 | 对应页面的真实深色版本 |

页面以统一 −13° 角度错位排列，部分页面自然延伸到画布外沿。原生截图等比展示，不加手机外壳；使用沿用的蜂蜜色背景、简短标题和端正的思源黑体 Bold。

截图直接引用 `../store/v4/raw/ios/zh/{light,dark}/` 的本轮独立模拟器素材，显示合成示例账本。字体和真实品牌图标也复用 `store/v4/assets/`，无需重复复制或下载。思源黑体以 SIL OFL 1.1 发布，可免费商用，原始字体和许可证见该目录。

## 预览

在 Press 根目录启动 `python3 -m http.server 8766 --bind 127.0.0.1`，打开：

- [浅色](http://127.0.0.1:8766/projects/beecount/xhs-v4/?mode=light)
- [深色](http://127.0.0.1:8766/projects/beecount/xhs-v4/?mode=dark)

## 重新导出

使用本机 Chrome 和外部 Playwright 环境，无 CDN 或项目依赖安装：

```bash
BEECOUNT_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
  node projects/beecount/xhs-v4/export.mjs \
  --origin=http://127.0.0.1:8766
```

可传 `--output=/absolute/path/inside/xhs-v4` 更换输出子目录。导出器只写本次两张 PNG、两张 JPG 和三个校验文件，不删除其他文件。

导出前核对 12 张原生来源的 SHA256 与尺寸，检查标题字体、边界、标题与截图间距、截图比例、资源加载和运行错误；导出后回读校验。详情见 `output/manifest.json`、`output/validation.json`、`output/SHA256SUMS`。本次定稿的四张成图随模板一起提交，便于直接取用。
