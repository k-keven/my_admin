import axios from 'axios'
import store from '../store'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api', // API基础URL
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前添加token
    const token = store.state.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    const { response } = error
    
    // 处理不同的HTTP状态码
    if (response) {
      switch (response.status) {
        case 401: // 未授权
          // 清除token并跳转到登录页
          store.dispatch('logout')
          router.push('/login')
          break
        case 403: // 禁止访问
          console.error('没有权限访问该资源')
          break
        case 404: // 资源不存在
          console.error('请求的资源不存在')
          break
        case 500: // 服务器错误
          console.error('服务器错误')
          break
        default:
          console.error(`HTTP错误: ${response.status}`)
      }
    } else {
      // 处理网络错误或请求被取消
      console.error('网络错误或请求被取消')
    }
    
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params = {}) {
  return service({
    url,
    method: 'get',
    params
  })
}

// 封装POST请求
export function post(url, data = {}) {
  return service({
    url,
    method: 'post',
    data
  })
}

// 封装PUT请求
export function put(url, data = {}) {
  return service({
    url,
    method: 'put',
    data
  })
}

// 封装DELETE请求
export function del(url, params = {}) {
  return service({
    url,
    method: 'delete',
    params
  })
}

export default service 