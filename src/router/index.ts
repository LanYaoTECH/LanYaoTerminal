import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/device-control'
    },
    {
      path: '/device-control',
      component: () => import('../pages/DeviceControl/index.vue'),
      meta: {
        title: '设备控制'
      }
    },
    {
      path: '/device-manage',
      component: () => import('../pages/DeviceManage/index.vue'),
      meta: {
        title: '设备管理'
      }
    },
    {
      path: '/logs',
      component: () => import('../pages/Log/index.vue'),
      meta: {
        title: '日志管理'
      }
    },
    {
      path: '/gateway',
      component: () => import('../pages/Gateway/index.vue'),
      meta: {
        title: '网关管理'
      }
    },
    {
      path: '/user',
      component: () => import('../pages/User/index.vue'),
      meta: {
        title: '用户管理'
      }
    }
  ]
})

// 路由前置守卫
router.beforeEach((to) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 澜鳐控制终端`
  }
  return true
})

export default router