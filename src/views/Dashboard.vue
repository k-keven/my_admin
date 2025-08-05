<template>
  <div class="dashboard">
    <!-- 仪表板头部 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">仪表盘</h1>
      <div class="date-filter">
        <button 
          v-for="option in dateOptions" 
          :key="option.value" 
          :class="['date-option', { active: currentDateFilter === option.value }]"
          @click="changeDateFilter(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <div 
        v-for="(stat, index) in statistics" 
        :key="index" 
        class="stat-card"
        :class="{ 'is-loading': loading }"
      >
        <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
          <i class="iconfont" :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ stat.title }}</h3>
          <div class="stat-value">
            <template v-if="!loading">
              {{ stat.prefix }}{{ formatNumber(stat.value) }}{{ stat.suffix }}
            </template>
            <div v-else class="skeleton-text"></div>
          </div>
          <div class="stat-change" :class="stat.change >= 0 ? 'positive' : 'negative'">
            <i class="iconfont" :class="stat.change >= 0 ? 'icon-arrow-up' : 'icon-arrow-down'"></i>
            <span v-if="!loading">{{ Math.abs(stat.change) }}% 较上期</span>
            <div v-else class="skeleton-text small"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表部分 -->
    <div class="charts-container">
      <!-- 销售趋势图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">销售趋势</h3>
          <div class="chart-actions">
            <button 
              v-for="option in chartOptions" 
              :key="option.value" 
              :class="['chart-option', { active: currentChartFilter === option.value }]"
              @click="changeChartFilter(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="chart-content" :class="{ 'is-loading': chartLoading }">
          <LineChart 
            :chart-data="salesChartData" 
            :loading="chartLoading"
            :error="chartError"
            height="300px"
            :smooth="true"
            :area="true"
          />
        </div>
      </div>

      <!-- 产品分布图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">产品分布</h3>
        </div>
        <div class="chart-content" :class="{ 'is-loading': chartLoading }">
          <PieChart 
            :chart-data="productsChartData" 
            :loading="chartLoading"
            :error="chartError"
            height="300px"
            :doughnut="true"
          />
        </div>
      </div>
    </div>

    <!-- 表格部分 -->
    <div class="tables-container">
      <!-- 最近订单表格 -->
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">最近订单</h3>
          <button class="view-all">查看全部</button>
        </div>
        <div class="table-content" :class="{ 'is-loading': ordersLoading }">
          <table class="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户</th>
                <th>金额</th>
                <th>状态</th>
                <th>日期</th>
              </tr>
            </thead>
            <tbody v-if="!ordersLoading">
              <tr v-for="order in recentOrders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ order.customer }}</td>
                <td>¥{{ formatNumber(order.amount) }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td>{{ formatDate(order.date) }}</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="i in 5" :key="i">
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

      <!-- 热销产品表格 -->
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">热销产品</h3>
          <button class="view-all">查看全部</button>
        </div>
        <div class="table-content" :class="{ 'is-loading': productsLoading }">
          <table class="data-table">
            <thead>
              <tr>
                <th>产品名称</th>
                <th>销量</th>
                <th>收入</th>
                <th>趋势</th>
              </tr>
            </thead>
            <tbody v-if="!productsLoading">
              <tr v-for="product in topProducts" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ product.sales }}</td>
                <td>¥{{ formatNumber(product.revenue) }}</td>
                <td>
                  <span class="trend" :class="product.trend >= 0 ? 'positive' : 'negative'">
                    <i class="iconfont" :class="product.trend >= 0 ? 'icon-arrow-up' : 'icon-arrow-down'"></i>
                    {{ Math.abs(product.trend) }}%
                  </span>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="i in 5" :key="i">
                <td><div class="skeleton-text"></div></td>
                <td><div class="skeleton-text"></div></td>
                <td><div class="skeleton-text"></div></td>
                <td><div class="skeleton-text"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { getDashboardStatistics, getSalesTrends, getRecentOrders, getTopProducts } from '@/api'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    BarChart,
    PieChart
  },
  setup() {
    // 日期筛选选项
    const dateOptions = [
      { label: '今日', value: 'today' },
      { label: '本周', value: 'week' },
      { label: '本月', value: 'month' },
      { label: '本年', value: 'year' }
    ]
    const currentDateFilter = ref('month')

    // 图表筛选选项
    const chartOptions = [
      { label: '日', value: 'day' },
      { label: '周', value: 'week' },
      { label: '月', value: 'month' }
    ]
    const currentChartFilter = ref('month')

    // 加载状态
    const loading = ref(true)
    const chartLoading = ref(true)
    const ordersLoading = ref(true)
    const productsLoading = ref(true)
    const chartError = ref('')

    // 统计数据
    const statistics = reactive([
      { 
        title: '总销售额', 
        value: 0, 
        change: 0, 
        prefix: '¥', 
        suffix: '', 
        icon: 'icon-money', 
        bgColor: 'rgba(24, 144, 255, 0.1)' 
      },
      { 
        title: '订单数量', 
        value: 0, 
        change: 0, 
        prefix: '', 
        suffix: '', 
        icon: 'icon-order', 
        bgColor: 'rgba(82, 196, 26, 0.1)' 
      },
      { 
        title: '新增用户', 
        value: 0, 
        change: 0, 
        prefix: '', 
        suffix: '', 
        icon: 'icon-user', 
        bgColor: 'rgba(250, 173, 20, 0.1)' 
      },
      { 
        title: '转化率', 
        value: 0, 
        change: 0, 
        prefix: '', 
        suffix: '%', 
        icon: 'icon-conversion', 
        bgColor: 'rgba(245, 34, 45, 0.1)' 
      }
    ])

    // 图表数据
    const salesChartData = ref({
      xAxis: [],
      series: [
        { name: '销售额', data: [], color: '#1890ff' }
      ]
    })

    // 产品分布图表数据
    const productsChartData = ref({
      name: '产品分布',
      data: []
    })

    // 表格数据
    const recentOrders = ref([])
    const topProducts = ref([])

    // 获取统计数据
    const fetchStatistics = async () => {
      try {
        loading.value = true
        const res = await getDashboardStatistics({ period: currentDateFilter.value })
        statistics[0].value = res.totalSales
        statistics[0].change = res.salesChange
        statistics[1].value = res.totalOrders
        statistics[1].change = res.ordersChange
        statistics[2].value = res.newUsers
        statistics[2].change = res.usersChange
        statistics[3].value = res.conversionRate
        statistics[3].change = res.conversionChange
      } catch (error) {
        console.error('获取统计数据失败', error)
      } finally {
        loading.value = false
      }
    }

    // 获取销售趋势数据
    const fetchSalesTrends = async () => {
      try {
        chartLoading.value = true
        chartError.value = ''
        const res = await getSalesTrends({ 
          period: currentDateFilter.value,
          type: currentChartFilter.value
        })
        salesChartData.value.xAxis = res.labels
        salesChartData.value.series[0].data = res.datasets[0].data

        // 准备饼图数据 - 模拟数据
        productsChartData.value.data = [
          { name: '电子产品', value: 5300 },
          { name: '服装', value: 3200 },
          { name: '食品', value: 2100 },
          { name: '家居', value: 1800 },
          { name: '其他', value: 1000 }
        ]
      } catch (error) {
        console.error('获取销售趋势数据失败', error)
        chartError.value = '数据加载失败，请稍后重试'
      } finally {
        chartLoading.value = false
      }
    }

    // 获取最近订单
    const fetchRecentOrders = async () => {
      try {
        ordersLoading.value = true
        const res = await getRecentOrders({ period: currentDateFilter.value })
        recentOrders.value = res
      } catch (error) {
        console.error('获取最近订单失败', error)
      } finally {
        ordersLoading.value = false
      }
    }

    // 获取热销产品
    const fetchTopProducts = async () => {
      try {
        productsLoading.value = true
        const res = await getTopProducts({ period: currentDateFilter.value })
        topProducts.value = res
      } catch (error) {
        console.error('获取热销产品失败', error)
      } finally {
        productsLoading.value = false
      }
    }

    // 格式化数字
    const formatNumber = (num) => {
      return num.toLocaleString('zh-CN')
    }

    // 格式化日期
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    // 获取订单状态类名
    const getStatusClass = (status) => {
      const statusMap = {
        'pending': 'warning',
        'processing': 'primary',
        'delivered': 'success',
        'cancelled': 'danger'
      }
      return statusMap[status] || 'default'
    }

    // 获取订单状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'delivered': '已发货',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    }

    // 切换日期筛选
    const changeDateFilter = (filter) => {
      currentDateFilter.value = filter
      // 重新加载所有数据
      fetchStatistics()
      fetchSalesTrends()
      fetchRecentOrders()
      fetchTopProducts()
    }

    // 切换图表筛选
    const changeChartFilter = (filter) => {
      currentChartFilter.value = filter
      fetchSalesTrends()
    }

    // 初始化
    onMounted(() => {
      fetchStatistics()
      fetchSalesTrends()
      fetchRecentOrders()
      fetchTopProducts()
    })

    return {
      dateOptions,
      currentDateFilter,
      chartOptions,
      currentChartFilter,
      loading,
      chartLoading,
      ordersLoading,
      productsLoading,
      chartError,
      statistics,
      salesChartData,
      productsChartData,
      recentOrders,
      topProducts,
      formatNumber,
      formatDate,
      getStatusClass,
      getStatusText,
      changeDateFilter,
      changeChartFilter
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 头部样式 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.date-filter {
  display: flex;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.date-option {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.date-option.active {
  background-color: #1890ff;
  color: white;
}

/* 统计卡片样式 */
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
  color: #1890ff;
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

/* 图表和表格容器 */
.charts-container,
.tables-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .charts-container,
  .tables-container {
    grid-template-columns: 1fr;
  }
}

.chart-card,
.table-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.chart-header,
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.chart-title,
.table-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-option {
  padding: 4px 12px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.3s;
}

.chart-option.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.chart-content,
.table-content {
  padding: 20px;
  position: relative;
  min-height: 300px;
}

.view-all {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
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
}

.data-table td {
  font-size: 14px;
  color: #333;
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

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend.positive {
  color: #52c41a;
}

.trend.negative {
  color: #f5222d;
}

/* 骨架屏样式 */
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

.skeleton-text.small {
  height: 14px;
  width: 80px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style> 