# LanYao Terminal

Electron + React + TypeScript + Vite 桌面应用。

应用特性：
- 打包为 macOS DMG（arm64）。
- 生产构建使用相对资源路径（Vite `base: './'`）。
- 打包环境下自动使用 Hash 路由；默认进入“设备总览”。
- 预加载脚本使用 CommonJS（Electron 要求）。
- 默认不打开开发者工具，菜单可手动切换。

## 环境要求
- macOS（打包 DMG）
- Node.js 18+（建议 20+）

## 安装依赖
```bash
npm install
```

## 开发调试
分两个终端运行：
```bash
# 终端 1：启动前端 Vite 开发服务器
npm run dev

# 终端 2：启动 Electron（会在开发模式下加载 http://localhost:5173）
npx electron .
```

提示：主进程中使用了 `electron-is-dev` 来区分开发/生产；开发模式会自动打开 DevTools（如需可自行调整）。

## 生产打包（DMG）
一键构建：
```bash
./build-electron.sh && npm run build:dmg
```
输出文件位于：`dist/LanYao Terminal-<version>-arm64.dmg`

说明：
- `build-electron.sh`：使用 esbuild/tsc 编译主进程与预加载脚本。
- `npm run build:vite`：构建前端到 `dist/`（已设置 `base: './'`）。
- `electron-builder`：打包应用并生成 DMG。

## 目录与关键文件
- 主进程：`electron-main.ts` → 构建后 `dist-electron/electron-main.js`
- Preload：`electron-preload.ts`（CommonJS） → `dist-electron/electron-preload.js`
- 前端入口：`index.html` + `src/main.tsx`
- 生产资源：`dist/`
- 打包配置：`package.json` 字段 `build`

## 常见问题排查
- 白屏/资源 404：
  - 确认 `vite.config.ts` 中 `base: './'` 存在。
  - 打开 DevTools Network，检查 `index.html` 中 `./assets/...` 是否 200。
- 预加载脚本报错（import 语法错误）：
  - 确认 `dist-electron/electron-preload.js` 为 CommonJS（`require('electron')`）。
- 路由丢失/打开空白：
  - 打包环境使用 HashRouter（代码中已根据 `window.location.protocol === 'file:'` 自动切换）。
- 查看主进程日志：启动后 Console 会打印：
  - `Loading URL: file:///.../app.asar/dist/index.html`
  - `Preload: .../app.asar/dist-electron/electron-preload.js`

## 代码签名与公证（可选）
当前使用 ad-hoc 签名，未进行 notarization。需要正式分发可在 `package.json` 的 `build` 字段中配置签名与公证信息。

---
如需生成 Intel 或 Universal 包、添加应用图标、或自动化发布流程，我可以继续完善配置。
