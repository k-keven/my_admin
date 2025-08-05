import { createStore } from 'vuex'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    theme: localStorage.getItem('theme') || 'light'
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    currentTheme: state => state.theme
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_THEME(state, theme) {
      state.theme = theme
      localStorage.setItem('theme', theme)
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
    }
  },
  
  actions: {
    async login({ commit }, { username, password }) {
      try {
        // 这里应该调用实际的登录API
        // 以下是模拟登录成功的响应
        const response = {
          user: { id: 1, username, role: 'admin' },
          token: 'mock_token_' + Date.now()
        }
        
        // 保存到 localStorage
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('token', response.token)
        
        // 更新状态
        commit('SET_USER', response.user)
        commit('SET_TOKEN', response.token)
        
        return response
      } catch (error) {
        throw new Error('登录失败')
      }
    },
    
    logout({ commit }) {
      // 清除localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // 清除状态
      commit('CLEAR_AUTH')
    },
    
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      commit('SET_THEME', newTheme)
      // 应用主题到HTML根元素
      document.documentElement.className = newTheme
    }
  }
}) 