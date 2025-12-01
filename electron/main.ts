import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import url from 'url'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    title: '澜鳐控制终端'
  })
  
  // 监听窗口最大化状态变化，同步到渲染进程
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized')
  })
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized')
  })
  
  // 添加窗口控制的IPC通信
  ipcMain.on('minimize-window', () => {
    console.log('收到最小化窗口请求')
    mainWindow.minimize()
  })
  
  ipcMain.on('maximize-window', () => {
    console.log('收到最大化窗口请求')
    if (mainWindow.isMaximized()) {
      console.log('窗口已最大化，执行取消最大化')
      mainWindow.unmaximize()
    } else {
      console.log('窗口未最大化，执行最大化')
      mainWindow.maximize()
    }
  })
  
  ipcMain.on('close-window', () => {
    console.log('收到关闭窗口请求')
    mainWindow.close()
  })
  
  // 初始化时告诉渲染进程窗口是否处于最大化状态
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('window-state-changed', {
      maximized: mainWindow.isMaximized()
    })
  })

  // 正常模式 - 连接到开发服务器
  mainWindow.loadURL('http://localhost:3000')
  console.log('正在连接到开发服务器: http://localhost:3000')
  
  // 添加详细的错误处理和调试信息
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    console.error('页面加载失败:', {
      errorCode,
      errorDescription,
      validatedURL,
      isMainFrame
    })
  })
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成')
    // 尝试执行一些JavaScript来验证页面是否正常工作
    mainWindow.webContents.executeJavaScript(
      `console.log('Electron已连接到Vue应用');
       document.body.style.background = '#f0f0f0';
       if (!document.querySelector('*')) {
         console.warn('页面内容为空');
         document.body.innerHTML = '<h1>Electron已连接，但页面内容为空</h1><p>请检查Vue应用是否正常运行</p>';
       }
      `
    )
  })
  
  mainWindow.webContents.on('crashed', () => {
    console.error('渲染进程崩溃')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC通信示例
ipcMain.on('message-from-renderer', (event, arg) => {
  console.log(arg)
  event.reply('message-from-main', 'Hello from main process')
})