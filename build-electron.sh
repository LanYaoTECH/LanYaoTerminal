#!/bin/bash

mkdir -p dist-electron

npx esbuild electron-main.ts --bundle --platform=node --format=esm --outfile=dist-electron/electron-main.js --external:electron --external:path

npx tsc electron-preload.ts --module commonjs --target es2020 --outDir dist-electron --esModuleInterop

echo "Electron files compiled successfully"
