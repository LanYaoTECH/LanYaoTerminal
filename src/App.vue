<template>
  <div class="app-container">
    <!-- 侧边栏导航 -->
    <el-aside width="200px" class="app-aside">
      <div class="logo">
        <h1>澜鳐控制终端</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/device-control">
          <el-icon><i-ep-device /></el-icon>
          <span>设备控制</span>
        </el-menu-item>
        <el-menu-item index="/device-manage">
          <el-icon><i-ep-setting /></el-icon>
          <span>设备管理</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><i-ep-document /></el-icon>
          <span>日志管理</span>
        </el-menu-item>
        <el-menu-item index="/gateway">
          <el-icon><i-ep-connection /></el-icon>
          <span>网关管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><i-ep-user /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
      
      <!-- 用户信息区域 -->
      <div class="sidebar-user-info">
        <el-dropdown>
          <div class="user-info-content">
            <el-icon class="user-icon"><i-ep-user-filled /></el-icon>
            <div class="user-details">
              <div class="username">{{ currentUser?.username || '未登录' }}</div>
              <div class="role">管理员</div>
            </div>
            <el-icon class="arrow-icon"><i-ep-arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container>
      <!-- 自定义标题栏（支持拖拽和窗口控制） -->
      <div class="custom-titlebar" :class="{ 'sidebar-closed': !isSidebarOpen }">
        <!-- 可拖拽区域 -->
        <div class="drag-area">
          <div class="titlebar-left" @click="toggleSidebar">
            <el-icon><i-ep-menu /></el-icon>
          </div>
          <div class="titlebar-center">
            <span class="current-page-title">{{ currentPageTitle }}</span>
          </div>
        </div>
        
        <!-- 窗口控制按钮 - 移到最右边 -->
        <div class="window-controls-right">
          <div class="control-btn minimize-btn" @click="handleMinimize">
            <el-icon><i-ep-minus /></el-icon>
          </div>
          <div class="control-btn maximize-btn" @click="handleMaximize">
            <el-icon v-if="!isMaximized"><i-ep-full-screen /></el-icon>
            <el-icon v-else><i-ep-crop /></el-icon>
          </div>
          <div class="control-btn close-btn" @click="handleClose">
            <el-icon><i-ep-close /></el-icon>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Connection as ConnectionIcon, 
  Monitor as DeviceIcon, 
  Document as DocumentIcon, 
  Menu as MenuIcon, 
  Setting as SettingIcon, 
  User as UserIcon, 
  UserFilled as UserFilledIcon, 
  ArrowDown as ArrowDownIcon, 
  FullScreen as FullScreenIcon, 
  Crop as CropIcon, 
  Minus as MinusIcon, 
  Close as CloseIcon 
} from '@element-plus/icons-vue'

// 注册图标
const iEpConnection = ConnectionIcon
const iEpDevice = DeviceIcon
const iEpDocument = DocumentIcon
const iEpMenu = MenuIcon
const iEpSetting = SettingIcon
const iEpUser = UserIcon
const iEpUserFilled = UserFilledIcon
const iEpArrowDown = ArrowDownIcon
const iEpFullScreen = FullScreenIcon
const iEpCrop = CropIcon
const iEpMinus = MinusIcon
const iEpClose = CloseIcon

// 路由
const route = useRoute()
const router = useRouter()

// 侧边栏状态
const isSidebarOpen = ref(true)

// 当前用户
const currentUser = ref({
  username: 'admin'
})

// 窗口状态
const isMaximized = ref(false)

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 计算当前页面标题
const currentPageTitle = computed(() => {
  return route.meta.title || '澜鳐控制终端'
})

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  router.push(index)
}

// 窗口控制方法
const handleMinimize = () => {
  console.log('点击了最小化按钮')
  // @ts-ignore - electronAPI通过preload注入
  if (window.electronAPI) {
    console.log('window.electronAPI存在')
    if (window.electronAPI.minimizeWindow) {
      console.log('调用window.electronAPI.minimizeWindow()')
      window.electronAPI.minimizeWindow()
    } else {
      console.error('window.electronAPI.minimizeWindow不存在')
    }
  } else {
    console.error('window.electronAPI不存在')
  }
}

