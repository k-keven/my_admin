import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 导入暗黑模式CSS变量
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 导入样式
import './assets/css/main.css'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(store)
app.use(ElementPlus, {
  locale: zhCn
})

// 初始化主题
const applyStoredTheme = () => {
  const theme = localStorage.getItem('theme') || 'light'
  document.documentElement.className = theme
}
applyStoredTheme()

// 挂载应用
app.mount('#app') 