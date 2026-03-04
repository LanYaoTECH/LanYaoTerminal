# RayCore Terminal 鳐芯终端前端

Electron + React + TypeScript + Vite + TailwindCSS 桌面应用，配合RayCore Gateway实现设备的管理和控制。

## 功能概览

| 页面 | 路径 | 说明 |
|------|------|------|
| **总览** | `/` | 实时统计卡片（总设备数/在线/离线/网关状态）、设备卡片列表 |
| **设备控制** | `/device-control` | 完整泵控制面板：模式切换 (Raw/Period)、速度滑块、正转/停止/反转、位置定位、周期启停、校准、方向反转 |
| **设备管理** | `/device-management` | 设备增删改表格，实时显示连接状态 |
| **日志查看** | `/logs` | 分页展示操作日志，支持按设备和操作类型筛选 |
| **网关配置** | `/network-config` | 配置网关地址、测试连接、保存并重连 |

## 系统架构

```
RayCore Terminal (Electron/React)
  │  HTTP REST    ┌──────────────────┐  WebSocket   ┌──────────────┐
  ├──────────────→│ RayCore Gateway  │─────────────→│  ESP32 泵    │
  │  WebSocket    │  (port 3210)     │←─────────────│  (ws://<IP>) │
  └──────────────→│                  │  Status Push  └──────────────┘
                  └──────────────────┘
```

前端不直连泵设备，所有通信通过 RayCore Gateway（LanYaoGateway）中转。

## 项目结构

```
src/
├── App.tsx                        # 路由 + GatewayProvider
├── main.tsx                       # 入口
├── contexts/
│   └── GatewayContext.tsx         # 全局设备状态 React Context
├── services/
│   ├── api.ts                     # HTTP 调用层（设备CRUD、日志、健康检查）
│   └── websocket.ts               # Gateway WebSocket 客户端（实时状态推送）
├── types/
│   └── device.ts                  # 设备/电机/日志 TypeScript 类型 + 状态映射
├── pages/
│   ├── Dashboard.tsx              # 总览（实时图表 + 统计）
│   ├── DeviceControl.tsx          # 泵控制（Raw + Period 模式）
│   ├── DeviceManagement.tsx       # 设备增删改
│   ├── Logs.tsx                   # 操作日志
│   └── NetworkConfig.tsx          # 网关配置
├── components/                    # 通用 UI 组件
│   ├── Sidebar.tsx / Header.tsx
│   ├── DeviceCard.tsx / DeviceChart.tsx / DeviceSwitch.tsx
│   ├── StatsCard.tsx / StatusBadge.tsx
│   └── ui/                        # shadcn/ui 组件
├── hooks/
│   └── use-mobile.ts
└── lib/
    └── utils.ts
```

## 泵控制功能

### 直接控制模式 (Raw Mode)

- **速度控制**：滑块设定速度 (0–3000 RPM) + 正转 / 停止 / 反转
- **位置定位**：输入目标位置和速度，电机定位到指定位置
- **CAN ID 重绑定**：动态修改电机 CAN 节点 ID

### 周期模式 (Period Mode)

- **速度设定**：周期速度滑块 (2–500 RPM)
- **启停控制**：启动 / 停止周期往复运动
- **实时状态**：当前周期、进度条、已完成周期数
- **校准操作**：进入校准 → 设置 MIN → 设置 MAX
- **方向反转**：每个电机独立反转开关

## 安装与运行

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev
```

>网关地址可在"网关配置"页面修改，默认 `http://localhost:3210`。

## 快速开始

1. 启动后端：`cd ../LanYaoGateway && npm run dev`
2. 启动前端：`npm run dev`
3. 打开"网关配置"页面，确认连接正常
4. 进入"设备管理"，添加泵设备（填写 ESP32 IP）
5. 进入"设备控制"，选择设备进行操作
6. 在"日志查看"中追踪所有操作记录

## Electron 开发

分两个终端运行：
```bash
# 终端 1：启动前端 Vite 开发服务器
npm run dev

# 终端 2：启动 Electron（开发模式加载 http://localhost:5173）
npx electron .
```

应用特性：
- 打包为 macOS DMG（arm64）
- 生产构建使用相对资源路径（Vite `base: './'`）
- 打包环境下自动使用 Hash 路由
- 预加载脚本使用 CommonJS（Electron 要求）
- 默认不打开开发者工具，菜单可手动切换

## 生产打包（DMG）

一键构建：
```bash
./build-electron.sh && npm run build:dmg
```
输出文件位于：`dist/RayCore Terminal-<version>-arm64.dmg`

说明：
- `build-electron.sh`：使用 esbuild/tsc 编译主进程与预加载脚本
- `npm run build:vite`：构建前端到 `dist/`（已设置 `base: './'`）
- `electron-builder`：打包应用并生成 DMG

## 关键文件

| 文件 | 说明 |
|------|------|
| `electron-main.ts` | Electron 主进程入口 → `dist-electron/electron-main.js` |
| `electron-preload.ts` | 预加载脚本 → `dist-electron/electron-preload.js` |
| `index.html` + `src/main.tsx` | 前端入口 |
| `src/contexts/GatewayContext.tsx` | 全局设备状态管理 |
| `src/services/api.ts` | 网关 HTTP API 调用 |
| `src/services/websocket.ts` | 网关 WebSocket 客户端 |

## 常见问题排查

- **白屏/资源 404**：确认 `vite.config.ts` 中 `base: './'` 存在，DevTools Network 检查 `./assets/...` 是否 200
- **预加载脚本报错**：确认 `dist-electron/electron-preload.js` 为 CommonJS（`require('electron')`）
- **路由丢失/空白**：打包环境使用 HashRouter，代码根据 `window.location.protocol === 'file:'` 自动切换
- **网关连接失败**：确认 RayCore Gateway（LanYaoGateway）已启动，网关地址配置正确
