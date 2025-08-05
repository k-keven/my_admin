<template>
  <div class="theme-switch-wrapper">
    <el-tooltip
      :content="theme === 'dark' ? '切换到明亮模式' : '切换到暗黑模式'"
      placement="bottom"
    >
      <el-button
        class="theme-switch"
        @click="toggleTheme"
        :type="buttonType"
      >
        <el-icon v-if="theme === 'dark'"><Sunny /></el-icon>
        <el-icon v-else><Moon /></el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Moon, Sunny } from '@element-plus/icons-vue'

export default {
  name: 'ThemeSwitch',
  components: {
    Moon,
    Sunny
  },
  setup() {
    const store = useStore()
    
    const theme = computed(() => store.getters.currentTheme)
    const buttonType = computed(() => theme.value === 'dark' ? 'warning' : 'primary')
    
    const toggleTheme = () => {
      store.dispatch('toggleTheme')
    }
    
    return {
      theme,
      toggleTheme,
      buttonType
    }
  }
}
</script>

<style scoped>
.theme-switch-wrapper {
  display: inline-block;
}

.theme-switch {
  border-radius: 50%;
  height: 36px;
  width: 36px;
  padding: 6px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.theme-switch:hover {
  transform: scale(1.1);
}

.theme-switch:active {
  transform: scale(0.95);
}

.el-icon {
  font-size: 18px;
}
</style> 