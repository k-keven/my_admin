<template>
  <div class="app-container">
    <template v-if="isAuthenticated">
      <Sidebar />
      <div class="main-content">
        <Navbar />
        <div class="page-container">
          <router-view />
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const store = useStore()
const isAuthenticated = computed(() => store.getters.isAuthenticated)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.page-container {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background-color: #f5f7f9;
}
</style> 