<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>系统设置</h1>
      <el-button type="primary" @click="saveSettings" :loading="saving">
        <el-icon><Check /></el-icon> 保存设置
      </el-button>
    </div>

    <div class="settings-container">
      <div class="loading-overlay" v-if="loading">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载设置中...</span>
        </div>
      </div>

      <!-- 基本信息设置 -->
      <div class="settings-section">
        <h2>基本信息设置</h2>
        <div class="settings-form">
          <div class="form-item">
            <label>平台名称</label>
            <el-input v-model="settings.platformName" placeholder="输入平台名称"></el-input>
            <div class="description">平台名称将显示在浏览器标签、登录界面和系统顶部</div>
          </div>
          <div class="form-item">
            <label>平台描述</label>
            <el-input v-model="settings.description" type="textarea" rows="3" placeholder="输入平台描述"></el-input>
            <div class="description">简短描述您的平台功能和用途</div>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="settings-section">
        <h2>安全设置</h2>
        <div class="settings-form">
          <div class="form-item">
            <label>系统密钥 (Secret Key)</label>
            <div class="key-input">
              <el-input 
                v-model="settings.secretKey" 
                :type="showSecretKey ? 'text' : 'password'" 
                placeholder="系统密钥"
                readonly
              ></el-input>
              <el-button @click="showSecretKey = !showSecretKey">
                <el-icon><View v-if="showSecretKey" /><Hide v-else /></el-icon>
              </el-button>
              <el-button type="warning" @click="regenerateKey('secret')" :loading="regeneratingSecret">
                重新生成
              </el-button>
            </div>
            <div class="description">
              用于API验证的系统密钥，请妥善保管，不要泄露给他人。重新生成后，旧密钥将立即失效。
            </div>
          </div>
          <div class="form-item">
            <label>应用密钥 (App Key)</label>
            <div class="key-input">
              <el-input 
                v-model="settings.appKey" 
                :type="showAppKey ? 'text' : 'password'" 
                placeholder="应用密钥"
                readonly
              ></el-input>
              <el-button @click="showAppKey = !showAppKey">
                <el-icon><View v-if="showAppKey" /><Hide v-else /></el-icon>
              </el-button>
              <el-button type="warning" @click="regenerateKey('app')" :loading="regeneratingApp">
                重新生成
              </el-button>
            </div>
            <div class="description">
              用于客户端应用认证的密钥，请勿在公开场合使用或嵌入客户端代码中。
            </div>
          </div>
        </div>
      </div>

      <!-- API设置 -->
      <div class="settings-section">
        <h2>API设置</h2>
        <div class="settings-form">
          <div class="form-item">
            <label>API域名</label>
            <el-input v-model="settings.apiDomain" placeholder="API域名地址"></el-input>
            <div class="description">设置API的访问域名，例如：https://api.example.com</div>
          </div>
          <div class="form-item">
            <label>API请求限制 (每分钟)</label>
            <el-input-number v-model="settings.rateLimit" :min="10" :max="1000" :step="5"></el-input-number>
            <div class="description">设置每个IP每分钟最大API请求次数，防止恶意请求</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading, Check, View, Hide } from '@element-plus/icons-vue'
import { getSystemSettings, updateSystemSettings, regenerateSecretKey, regenerateAppKey } from '../api/settings'

export default {
  name: 'Settings',
  components: {
    Loading,
    Check,
    View,
    Hide
  },
  setup() {
    const loading = ref(true)
    const saving = ref(false)
    const regeneratingSecret = ref(false)
    const regeneratingApp = ref(false)
    const showSecretKey = ref(false)
    const showAppKey = ref(false)

    const settings = reactive({
      platformName: '',
      description: '',
      secretKey: '',
      appKey: '',
      apiDomain: '',
      rateLimit: 60
    })

    // 获取设置
    const fetchSettings = async () => {
      loading.value = true
      try {
        const data = await getSystemSettings()
        Object.assign(settings, data)
      } catch (error) {
        ElMessage.error('获取设置失败，请刷新页面重试')
        console.error('获取设置失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 保存设置
    const saveSettings = async () => {
      saving.value = true
      try {
        const result = await updateSystemSettings(settings)
        if (result.success) {
          ElMessage.success('设置已成功保存')
        } else {
          ElMessage.error(result.message || '保存设置失败')
        }
      } catch (error) {
        ElMessage.error('保存设置失败，请稍后重试')
        console.error('保存设置失败:', error)
      } finally {
        saving.value = false
      }
    }

    // 重新生成密钥
    const regenerateKey = async (type) => {
      const confirmText = type === 'secret' 
        ? '确定要重新生成系统密钥吗？重新生成后，使用旧密钥的API调用将立即失效。' 
        : '确定要重新生成应用密钥吗？重新生成后，使用旧密钥的应用将无法连接。'
      
      try {
        await ElMessageBox.confirm(confirmText, '重要提示', {
          confirmButtonText: '确定生成',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        if (type === 'secret') {
          regeneratingSecret.value = true
          const result = await regenerateSecretKey()
          if (result.success) {
            settings.secretKey = result.secretKey
            ElMessage.success('系统密钥已重新生成')
            showSecretKey.value = true // 自动显示新生成的密钥
          }
          regeneratingSecret.value = false
        } else {
          regeneratingApp.value = true
          const result = await regenerateAppKey()
          if (result.success) {
            settings.appKey = result.appKey
            ElMessage.success('应用密钥已重新生成')
            showAppKey.value = true // 自动显示新生成的密钥
          }
          regeneratingApp.value = false
        }
      } catch (error) {
        // 用户取消或API错误
        if (error !== 'cancel') {
          ElMessage.error('重新生成密钥失败，请稍后重试')
          console.error('重新生成密钥失败:', error)
        }
      }
    }

    onMounted(() => {
      fetchSettings()
    })

    return {
      loading,
      saving,
      settings,
      showSecretKey,
      showAppKey,
      saveSettings,
      regenerateKey,
      regeneratingSecret,
      regeneratingApp
    }
  }
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.settings-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.settings-container {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 8px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.settings-form {
  padding: 0 10px;
}

.form-item {
  margin-bottom: 25px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.description {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
}

.key-input {
  display: flex;
  gap: 10px;
}

.key-input .el-input {
  flex: 1;
}

@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .key-input {
    flex-direction: column;
    gap: 10px;
  }
  
  .key-input .el-button {
    width: 100%;
  }
}
</style> 