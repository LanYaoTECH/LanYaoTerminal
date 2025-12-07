<template>
  <div class="app-container">
    <!-- 侧边栏导航 -->
    <a-layout-sider :width="200" class="app-aside" :collapsed="!isSidebarOpen" :collapsible="true" @collapse="isSidebarOpen = false" @expand="isSidebarOpen = true">
      <div class="logo">
        <h1>澜鳐控制终端</h1>
      </div>
      <a-menu
        :default-selected-keys="[activeMenu]"
        mode="vertical"
        theme="dark"
        @select="handleMenuSelect"
      >
        <a-menu-item key="/device-control">
          <template #icon>
            <icon name="devices" />
          </template>
          <span>设备控制</span>
        </a-menu-item>
        <a-menu-item key="/device-manage">
          <template #icon>
            <icon name="settings" />
          </template>
          <span>设备管理</span>
        </a-menu-item>
        <a-menu-item key="/logs">
          <template #icon>
            <icon name="file-text" />
          </template>
          <span>日志管理</span>
        </a-menu-item>
        <a-menu-item key="/gateway">
          <template #icon>
            <icon name="wifi" />
          </template>
          <span>网关管理</span>
        </a-menu-item>
        <a-menu-item key="/user">
          <template #icon>
            <icon name="user" />
          </template>
          <span>用户管理</span>
        </a-menu-item>
      </a-menu>
      
      <!-- 用户信息区域 -->
      <div class="sidebar-user-info">
        <a-dropdown>
          <div class="user-info-content">
            <icon name="user" class="user-icon" />
            <div class="user-details">
              <div class="username">{{ currentUser?.username || '未登录' }}</div>
              <div class="role">管理员</div>
            </div>
            <icon name="down" class="arrow-icon" />
          </div>
          <template #dropdown>
            <a-dropdown-menu>
              <a-dropdown-item>个人中心</a-dropdown-item>
              <a-dropdown-item divided>退出登录</a-dropdown-item>
            </a-dropdown-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-sider>

    <!-- 主内容区域 -->
    <a-layout>
      <!-- 自定义标题栏 -->
      <a-layout-header class="custom-titlebar">
        <div class="titlebar-left" @click="toggleSidebar">
          <icon name="menu" />
        </div>
        <div class="titlebar-center">
          <span class="current-page-title">{{ currentPageTitle }}</span>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="app-main">
        <router-view />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@arco-design/web-vue/es/icon'

// 路由
const route = useRoute()
const router = useRouter()

// 侧边栏状态
const isSidebarOpen = ref(true)

// 当前用户
const currentUser = ref({
  username: 'admin'
})

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
const handleMenuSelect = (key: string) => {
  router.push(key)
}
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

/* 自定义标题栏样式 */
.custom-titlebar {
  display: flex;
  align-items: center;
  height: 56px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 16px;
}

.titlebar-left {
  padding: 8px;
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
.app-main {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>