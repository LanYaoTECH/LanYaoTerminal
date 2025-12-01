import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/device-control'
  },
  {
    path: '/device-control',
    name: 'DeviceControl',
    component: () => import('../pages/DeviceControl/index.vue'),
    meta: {
      title: '设备控制'
    }
  },
  {
    path: '/device-manage',
    name: 'DeviceManage',
    component: () => import('../pages/DeviceManage/index.vue'),
    meta: {
      title: '设备管理'
    }
  },
  {
    path: '/logs',
    name: 'Log',
    component: () => import('../pages/Log/index.vue'),
    meta: {
      title: '日志管理'
    }
  },
  {
    path: '/gateway',
    name: 'Gateway',
    component: () => import('../pages/Gateway/index.vue'),
    meta: {
      title: '网关管理'
    }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../pages/User/index.vue'),
    meta: {
      title: '用户管理'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 澜鳐控制终端`
  }
  next()
})

export default router