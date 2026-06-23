# XPlayer 商店上架素材

App Store(iPhone/iPad/Mac)+ Google Play 上架截图与横版图。深色卡 + 绿色点缀,呼应 app 暗色 UI。

## 目录

```
projects/xplayer/store/
├─ templates/
│  ├─ app.js        场景文案 + 设备尺寸 + 渲染逻辑(改文案改这里)
│  ├─ shared.css    样式(深色 + 绿色)
│  ├─ render.html   单卡渲染页(build.sh 用)
│  └─ index.html    预览画廊(浏览器打开看全部)
├─ raw/{en,zh}/     原始 app 截图(01-home … 05-remote,按语言分目录)
├─ output/
│  ├─ apple/        App Store 6.9" 1320×2868
│  └─ google-play/  Play 手机 1080×2400 + feature 1024×500
├─ build.sh         出图脚本(headless Chrome)
└─ logo.png         app 图标(feature 图用)
```

## 出图

```bash
bash projects/xplayer/store/build.sh
```

需要本机装 Google Chrome。产物直接写进 `output/`,PNG 无 alpha 通道(满足 ASC 要求)。

## 预览

```bash
cd /Users/matrix/code/mine/BeeCount-Press && python3 -m http.server 8765
# 打开 http://localhost:8765/projects/xplayer/store/templates/index.html
```

## 各端要交什么

### Apple App Store Connect
| 素材 | 文件 | 备注 |
|---|---|---|
| iPhone 6.5" 截图 | `output/apple/6.5-{en,zh}-{01..05}.png` | 1284×2778(ASC 接受 1242×2688 / 1284×2778) |
| iPad 13" 截图 | (待补 iPad 原图后加) | 2064×2752 |
| Mac 截图 | (待补 mac 原图后加) | 2560×1600 |
| App 图标 | xplayer 仓库已有(1024 无 alpha) | |

### Google Play Console
| 素材 | 文件 | 备注 |
|---|---|---|
| 手机截图 | `output/google-play/android-{en,zh}-{01..05}.png` | 1080×2400,每语言 ≥ 2 张 |
| 置顶大图 Feature | `output/google-play/feature-{en,zh}.png` | 1024×500 |
| 应用图标 | 512×512(从 logo 导) | |

## 场景

1. home 频道列表 · 2. player 正在播放 · 3. search 搜索 · 4. groups 分组 · 5. remote 手机遥控

> home/player 中英同图;search/groups/remote 分语言(raw/en 与 raw/zh)。
