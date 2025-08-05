import { get, post, put, del } from '../utils/request'
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token，添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 临时模拟数据，实际项目中可删除
const generateMockData = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 500)
  })
}

// 获取仪表盘统计数据
export const getDashboardStatistics = async (params) => {
  // 真实环境使用以下代码
  // return await api.get('/dashboard/statistics', { params })
  
  // 模拟数据
  await generateMockData()
  return {
    totalSales: 254319.75,
    salesChange: 16.8,
    totalOrders: 1849,
    ordersChange: 8.4,
    newUsers: 5267,
    usersChange: 12.3,
    conversionRate: 4.6,
    conversionChange: -2.1
  }
}

// 获取销售趋势数据
export const getSalesTrends = async (params) => {
  // 真实环境使用以下代码
  // return await api.get('/dashboard/sales-trends', { params })
  
  // 模拟数据
  await generateMockData()
  return {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        name: '销售额',
        data: [30500, 41000, 35800, 48600, 42300, 47500]
      }
    ]
  }
}

// 获取最近订单
export const getRecentOrders = async (params) => {
  // 真实环境使用以下代码
  // return await api.get('/orders/recent', { params })
  
  // 模拟数据
  await generateMockData()
  return [
    { id: '7895', customer: '张三', amount: 1200, status: 'delivered', date: '2023-05-20' },
    { id: '7894', customer: '李四', amount: 860, status: 'processing', date: '2023-05-20' },
    { id: '7893', customer: '王五', amount: 2100, status: 'delivered', date: '2023-05-19' },
    { id: '7892', customer: '赵六', amount: 350, status: 'pending', date: '2023-05-19' },
    { id: '7891', customer: '钱七', amount: 920, status: 'cancelled', date: '2023-05-18' }
  ]
}

// 获取热销产品
export const getTopProducts = async (params) => {
  // 真实环境使用以下代码
  // return await api.get('/products/top-selling', { params })
  
  // 模拟数据
  await generateMockData()
  return [
    { id: 1, name: '智能手表', sales: 352, revenue: 105600, trend: 12.5 },
    { id: 2, name: '蓝牙耳机', sales: 276, revenue: 41400, trend: 8.3 },
    { id: 3, name: '移动电源', sales: 189, revenue: 28350, trend: -4.2 },
    { id: 4, name: '智能音箱', sales: 157, revenue: 62800, trend: 15.7 },
    { id: 5, name: '平板电脑', sales: 124, revenue: 198400, trend: 3.8 }
  ]
}

// 登录接口
export const login = async (data) => {
  // 真实环境使用以下代码
  // return await api.post('/auth/login', data)
  
  // 模拟登录
  await generateMockData()
  
  // 模拟登录验证
  if (data.username === 'admin' && data.password === 'admin123') {
    const token = 'mock_token_' + Math.random().toString(36).substr(2)
    localStorage.setItem('token', token)
    return {
      success: true,
      token,
      user: {
        id: 1,
        username: 'admin',
        name: '管理员',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        permissions: ['admin']
      }
    }
  } else {
    return {
      success: false,
      message: '用户名或密码不正确'
    }
  }
}

// 用户相关接口
export const userApi = {
  // 登录
  login: (data) => post('/auth/login', data),
  
  // 退出登录
  logout: () => post('/auth/logout'),
  
  // 获取用户信息
  getUserInfo: () => get('/users/info'),
  
  // 获取用户列表
  getUsers: (params) => get('/users', params),
  
  // 添加用户
  addUser: (data) => post('/users', data),
  
  // 更新用户
  updateUser: (id, data) => put(`/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id) => del(`/users/${id}`)
}

// 产品相关接口
export const productApi = {
  // 获取产品列表
  getProducts: (params) => get('/products', params),
  
  // 获取产品详情
  getProductById: (id) => get(`/products/${id}`),
  
  // 添加产品
  addProduct: (data) => post('/products', data),
  
  // 更新产品
  updateProduct: (id, data) => put(`/products/${id}`, data),
  
  // 删除产品
  deleteProduct: (id) => del(`/products/${id}`)
}

// 订单相关接口
export const orderApi = {
  // 获取订单列表
  getOrders: (params) => get('/orders', params),
  
  // 获取订单详情
  getOrderById: (id) => get(`/orders/${id}`),
  
  // 创建订单
  createOrder: (data) => post('/orders', data),
  
  // 更新订单状态
  updateOrderStatus: (id, status) => put(`/orders/${id}/status`, { status }),
  
  // 删除订单
  deleteOrder: (id) => del(`/orders/${id}`)
}

// 仪表盘相关接口
export const dashboardApi = {
  // 获取统计数据
  getStats: () => get('/dashboard/stats'),
  
  // 获取销售趋势
  getSalesTrend: (timeRange) => get('/dashboard/sales', { timeRange }),
  
  // 获取最近活动
  getRecentActivities: () => get('/dashboard/activities'),
  
  // 获取最近订单
  getRecentOrders: () => get('/dashboard/recent-orders')
}

export default api 