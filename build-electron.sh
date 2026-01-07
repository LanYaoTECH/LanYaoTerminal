#!/bin/bash

# 创建输出目录
mkdir -p dist-electron

# 使用 esbuild 编译 electron-main.ts 为 ES module 格式
npx esbuild electron-main.ts --bundle --platform=node --format=esm --outfile=dist-electron/electron-main.js --external:electron --external:path

# 直接用 tsc 编译 electron-preload.ts
npx tsc electron-preload.ts --module commonjs --target es2020 --outDir dist-electron --esModuleInterop

echo "Electron files compiled successfully"