const handleMaximize = () => {
  console.log('点击了最大化按钮')
  // @ts-ignore - electronAPI通过preload注入
  if (window.electronAPI) {
    console.log('window.electronAPI存在')
    if (window.electronAPI.maximizeWindow) {
      console.log('调用window.electronAPI.maximizeWindow()')
      window.electronAPI.maximizeWindow()
      isMaximized.value = !isMaximized.value
    } else {
      console.error('window.electronAPI.maximizeWindow不存在')
    }
  } else {
    console.error('window.electronAPI不存在')
  }
}

const handleClose = () => {
  console.log('点击了关闭按钮')
  // @ts-ignore - electronAPI通过preload注入
  if (window.electronAPI) {
    console.log('window.electronAPI存在')
    if (window.electronAPI.closeWindow) {
      console.log('调用window.electronAPI.closeWindow()')
      window.electronAPI.closeWindow()
    } else {
      console.error('window.electronAPI.closeWindow不存在')
    }
  } else {
    console.error('window.electronAPI不存在')
  }
}

// 页面挂载时检查环境
onMounted(() => {
  console.log('App.vue挂载完成，检查window.electronAPI...')
  console.log('window对象:', window)
  console.log('window.electronAPI:', window.electronAPI)
  // @ts-ignore - electronAPI通过preload注入
  if (window.electronAPI) {
    console.log('window.electronAPI存在，开始监听窗口状态事件')
    // 监听窗口最大化
    // @ts-ignore - electronAPI通过preload注入
    window.electronAPI.onWindowMaximized(() => {
      console.log('收到窗口最大化事件')
      isMaximized.value = true
    })
    
    // 监听窗口取消最大化
    // @ts-ignore - electronAPI通过preload注入
    window.electronAPI.onWindowUnmaximized(() => {
      console.log('收到窗口取消最大化事件')
      isMaximized.value = false
    })
    
    // 监听窗口状态变化（初始化时）
    // @ts-ignore - electronAPI通过preload注入
    window.electronAPI.onWindowStateChanged((event: any, data: { maximized: boolean }) => {
      console.log('收到窗口状态变化事件:', data)
      isMaximized.value = data.maximized
    })
  } else {
    console.error('window.electronAPI不存在，可能是preload脚本没有正确加载')
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  // @ts-ignore - electronAPI通过preload注入
  if (window.electronAPI && window.electronAPI.removeWindowStateListener) {
    window.electronAPI.removeWindowStateListener()
  }
})
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fa;
}

.app-aside {
  background-color: #001529;
  color: #fff;
  overflow-y: auto;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #1f2d3d;
}

.logo h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.el-menu-vertical-demo {
  background-color: transparent;
  border-right: none;
}

.el-menu-item {
  color: #fff;
}

.el-menu-item.is-active {
  background-color: #1890ff;
}

.el-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
  width: 100%;
}

/* 自定义标题栏样式 */
.custom-titlebar {
  display: flex;
  align-items: center;
  height: 56px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: padding-left 0.3s;
}

/* 拖拽区域 - 支持窗口拖拽 */
.drag-area {
  display: flex;
  align-items: center;
  flex: 1;
  -webkit-app-region: drag;
  height: 100%;
}

.titlebar-left {
  padding: 0 16px;
  -webkit-app-region: no-drag;
  cursor: pointer;
}

.titlebar-center {
  flex: 1;
  padding-left: 10px;
}

.current-page-title {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

/* 窗口控制按钮 - 右侧布局 */
.window-controls-right {
  display: flex;
  height: 100%;
  margin-left: auto;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: #f0f0f0;
}

.close-btn:hover {
  background-color: #ff4d4f !important;
  color: #fff;
}

/* 侧边栏用户信息样式 */
.sidebar-user-info {
  padding: 16px;
  border-top: 1px solid #1f2d3d;
  margin-top: auto;
}

.user-info-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info-content:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-icon {
  font-size: 20px;
  margin-right: 10px;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.username {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  font-size: 12px;
  margin-left: 5px;
}

/* 侧边栏关闭时的样式调整 */
.sidebar-closed .titlebar-left {
  padding-left: 20px;
}

.el-main {
  padding: 0 !important;
  overflow: hidden;
}

.app-main {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>