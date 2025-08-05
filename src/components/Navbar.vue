<template>
  <div class="navbar">
    <div class="breadcrumb">
      <h3>{{ pageTitle }}</h3>
    </div>
    <div class="right-menu">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="搜索...">
      </div>
      <ThemeSwitch class="theme-toggle" />
      <div class="notification">
        <i class="fas fa-bell"></i>
        <span class="badge">3</span>
      </div>
      <div class="user-info" @click="toggleUserMenu">
        <img src="https://randomuser.me/api/portraits/men/85.jpg" alt="User Avatar">
        <span>{{ username }}</span>
        <i class="fas fa-chevron-down"></i>
        <div class="user-dropdown" v-if="showUserMenu">
          <div class="dropdown-item">
            <i class="fas fa-user"></i>
            <span>个人信息</span>
          </div>
          <div class="dropdown-item">
            <i class="fas fa-cog"></i>
            <span>设置</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ThemeSwitch from './ThemeSwitch.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const showUserMenu = ref(false)

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/dashboard')) return '仪表盘'
  if (path.includes('/users')) return '用户管理'
  if (path.includes('/products')) return '产品管理'
  if (path.includes('/orders')) return '订单管理'
  if (path.includes('/recharge')) return '充值列表'
  if (path.includes('/settings')) return '系统设置'
  return '管理系统'
})

const username = computed(() => {
  const user = store.getters.currentUser
  return user ? user.username : '管理员'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = () => {
  store.dispatch('logout')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  height: 60px;
  background-color: var(--navbar-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  transition: background-color 0.3s;
}

.breadcrumb h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
  transition: color 0.3s;
}

.right-menu {
  display: flex;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: var(--hover-color);
  border-radius: 4px;
  padding: 6px 12px;
  margin-right: 20px;
  transition: background-color 0.3s;
}

.search-box i {
  color: var(--secondary-text-color);
  margin-right: 8px;
  transition: color 0.3s;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  color: var(--text-color);
  width: 180px;
  transition: color 0.3s;
}

.theme-toggle {
  margin-right: 20px;
}

.notification {
  position: relative;
  margin-right: 20px;
  cursor: pointer;
}

.notification i {
  font-size: 18px;
  color: var(--secondary-text-color);
  transition: color 0.3s;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.user-info img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-info span {
  margin-right: 8px;
  color: var(--text-color);
  transition: color 0.3s;
}

.user-dropdown {
  position: absolute;
  top: 45px;
  right: 0;
  background-color: var(--card-bg);
  border-radius: 4px;
  box-shadow: var(--shadow);
  width: 160px;
  z-index: 100;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: var(--hover-color);
  transition: background-color 0.3s;
}

.dropdown-item i {
  margin-right: 10px;
  font-size: 14px;
  color: var(--secondary-text-color);
  width: 14px;
  text-align: center;
  transition: color 0.3s;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 5px 0;
  transition: background-color 0.3s;
}
</style> 