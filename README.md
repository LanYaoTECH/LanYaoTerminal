# 澜鳐控制终端

## 项目简介

澜鳐控制终端是一款基于 Electron + Vue 开发的桌面应用程序，用于连接澜鳐物联网网关，实现对各类物联网设备的集中控制与管理。支持纯局域网连接模式，无需公网，适用于无网络连接环境与实验室要求主机不得联网的保密环境。

## 核心功能

- **设备管理**：添加、删除、编辑物联网设备
- **设备控制**：实时控制设备开关、调节参数
- **状态监控**：实时显示设备运行状态
- **日志管理**：查看设备操作日志、系统日志
- **网关管理**：连接、配置物联网网关
- **用户管理**：多用户支持，权限控制

## 快速开始

### 开发环境搭建

1. 安装 Node.js（版本 >= 16.0.0）
2. 克隆项目代码
3. 安装依赖：
   ```bash
   npm install
   ```
4. 启动开发服务器：
   ```bash
   npm run dev
   ```
5. 启动 Electron 应用：
   ```bash
   npm run electron:dev
   ```

### 构建流程

```bash
# 构建 Vue 应用
npm run build

# 打包 Electron 应用
npm run electron:build
```

构建产物位于 `dist/` 目录

## 技术栈

- **主框架**：Electron ^25.0.0
- **前端框架**：Vue.js ^3.3.0
- **构建工具**：Vite ^4.4.0
- **UI 组件库**：Element Plus ^2.3.0
- **状态管理**：Pinia ^2.1.0
- **路由管理**：Vue Router ^4.2.0
- **数据库**：SQLite ^5.0.0

## 项目结构

```
├── build/                    # 构建配置文件
├── dist/                     # 构建输出目录
├── electron/                 # Electron 主进程代码
├── src/                      # Vue 渲染进程代码
├── public/                   # 公共资源
├── Docs.md                   # 详细技术文档
└── package.json              # 项目依赖
```

## 详细文档

请查看 [Docs.md](Docs.md) 获取完整的技术文档，包括：
- 系统架构
- 局域网连接机制
- 开发规范
- 部署与维护
- 常见问题排查
- API 文档
- 数据库设计

## 联系方式

- 项目地址：https://github.com/yourusername/LanYaoTerminal
- 问题反馈：https://github.com/yourusername/LanYaoTerminal/issues

test