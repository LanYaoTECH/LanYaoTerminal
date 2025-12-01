// 为Window对象添加electronAPI的类型定义
declare interface Window {
  electronAPI: {
    // 窗口控制方法
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    // 窗口状态事件监听方法
    onWindowMaximized: (callback: () => void) => void;
    onWindowUnmaximized: (callback: () => void) => void;
    onWindowStateChanged: (callback: (event: any, data: any) => void) => void;
    removeWindowStateListener: () => void;
  };
}