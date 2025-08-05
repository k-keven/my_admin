<template>
  <div class="orders">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="exportOrders">
          <i class="fas fa-download"></i>导出订单
        </button>
        <button class="btn btn-outline" @click="batchProcess">
          <i class="fas fa-cogs"></i>批量处理
        </button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" v-model="searchQuery" placeholder="搜索订单号、客户名称..." @input="handleSearch">
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleFilter">
          <option value="">全部状态</option>
          <option value="pending">待付款</option>
          <option value="paid">已付款</option>
          <option value="shipped">已发货</option>
          <option value="delivered">已送达</option>
          <option value="cancelled">已取消</option>
          <option value="refunded">已退款</option>
        </select>
        <select v-model="paymentFilter" @change="handleFilter">
          <option value="">全部支付方式</option>
          <option value="alipay">支付宝</option>
          <option value="wechat">微信支付</option>
          <option value="bank">银行转账</option>
          <option value="card">银行卡</option>
        </select>
        <select v-model="amountFilter" @change="handleFilter">
          <option value="">全部金额</option>
          <option value="0-100">0-100元</option>
          <option value="100-500">100-500元</option>
          <option value="500-1000">500-1000元</option>
          <option value="1000+">1000元以上</option>
        </select>
        <div class="date-picker">
          <input type="date" v-model="startDate" @change="handleFilter" placeholder="开始日期">
          <span>至</span>
          <input type="date" v-model="endDate" @change="handleFilter" placeholder="结束日期">
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(24, 144, 255, 0.1);">
          <i class="fas fa-shopping-cart" style="color: #1890ff;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">总订单数</h3>
          <div class="stat-value">{{ totalOrders }}</div>
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
          <h3 class="stat-title">已完成</h3>
          <div class="stat-value">{{ completedOrders }}</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            <span>{{ completionRate }}% 完成率</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(250, 173, 20, 0.1);">
          <i class="fas fa-clock" style="color: #faad14;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">待处理</h3>
          <div class="stat-value">{{ pendingOrders }}</div>
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
          <h3 class="stat-title">已取消</h3>
          <div class="stat-value">{{ cancelledOrders }}</div>
          <div class="stat-change negative">
            <i class="fas fa-arrow-down"></i>
            <span>{{ cancelRate }}% 取消率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-container">
      <div class="orders-header">
        <div class="orders-info">
          <span>共 {{ totalCount }} 条订单</span>
          <span class="divider">|</span>
          <span>当前显示 {{ currentPage }} / {{ totalPages }} 页</span>
        </div>
        <div class="orders-actions">
          <button class="btn btn-outline" @click="refreshOrders">
            <i class="fas fa-refresh"></i>刷新
          </button>
        </div>
      </div>

      <div class="table-container">
        <div class="table-content" :class="{ 'is-loading': loading }">
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th>订单号</th>
                <th>客户信息</th>
                <th>商品信息</th>
                <th>订单金额</th>
                <th>支付方式</th>
                <th>订单状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-for="order in ordersList" :key="order.id">
                <td>
                  <input type="checkbox" v-model="selectedOrders" :value="order.id">
                </td>
                <td class="order-number">{{ order.orderNo }}</td>
                <td class="customer-info">
                  <div class="customer-name">{{ order.customerName }}</div>
                  <div class="customer-phone">{{ order.customerPhone }}</div>
                </td>
                <td class="product-info">
                  <div class="product-name">{{ order.productName }}</div>
                  <div class="product-quantity">x{{ order.quantity }}</div>
                </td>
                <td class="order-amount">
                  <span class="amount">¥{{ formatNumber(order.amount) }}</span>
                  <div class="payment-status" :class="getPaymentStatusClass(order.paymentStatus)">
                    {{ getPaymentStatusText(order.paymentStatus) }}
                  </div>
                </td>
                <td>
                  <span class="payment-method">
                    <i :class="getPaymentIcon(order.paymentMethod)"></i>
                    {{ getPaymentText(order.paymentMethod) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td>{{ formatDateTime(order.createdAt) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" @click="viewOrder(order)">
                      查看
                    </button>
                    <button class="btn btn-sm btn-outline" @click="editOrder(order)">
                      编辑
                    </button>
                    <button 
                      v-if="order.status === 'pending'" 
                      class="btn btn-sm btn-success" 
                      @click="processOrder(order)"
                    >
                      处理
                    </button>
                    <button 
                      v-if="order.status === 'paid'" 
                      class="btn btn-sm btn-primary" 
                      @click="shipOrder(order)"
                    >
                      发货
                    </button>
                    <button 
                      v-if="order.status === 'pending'" 
                      class="btn btn-sm btn-danger" 
                      @click="cancelOrder(order)"
                    >
                      取消
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
                <td><div class="skeleton-text"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="!loading && ordersList.length > 0">
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
  name: 'Orders',
  setup() {
    // 搜索和筛选
    const searchQuery = ref('')
    const statusFilter = ref('')
    const paymentFilter = ref('')
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

    // 选择状态
    const selectAll = ref(false)
    const selectedOrders = ref([])

    // 统计数据
    const totalOrders = ref(3456)
    const growthRate = ref(15.2)
    const completedOrders = ref(2890)
    const completionRate = ref(83.6)
    const pendingOrders = ref(234)
    const cancelledOrders = ref(156)
    const cancelRate = ref(4.5)

    // 订单列表数据
    const ordersList = ref([])

    // 模拟数据
    const mockData = [
      {
        id: 1,
        orderNo: 'ORD20241201001',
        customerName: '张三',
        customerPhone: '138****1234',
        productName: 'iPhone 15 Pro',
        quantity: 1,
        amount: 8999,
        paymentMethod: 'alipay',
        paymentStatus: 'paid',
        status: 'paid',
        createdAt: '2024-12-01 10:30:00'
      },
      {
        id: 2,
        orderNo: 'ORD20241201002',
        customerName: '李四',
        customerPhone: '139****5678',
        productName: 'MacBook Air M2',
        quantity: 1,
        amount: 7999,
        paymentMethod: 'wechat',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: '2024-12-01 11:15:00'
      },
      {
        id: 3,
        orderNo: 'ORD20241201003',
        customerName: '王五',
        customerPhone: '137****9012',
        productName: 'Nike Air Max',
        quantity: 2,
        amount: 1798,
        paymentMethod: 'bank',
        paymentStatus: 'paid',
        status: 'shipped',
        createdAt: '2024-12-01 12:00:00'
      },
      {
        id: 4,
        orderNo: 'ORD20241201004',
        customerName: '赵六',
        customerPhone: '136****3456',
        productName: '有机牛奶',
        quantity: 5,
        amount: 79.5,
        paymentMethod: 'alipay',
        paymentStatus: 'paid',
        status: 'delivered',
        createdAt: '2024-12-01 13:20:00'
      },
      {
        id: 5,
        orderNo: 'ORD20241201005',
        customerName: '钱七',
        customerPhone: '135****7890',
        productName: '智能台灯',
        quantity: 1,
        amount: 299,
        paymentMethod: 'card',
        paymentStatus: 'refunded',
        status: 'cancelled',
        createdAt: '2024-12-01 14:10:00'
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

    // 获取支付状态类名
    const getPaymentStatusClass = (status) => {
      const classes = {
        paid: 'success',
        pending: 'warning',
        refunded: 'danger'
      }
      return classes[status] || 'default'
    }

    // 获取支付状态文本
    const getPaymentStatusText = (status) => {
      const texts = {
        paid: '已付款',
        pending: '待付款',
        refunded: '已退款'
      }
      return texts[status] || status
    }

    // 获取订单状态类名
    const getStatusClass = (status) => {
      const classes = {
        pending: 'warning',
        paid: 'primary',
        shipped: 'info',
        delivered: 'success',
        cancelled: 'danger',
        refunded: 'default'
      }
      return classes[status] || 'default'
    }

    // 获取订单状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待付款',
        paid: '已付款',
        shipped: '已发货',
        delivered: '已送达',
        cancelled: '已取消',
        refunded: '已退款'
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
        ordersList.value = mockData
        totalCount.value = 3456
      } catch (error) {
        console.error('获取订单列表失败', error)
      } finally {
        loading.value = false
      }
    }

    // 刷新订单
    const refreshOrders = () => {
      fetchData()
    }

    // 导出订单
    const exportOrders = () => {
      console.log('导出订单数据')
    }

    // 批量处理
    const batchProcess = () => {
      console.log('批量处理订单', selectedOrders.value)
    }

    // 查看订单
    const viewOrder = (order) => {
      console.log('查看订单', order)
    }

    // 编辑订单
    const editOrder = (order) => {
      console.log('编辑订单', order)
    }

    // 处理订单
    const processOrder = (order) => {
      console.log('处理订单', order)
    }

    // 发货
    const shipOrder = (order) => {
      console.log('发货', order)
    }

    // 取消订单
    const cancelOrder = (order) => {
      console.log('取消订单', order)
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

    // 全选/取消全选
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedOrders.value = ordersList.value.map(order => order.id)
      } else {
        selectedOrders.value = []
      }
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
      paymentFilter,
      amountFilter,
      startDate,
      endDate,
      currentPage,
      totalCount,
      totalPages,
      loading,
      selectAll,
      selectedOrders,
      totalOrders,
      growthRate,
      completedOrders,
      completionRate,
      pendingOrders,
      cancelledOrders,
      cancelRate,
      ordersList,
      visiblePages,
      getPaymentIcon,
      getPaymentText,
      getPaymentStatusClass,
      getPaymentStatusText,
      getStatusClass,
      getStatusText,
      formatNumber,
      formatDateTime,
      handleSearch,
      handleFilter,
      refreshOrders,
      exportOrders,
      batchProcess,
      viewOrder,
      editOrder,
      processOrder,
      shipOrder,
      cancelOrder,
      changePage,
      toggleSelectAll
    }
  }
}
</script>

<style scoped>
.orders {
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

/* 订单列表容器 */
.orders-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.orders-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.divider {
  color: #d9d9d9;
}

.orders-actions {
  display: flex;
  gap: 12px;
}

.table-container {
  padding: 20px;
}

.table-content {
  position: relative;
}

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

.order-number {
  font-weight: 600;
  color: #1890ff;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 500;
  color: #333;
}

.customer-phone {
  font-size: 13px;
  color: #666;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  color: #333;
}

.product-quantity {
  font-size: 13px;
  color: #666;
}

.order-amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount {
  font-weight: 600;
  color: #f5222d;
  font-size: 16px;
}

.payment-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  width: fit-content;
}

.payment-status.success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.payment-status.warning {
  background-color: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.payment-status.danger {
  background-color: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.payment-status.default {
  background-color: rgba(0, 0, 0, 0.1);
  color: #666;
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

.status-badge.info {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.status-badge.default {
  background-color: rgba(0, 0, 0, 0.1);
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

.btn-success {
  background-color: #52c41a;
  color: white;
}

.btn-success:hover {
  background-color: #73d13d;
}

.btn-danger {
  background-color: #f5222d;
  color: white;
}

.btn-danger:hover {
  background-color: #ff4d4f;
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
