# BeeCount-Press

> 用 HTML 写模板,html2canvas 出图,小红书 / 抖音 / 应用商店上架物料统一管。

轻量、纯前端、可 fork —— 不装 Node、不需要构建,**`python3 -m http.server` 打开就能用**。

## 仓库结构

```
BeeCount-Press/
├─ shared/                    跨项目共享:tokens、字体、品牌色板
│  └─ shared.css              主 design tokens(蜂蜜调色板 / 字体栈 / 组件样式)
├─ projects/                  按产品/客户分目录,各自独立
│  └─ beecount/               BeeCount(蜜蜂记账)的所有物料
│     ├─ xhs-3.2.0/           当前小红书 3.2 发版长图(7 张 3:4 卡片)
│     ├─ xhs-archive/         历史小红书物料(2.x / 3.0 时代 9 封面 + 6 信息图)
│     ├─ store/               iOS App Store / Google Play 上架截图生成器
│     ├─ copy/                小红书 / 抖音文案库
│     ├─ douyin/              抖音视频脚本 / 字幕 / BGM 占位
│     └─ assets/              本项目专属真实截图(被 HTML 引用的素材)
├─ docs/                      跨项目的使用文档、设计规范
└─ README.md
```

## 快速开始

```bash
# 1. 起本地 server(必须 http 协议,file:// 浏览器会拦图片和 FS API)
cd BeeCount-Press
python3 -m http.server 8765

# 2. 浏览器打开
# 小红书 3.2 发版:
open http://localhost:8765/projects/beecount/xhs-3.2.0/

# App Store 上架截图:
open http://localhost:8765/projects/beecount/store/templates/

# 3. 点「导出当前 PNG」/「导出全部」,Chrome/Edge 会弹「选文件夹」直写。
```

## 加新项目(给自己的产品做物料)

```bash
# 1. 复制 beecount 的目录骨架
cp -r projects/beecount projects/myapp

# 2. 改 projects/myapp/xhs-*/01-*.html 等模板,替换文案/截图
# 3. 修 projects/myapp/xhs-*/export.js 里的 TEMPLATES 数组
# 4. 跑 http server,出图
```

`shared/shared.css` 是品牌色板(蜂蜜调系列)。自己产品要用别的色,自定义一份 `projects/myapp/brand.css` 覆盖即可。

## 设计原则

- **零依赖**:不装 Node,不要 npm,纯 HTML/CSS/JS + CDN 加载 html2canvas
- **可读优先**:每个 .html 单文件可以读懂,不藏黑魔法
- **批量友好**:导出工具沿用 store/screenshots 那套(html2canvas + JSZip + File System Access API)
- **真实素材**:截图放 `projects/<name>/assets/`,模板里相对路径引用
- **历史归档**:旧版物料归到 `xhs-archive/` 而不是删掉,方便复用版式

## 协议

BSL(Business Source License) · 参考 BeeCount 主项目。
