<template>
  <div class="recharge-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">充值列表</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="exportData">
          <i class="fas fa-download"></i>
          导出数据
        </button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索用户ID、订单号..."
          @input="handleSearch"
        >
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleFilter">
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
          <option value="cancelled">已取消</option>
        </select>
        <select v-model="amountFilter" @change="handleFilter">
          <option value="">全部金额</option>
          <option value="0-100">0-100元</option>
          <option value="100-500">100-500元</option>
          <option value="500-1000">500-1000元</option>
          <option value="1000+">1000元以上</option>
        </select>
        <div class="date-picker">
          <input 
            type="date" 
            v-model="startDate" 
            @change="handleFilter"
            placeholder="开始日期"
          >
          <span>至</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="handleFilter"
            placeholder="结束日期"
          >
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(24, 144, 255, 0.1);">
          <i class="fas fa-credit-card" style="color: #1890ff;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">总充值金额</h3>
          <div class="stat-value">¥{{ formatNumber(totalAmount) }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>{{ growthRate }}% 较上月</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(82, 196, 26, 0.1);">
          <i class="fas fa-check-circle" style="color: #52c41a;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">成功充值</h3>
          <div class="stat-value">{{ successCount }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>{{ successRate }}% 成功率</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(250, 173, 20, 0.1);">
          <i class="fas fa-clock" style="color: #faad14;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">待处理</h3>
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-change">
            <span>需要处理</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(245, 34, 45, 0.1);">
          <i class="fas fa-times-circle" style="color: #f5222d;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">失败充值</h3>
          <div class="stat-value">{{ failedCount }}</div>
          <div class="stat-change negative">
            <i class="fas fa-arrow-down"></i>
            <span>{{ failedRate }}% 失败率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <div class="table-header">
        <div class="table-info">
          <span>共 {{ totalCount }} 条记录</span>
          <span class="divider">|</span>
          <span>当前显示 {{ currentPage }} / {{ totalPages }} 页</span>
        </div>
        <div class="table-actions">
          <button class="btn btn-outline" @click="refreshData">
            <i class="fas fa-refresh"></i>
            刷新
          </button>
        </div>
      </div>
      
      <div class="table-content" :class="{ 'is-loading': loading }">
        <table class="data-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>用户ID</th>
              <th>充值金额</th>
              <th>支付方式</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>完成时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody v-if="!loading">
            <tr v-for="item in rechargeList" :key="item.id">
              <td>{{ item.orderNo }}</td>
              <td>{{ item.userId }}</td>
              <td class="amount">¥{{ formatNumber(item.amount) }}</td>
              <td>
                <span class="payment-method">
                  <i :class="getPaymentIcon(item.paymentMethod)"></i>
                  {{ getPaymentText(item.paymentMethod) }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td>{{ formatDateTime(item.createdAt) }}</td>
              <td>{{ item.completedAt ? formatDateTime(item.completedAt) : '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-outline" @click="viewDetail(item)">
                    查看
                  </button>
                  <button 
                    v-if="item.status === 'pending'" 
                    class="btn btn-sm btn-primary" 
                    @click="processRecharge(item)"
                  >
                    处理
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="i in 10" :key="i">
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
              <td><div class="skeleton-text"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="!loading && rechargeList.length > 0">
        <div class="pagination-info">
          <span>共 {{ totalCount }} 条记录</span>
          <span v-if="totalPages > 1" class="divider">|</span>
          <span v-if="totalPages > 1">当前显示 {{ currentPage }} / {{ totalPages }} 页</span>
        </div>
        
        <div v-if="totalPages > 1" class="pagination-controls">
          <button 
            :disabled="currentPage === 1"
            @click="changePage(1)"
            class="page-btn"
            title="第一页"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
            class="page-btn"
            title="上一页"
          >
            <i class="fas fa-angle-left"></i>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="['page-btn', 'page-number', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
            class="page-btn"
            title="下一页"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          <button 
            :disabled="currentPage === totalPages"
            @click="changePage(totalPages)"
            class="page-btn"
            title="最后一页"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
        
        <div class="page-size-selector">
          <span>每页显示：</span>
          <select v-model="pageSize" @change="changePageSize">
            <option value="10">10条</option>
            <option value="20">20条</option>
            <option value="50">50条</option>
            <option value="100">100条</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'

export default {
  name: 'RechargeList',
  setup() {
    // 搜索和筛选
    const searchQuery = ref('')
    const statusFilter = ref('')
    const amountFilter = ref('')
    const startDate = ref('')
    const endDate = ref('')

    // 分页
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalCount = ref(0)
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

    // 加载状态
    const loading = ref(false)

    // 统计数据
    const totalAmount = ref(1256800)
    const growthRate = ref(12.5)
    const successCount = ref(1256)
    const successRate = ref(95.8)
    const pendingCount = ref(23)
    const failedCount = ref(32)
    const failedRate = ref(4.2)

    // 充值列表数据
    const rechargeList = ref([])

    // 模拟数据
    const mockData = [
      {
        id: 1,
        orderNo: 'RC20241201001',
        userId: 'U001',
        amount: 1000,
        paymentMethod: 'alipay',
        status: 'success',
        createdAt: '2024-12-01 10:30:00',
        completedAt: '2024-12-01 10:32:15'
      },
      {
        id: 2,
        orderNo: 'RC20241201002',
        userId: 'U002',
        amount: 500,
        paymentMethod: 'wechat',
        status: 'pending',
        createdAt: '2024-12-01 11:15:00',
        completedAt: null
      },
      {
        id: 3,
        orderNo: 'RC20241201003',
        userId: 'U003',
        amount: 2000,
        paymentMethod: 'bank',
        status: 'success',
        createdAt: '2024-12-01 12:00:00',
        completedAt: '2024-12-01 12:05:30'
      },
      {
        id: 4,
        orderNo: 'RC20241201004',
        userId: 'U004',
        amount: 300,
        paymentMethod: 'alipay',
        status: 'failed',
        createdAt: '2024-12-01 13:20:00',
        completedAt: '2024-12-01 13:22:45'
      },
      {
        id: 5,
        orderNo: 'RC20241201005',
        userId: 'U005',
        amount: 800,
        paymentMethod: 'wechat',
        status: 'cancelled',
        createdAt: '2024-12-01 14:10:00',
        completedAt: null
      }
    ]

    // 获取支付方式图标
    const getPaymentIcon = (method) => {
      const icons = {
        alipay: 'fab fa-alipay',
        wechat: 'fab fa-weixin',
        bank: 'fas fa-university',
        card: 'fas fa-credit-card'
      }
      return icons[method] || 'fas fa-money-bill'
    }

    // 获取支付方式文本
    const getPaymentText = (method) => {
      const texts = {
        alipay: '支付宝',
        wechat: '微信支付',
        bank: '银行转账',
        card: '银行卡'
      }
      return texts[method] || method
    }

    // 获取状态类名
    const getStatusClass = (status) => {
      const classes = {
        pending: 'warning',
        success: 'success',
        failed: 'danger',
        cancelled: 'default'
      }
      return classes[status] || 'default'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待处理',
        success: '成功',
        failed: '失败',
        cancelled: '已取消'
      }
      return texts[status] || status
    }

    // 格式化数字
    const formatNumber = (num) => {
      return num.toLocaleString('zh-CN')
    }

    // 格式化日期时间
    const formatDateTime = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    // 搜索处理
    const handleSearch = () => {
      currentPage.value = 1
      fetchData()
    }

    // 筛选处理
    const handleFilter = () => {
      currentPage.value = 1
      fetchData()
    }

    // 获取数据
    const fetchData = async () => {
      loading.value = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        rechargeList.value = mockData
        totalCount.value = 1256
      } catch (error) {
        console.error('获取充值列表失败', error)
      } finally {
        loading.value = false
      }
    }

    // 刷新数据
    const refreshData = () => {
      fetchData()
    }

    // 导出数据
    const exportData = () => {
      console.log('导出充值数据')
    }

    // 查看详情
    const viewDetail = (item) => {
      console.log('查看充值详情', item)
    }

    // 处理充值
    const processRecharge = (item) => {
      console.log('处理充值', item)
    }

    // 切换页面
    const changePage = (page) => {
      currentPage.value = page
      fetchData()
    }

    // 改变每页显示数量
    const changePageSize = () => {
      currentPage.value = 1
      fetchData()
    }

    // 可见页码
    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    // 初始化
    onMounted(() => {
      fetchData()
    })

    return {
      searchQuery,
      statusFilter,
      amountFilter,
      startDate,
      endDate,
      currentPage,
      totalCount,
      totalPages,
      loading,
      totalAmount,
      growthRate,
      successCount,
      successRate,
      pendingCount,
      failedCount,
      failedRate,
      rechargeList,
      visiblePages,
      getPaymentIcon,
      getPaymentText,
      getStatusClass,
      getStatusText,
      formatNumber,
      formatDateTime,
      handleSearch,
      handleFilter,
      refreshData,
      exportData,
      viewDetail,
      processRecharge,
      changePage
    }
  }
}
</script>

<style scoped>
.recharge-list {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 搜索和筛选区域 */
.search-filter-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f7f9;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
}

.search-box i {
  color: #666;
  margin-right: 8px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  color: #333;
  width: 100%;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-picker input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  font-size: 14px;
}

.date-picker span {
  color: #666;
  font-size: 14px;
}

/* 统计卡片 */
.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-title {
  margin: 0 0 8px;
  color: #999;
  font-size: 14px;
  font-weight: normal;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 8px;
}

.stat-change {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #52c41a;
}

.stat-change.negative {
  color: #f5222d;
}

/* 表格容器 */
.table-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.divider {
  color: #d9d9d9;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.table-content {
  padding: 20px;
  position: relative;
}

/* 表格样式 */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.data-table th {
  font-weight: 600;
  color: #666;
  font-size: 13px;
  background-color: #fafafa;
}

.data-table td {
  font-size: 14px;
  color: #333;
}

.amount {
  font-weight: 600;
  color: #1890ff;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 6px;
}

.payment-method i {
  font-size: 16px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.primary {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.status-badge.success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-badge.warning {
  background-color: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.status-badge.danger {
  background-color: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.status-badge.default {
  background-color: rgba(0, 0, 0, 0.1);
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-outline {
  background-color: transparent;
  color: #1890ff;
  border: 1px solid #1890ff;
}

.btn-outline:hover {
  background-color: #1890ff;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-page {
  padding: 6px 12px;
  background-color: transparent;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-page.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.btn-page:hover:not(.active) {
  border-color: #1890ff;
  color: #1890ff;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.divider {
  color: #d9d9d9;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-btn.page-number {
  min-width: 36px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.page-size-selector select {
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
}

.page-size-selector select:focus {
  outline: none;
  border-color: #1890ff;
}

/* 响应式分页 */
@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
  
  .pagination-controls {
    order: 2;
  }
  
  .pagination-info {
    order: 1;
  }
  
  .page-size-selector {
    order: 3;
  }
}

/* 骨架屏 */
.is-loading {
  position: relative;
}

.skeleton-text {
  height: 18px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e6e9ec 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-picker {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 