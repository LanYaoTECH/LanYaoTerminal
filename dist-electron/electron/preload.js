"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
console.log('preload.ts脚本开始执行');
// 暴露IPC通信接口给渲染进程
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // 发送消息到主进程
    sendMessage: function (channel, data) {
        electron_1.ipcRenderer.send(channel, data);
    },
    // 接收主进程消息
    onMessage: function (channel, callback) {
        electron_1.ipcRenderer.on(channel, callback);
    },
    // 移除事件监听
    removeListener: function (channel, callback) {
        electron_1.ipcRenderer.removeListener(channel, callback);
    },
    // 窗口控制方法
    minimizeWindow: function () {
        electron_1.ipcRenderer.send('minimize-window');
    },
    maximizeWindow: function () {
        electron_1.ipcRenderer.send('maximize-window');
    },
    closeWindow: function () {
        electron_1.ipcRenderer.send('close-window');
    },
    // 窗口状态事件监听
    onWindowMaximized: function (callback) {
        electron_1.ipcRenderer.on('window-maximized', callback);
    },
    onWindowUnmaximized: function (callback) {
        electron_1.ipcRenderer.on('window-unmaximized', callback);
    },
    onWindowStateChanged: function (callback) {
        electron_1.ipcRenderer.on('window-state-changed', callback);
    },
    // 移除窗口状态事件监听
    removeWindowStateListener: function () {
        electron_1.ipcRenderer.removeAllListeners('window-maximized');
        electron_1.ipcRenderer.removeAllListeners('window-unmaximized');
        electron_1.ipcRenderer.removeAllListeners('window-state-changed');
    }
});
