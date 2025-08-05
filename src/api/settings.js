import { get, post } from './index'

// 获取系统设置
export const getSystemSettings = async () => {
  // 真实环境使用以下代码
  // return await get('/settings')
  
  // 模拟数据
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    platformName: '边界科技管理系统',
    description: '专业的企业管理解决方案',
    secretKey: 'sk_live_51KjPmRJu8i4XdF5C9LmGh3K2Ts9pY',
    appKey: 'app_51KjPmRJu8i4XdF5C9LmGh3K2Ts9pYxF',
    apiDomain: 'https://api.example.com',
    rateLimit: 60
  }
}

// 更新系统设置
export const updateSystemSettings = async (settings) => {
  // 真实环境使用以下代码
  // return await post('/settings', settings)
  
  // 模拟数据
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    success: true,
    message: '设置已更新'
  }
}

// 重新生成系统密钥
export const regenerateSecretKey = async () => {
  // 真实环境使用以下代码
  // return await post('/settings/regenerate-secret')
  
  // 模拟数据
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 生成一个随机密钥
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk_live_'
  for (let i = 0; i < 28; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  return {
    success: true,
    secretKey: result
  }
}

// 重新生成App Key
export const regenerateAppKey = async () => {
  // 真实环境使用以下代码
  // return await post('/settings/regenerate-app-key')
  
  // 模拟数据
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 生成一个随机App Key
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'app_'
  for (let i = 0; i < 30; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  return {
    success: true,
    appKey: result
  }
}

export default {
  getSystemSettings,
  updateSystemSettings,
  regenerateSecretKey,
  regenerateAppKey
} 