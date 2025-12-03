import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 创建Vue应用
const app = createApp(App)

// 注册插件
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  // 这里可以添加错误上报逻辑
}

// 挂载应用
app.mount('#app')