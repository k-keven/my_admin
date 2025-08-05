<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <h2 v-if="!isCollapsed" class="logo-text">管理系统</h2>
      <span v-else class="logo-text">系</span>
    </div>
    <div class="menu">
      <div 
        v-for="item in menuItems" 
        :key="item.path"
        class="menu-item"
        :class="{ active: currentPath === item.path }"
        @click="navigateTo(item.path)"
      >
        <i :class="`fas fa-${item.icon}`"></i>
        <span v-if="!isCollapsed">{{ item.name }}</span>
      </div>
    </div>
    <div class="collapse-button" @click="toggleCollapse">
      <i :class="isCollapsed ? 'fas fa-angle-right' : 'fas fa-angle-left'"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const currentPath = computed(() => route.path)

const menuItems = [
  { name: '仪表盘', path: '/dashboard', icon: 'tachometer-alt' },
  { name: '用户管理', path: '/users', icon: 'users' },
  { name: '产品管理', path: '/products', icon: 'shopping-cart' },
  { name: '订单管理', path: '/orders', icon: 'file-invoice' },
  { name: '充值列表', path: '/recharge', icon: 'credit-card' },
  { name: '系统设置', path: '/settings', icon: 'cog' }
]

const navigateTo = (path) => {
  router.push(path)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100%;
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  transition: width 0.3s, background-color 0.3s, color 0.3s;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 80px;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s;
}

.menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.menu-item:hover {
  background-color: var(--sidebar-hover);
}

.menu-item.active {
  background-color: var(--menu-active-bg);
  color: var(--menu-active-text);
}

.menu-item i {
  font-size: 16px;
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.collapse-button {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  transition: border-color 0.3s;
}

.logo-text {
  color: var(--sidebar-text);
  transition: color 0.3s;
}
</style> 