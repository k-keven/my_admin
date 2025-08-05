<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-container">
        <h1 class="logo">边界科技</h1>
        <p class="subtitle">管理系统</p>
      </div>
      <div class="form-container">
        <h2 class="form-title">登录</h2>
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="请输入用户名"
            :class="{ 'error-input': errors.username }"
          />
          <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            placeholder="请输入密码"
            :class="{ 'error-input': errors.password }"
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>
        <div class="remember-me">
          <input type="checkbox" id="remember" v-model="form.remember" />
          <label for="remember">记住我</label>
        </div>
        <button class="login-btn" @click="handleLogin" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const loading = ref(false)
    const loginError = ref('')
    
    const form = reactive({
      username: '',
      password: '',
      remember: false
    })
    
    const errors = reactive({
      username: '',
      password: ''
    })
    
    const validateForm = () => {
      let valid = true
      
      // 重置错误信息
      errors.username = ''
      errors.password = ''
      
      if (!form.username.trim()) {
        errors.username = '用户名不能为空'
        valid = false
      }
      
      if (!form.password) {
        errors.password = '密码不能为空'
        valid = false
      } else if (form.password.length < 6) {
        errors.password = '密码长度不能少于6位'
        valid = false
      }
      
      return valid
    }
    
    const handleLogin = async () => {
      if (!validateForm()) return
      
      loading.value = true
      loginError.value = ''
      
      try {
        // 调用Vuex中的login action
        await store.dispatch('login', {
          username: form.username,
          password: form.password,
          remember: form.remember
        })
        
        // 登录成功，跳转到首页
        router.push('/dashboard')
      } catch (error) {
        loginError.value = error.message || '登录失败，请检查用户名和密码'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      errors,
      loading,
      loginError,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: radial-gradient(circle at 10% 20%, rgba(90, 92, 106, 0.1) 0%, rgba(32, 45, 58, 0.01) 81.3%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
}

.login-box {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.logo-container {
  padding: 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #4a90e2, #5637d9);
  color: white;
}

.logo {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 5px 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.form-container {
  padding: 30px;
}

.form-title {
  margin: 0 0 20px;
  font-size: 22px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #4a90e2;
  outline: none;
}

.error-input {
  border-color: #ff4d4f !important;
}

.error-message {
  margin: 5px 0 0;
  font-size: 12px;
  color: #ff4d4f;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me input {
  margin-right: 8px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  color: white;
  background: #4a90e2;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #3a7bd5;
}

.login-btn:disabled {
  background: #95b8e4;
  cursor: not-allowed;
}

.login-error {
  margin: 15px 0 0;
  padding: 10px;
  text-align: center;
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.05);
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 450px) {
  .login-box {
    width: 90%;
    max-width: 400px;
  }
}
</style> 