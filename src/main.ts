import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 创建Vue应用
const app = createApp(App)

// 注册插件
app.use(ArcoVue)
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')