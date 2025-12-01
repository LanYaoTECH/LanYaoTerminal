import { contextBridge, ipcRenderer } from 'electron';
// 暴露IPC通信接口给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 发送消息到主进程
    sendMessage: function (channel, data) {
        ipcRenderer.send(channel, data);
    },
    // 接收主进程消息
    onMessage: function (channel, callback) {
        ipcRenderer.on(channel, callback);
    },
    // 移除事件监听
    removeListener: function (channel, callback) {
        ipcRenderer.removeListener(channel, callback);
    }
});
