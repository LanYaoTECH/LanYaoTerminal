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

// 挂载应用
app.mount('#app')