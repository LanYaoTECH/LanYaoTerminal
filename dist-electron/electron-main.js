// electron-main.ts
import { app, BrowserWindow, Menu } from "electron";
import path from "path";

// node_modules/electron-is-dev/index.js
import electron from "electron";
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
var { env } = process;
var isEnvSet = "ELECTRON_IS_DEV" in env;
var getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;
var isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
var electron_is_dev_default = isDev;

// electron-main.ts
import { fileURLToPath, pathToFileURL } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var mainWindow = null;
var createWindow = () => {
  const appPath = app.isPackaged ? app.getAppPath() : __dirname;
  const preloadPath = app.isPackaged ? path.join(appPath, "dist-electron", "electron-preload.js") : path.join(__dirname, "electron-preload.js");
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  const startUrl = electron_is_dev_default ? "http://localhost:5173" : pathToFileURL(path.join(appPath, "dist", "index.html")).toString();
  console.log("Loading URL:", startUrl);
  console.log("Preload:", preloadPath);
  mainWindow.loadURL(startUrl);
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
var menu = Menu.buildFromTemplate([
  {
    label: "File",
    submenu: [
      {
        label: "Exit",
        accelerator: "CmdOrCtrl+Q",
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: "View",
    submenu: [
      {
        label: "Toggle Developer Tools",
        accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
        click: () => {
          mainWindow?.webContents.toggleDevTools();
        }
      },
      { role: "reload" },
      { role: "forceReload" },
      { role: "togglefullscreen" }
    ]
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        click: () => {
          mainWindow?.webContents.undo();
        }
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        click: () => {
          mainWindow?.webContents.redo();
        }
      },
      { type: "separator" },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        click: () => {
          mainWindow?.webContents.cut();
        }
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        click: () => {
          mainWindow?.webContents.copy();
        }
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        click: () => {
          mainWindow?.webContents.paste();
        }
      }
    ]
  }
]);
Menu.setApplicationMenu(menu);
