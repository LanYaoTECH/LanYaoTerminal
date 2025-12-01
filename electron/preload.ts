import { contextBridge, ipcRenderer } from 'electron'

console.log('preload.ts脚本开始执行')

// 暴露IPC通信接口给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data)
  },
  // 接收主进程消息
  onMessage: (channel: string, callback: (event: any, data: any) => void) => {
    ipcRenderer.on(channel, callback)
  },
  // 移除事件监听
  removeListener: (channel: string, callback: (event: any, data: any) => void) => {
    ipcRenderer.removeListener(channel, callback)
  },
  // 窗口控制方法
  minimizeWindow: () => {
    ipcRenderer.send('minimize-window')
  },
  maximizeWindow: () => {
    ipcRenderer.send('maximize-window')
  },
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },
  // 窗口状态事件监听
  onWindowMaximized: (callback: () => void) => {
    ipcRenderer.on('window-maximized', callback)
  },
  onWindowUnmaximized: (callback: () => void) => {
    ipcRenderer.on('window-unmaximized', callback)
  },
  onWindowStateChanged: (callback: (event: any, data: { maximized: boolean }) => void) => {
    ipcRenderer.on('window-state-changed', callback)
  },
  // 移除窗口状态事件监听
  removeWindowStateListener: () => {
    ipcRenderer.removeAllListeners('window-maximized')
    ipcRenderer.removeAllListeners('window-unmaximized')
    ipcRenderer.removeAllListeners('window-state-changed')
  }
})