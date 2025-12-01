"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = __importDefault(require("path"));
var mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // 无边框，完全隐藏标题栏和红绿灯按钮
        transparent: false, // 不透明
        // 移除titleBarStyle，避免与frame: false冲突
        // 移除macOS交通灯按钮 - 将位置设置到不可见区域
        trafficLightPosition: { x: -100, y: -100 },
        // 不显示标题栏覆盖层
        titleBarOverlay: null,
        // 确保窗口有正确的圆角和阴影
        roundedCorners: true,
        // 优化渲染性能
        backgroundColor: '#ffffff',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        title: '澜鳐控制终端'
    });
    // 监听窗口最大化状态变化，同步到渲染进程
    mainWindow.on('maximize', function () {
        mainWindow.webContents.send('window-maximized');
    });
    mainWindow.on('unmaximize', function () {
        mainWindow.webContents.send('window-unmaximized');
    });
    // 添加窗口控制的IPC通信
    electron_1.ipcMain.on('minimize-window', function () {
        console.log('收到最小化窗口请求');
        mainWindow.minimize();
    });
    electron_1.ipcMain.on('maximize-window', function () {
        console.log('收到最大化窗口请求');
        if (mainWindow.isMaximized()) {
            console.log('窗口已最大化，执行取消最大化');
            mainWindow.unmaximize();
        }
        else {
            console.log('窗口未最大化，执行最大化');
            mainWindow.maximize();
        }
    });
    electron_1.ipcMain.on('close-window', function () {
        console.log('收到关闭窗口请求');
        mainWindow.close();
    });
    // 初始化时告诉渲染进程窗口是否处于最大化状态
    mainWindow.once('ready-to-show', function () {
        mainWindow.webContents.send('window-state-changed', {
            maximized: mainWindow.isMaximized()
        });
    });
    // 正常模式 - 连接到开发服务器
    mainWindow.loadURL('http://localhost:3000');
    console.log('正在连接到开发服务器: http://localhost:3000');
    // 添加详细的错误处理和调试信息
    mainWindow.webContents.on('did-fail-load', function (event, errorCode, errorDescription, validatedURL, isMainFrame) {
        console.error('页面加载失败:', {
            errorCode: errorCode,
            errorDescription: errorDescription,
            validatedURL: validatedURL,
            isMainFrame: isMainFrame
        });
    });
    mainWindow.webContents.on('did-finish-load', function () {
        console.log('页面加载完成');
        // 尝试执行一些JavaScript来验证页面是否正常工作
        mainWindow.webContents.executeJavaScript("console.log('Electron\u5DF2\u8FDE\u63A5\u5230Vue\u5E94\u7528');\n       document.body.style.background = '#f0f0f0';\n       if (!document.querySelector('*')) {\n         console.warn('\u9875\u9762\u5185\u5BB9\u4E3A\u7A7A');\n         document.body.innerHTML = '<h1>Electron\u5DF2\u8FDE\u63A5\uFF0C\u4F46\u9875\u9762\u5185\u5BB9\u4E3A\u7A7A</h1><p>\u8BF7\u68C0\u67E5Vue\u5E94\u7528\u662F\u5426\u6B63\u5E38\u8FD0\u884C</p>';\n       }\n      ");
    });
    mainWindow.webContents.on('crashed', function () {
        console.error('渲染进程崩溃');
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
// IPC通信示例
electron_1.ipcMain.on('message-from-renderer', function (event, arg) {
    console.log(arg);
    event.reply('message-from-main', 'Hello from main process');
});
