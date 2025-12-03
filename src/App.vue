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
          <el-icon><Monitor /></el-icon>
          <span>设备控制</span>
        </el-menu-item>
        <el-menu-item index="/device-manage">
          <el-icon><Setting /></el-icon>
          <span>设备管理</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>日志管理</span>
        </el-menu-item>
        <el-menu-item index="/gateway">
          <el-icon><Connection /></el-icon>
          <span>网关管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
      
      <!-- 用户信息区域 -->
      <div class="sidebar-user-info">
        <el-dropdown>
          <div class="user-info-content">
            <el-icon class="user-icon"><UserFilled /></el-icon>
            <div class="user-details">
              <div class="username">{{ currentUser?.username || '未登录' }}</div>
              <div class="role">管理员</div>
            </div>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
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
      <div class="custom-titlebar">
        <!-- 可拖拽区域 -->
        <div class="drag-area">
          <div class="titlebar-left" @click="toggleSidebar">
            <el-icon><Menu /></el-icon>
          </div>
          <div class="titlebar-center">
            <span class="current-page-title">{{ currentPageTitle }}</span>
          </div>
        </div>
        
        <!-- 窗口控制按钮 - 移到最右边 -->
        <div class="window-controls-right">
          <div class="control-btn minimize-btn" @click="handleMinimize">
            <el-icon><Minus /></el-icon>
          </div>
          <div class="control-btn maximize-btn" @click="handleMaximize">
            <el-icon v-if="!isMaximized"><FullScreen /></el-icon>
            <el-icon v-else><Crop /></el-icon>
          </div>
          <div class="control-btn close-btn" @click="handleClose">
            <el-icon><Close /></el-icon>
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
  Connection, 
  Monitor, 
  Document, 
  Menu, 
  Setting, 
  User, 
  UserFilled, 
  ArrowDown, 
  FullScreen, 
  Crop, 
  Minus, 
  Close 
} from '@element-plus/icons-vue'

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
  // @ts-ignore - electronAPI通过preload注入
  window.electronAPI?.minimizeWindow?.()
}

const handleMaximize = () => {
  // @ts-ignore - electronAPI通过preload注入
  window.electronAPI?.maximizeWindow?.()
  isMaximized.value = !isMaximized.value
}

const handleClose = () => {
  // @ts-ignore - electronAPI通过preload注入
  window.electronAPI?.closeWindow?.()
}

// 页面挂载时检查环境
onMounted(() => {
  // @ts-ignore - electronAPI通过preload注入
  const electronAPI = window.electronAPI
  if (electronAPI) {
    // 监听窗口最大化
    electronAPI.onWindowMaximized(() => {
      isMaximized.value = true
    })
    
    // 监听窗口取消最大化
    electronAPI.onWindowUnmaximized(() => {
      isMaximized.value = false
    })
    
    // 监听窗口状态变化（初始化时）
    electronAPI.onWindowStateChanged((_event: any, data: { maximized: boolean }) => {
      isMaximized.value = data.maximized
    })
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  // @ts-ignore - electronAPI通过preload注入
  window.electronAPI?.removeWindowStateListener?.()
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

/* 内容区域样式 */
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