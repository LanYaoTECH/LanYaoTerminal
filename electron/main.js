import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
var mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: false,
        title: '澜鳐控制终端'
    });
    // 加载应用
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
// IPC通信示例
ipcMain.on('message-from-renderer', function (event, arg) {
    console.log(arg);
    event.reply('message-from-main', 'Hello from main process');
});
