<template>
  <div class="products">
    <div class="page-header">
      <h1 class="page-title">产品管理</h1>
      <div class="header-actions">
        <button class="btn btn-primary" @click="addProduct">
          <i class="fas fa-plus"></i>新增产品
        </button>
      </div>
    </div>

    <div class="search-filter-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input type="text" v-model="searchQuery" placeholder="搜索产品名称..." @input="handleSearch">
      </div>
      <div class="filter-group">
        <select v-model="categoryFilter" @change="handleFilter">
          <option value="">全部分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="food">食品</option>
        </select>
        <select v-model="statusFilter" @change="handleFilter">
          <option value="">全部状态</option>
          <option value="active">上架中</option>
          <option value="inactive">已下架</option>
        </select>
      </div>
    </div>

    <div class="statistics-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(24, 144, 255, 0.1);">
          <i class="fas fa-box" style="color: #1890ff;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">总产品数</h3>
          <div class="stat-value">{{ totalProducts }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(82, 196, 26, 0.1);">
          <i class="fas fa-check-circle" style="color: #52c41a;"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">上架产品</h3>
          <div class="stat-value">{{ activeProducts }}</div>
        </div>
      </div>
    </div>

    <div class="products-container">
      <div class="products-header">
        <div class="view-toggle">
          <button :class="['btn', 'btn-sm', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">
            <i class="fas fa-th"></i>网格视图
          </button>
          <button :class="['btn', 'btn-sm', { active: viewMode === 'list' }]" @click="viewMode = 'list'">
            <i class="fas fa-list"></i>列表视图
          </button>
        </div>
      </div>

      <div v-if="viewMode === 'grid'" class="products-grid" :class="{ 'is-loading': loading }">
        <div v-for="product in productsList" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" :alt="product.name">
            <div class="product-status" :class="getStatusClass(product.status)">
              {{ getStatusText(product.status) }}
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-category">{{ getCategoryText(product.category) }}</p>
            <div class="product-price">
              <span class="current-price">¥{{ formatNumber(product.price) }}</span>
            </div>
            <div class="product-actions">
              <button class="btn btn-sm btn-outline" @click="editProduct(product)">编辑</button>
              <button class="btn btn-sm btn-primary" @click="viewProduct(product)">查看</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="table-container">
        <div class="table-content" :class="{ 'is-loading': loading }">
          <table class="data-table">
            <thead>
              <tr>
                <th>产品图片</th>
                <th>产品名称</th>
                <th>分类</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-for="product in productsList" :key="product.id">
                <td><img :src="product.image" :alt="product.name" class="product-thumb"></td>
                <td>{{ product.name }}</td>
                <td>{{ getCategoryText(product.category) }}</td>
                <td class="price">¥{{ formatNumber(product.price) }}</td>
                <td>{{ product.stock }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(product.status)">
                    {{ getStatusText(product.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline" @click="viewProduct(product)">查看</button>
                    <button class="btn btn-sm btn-outline" @click="editProduct(product)">编辑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="!loading && productsList.length > 0">
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
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'Products',
  setup() {
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const statusFilter = ref('')
    const viewMode = ref('list')
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalCount = ref(0)
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
    const totalProducts = ref(1256)
    const activeProducts = ref(1189)
    const productsList = ref([])

    const mockData = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        category: 'electronics',
        price: 8999,
        stock: 50,
        status: 'active',
        image: 'https://via.placeholder.com/200x200?text=iPhone'
      },
      {
        id: 2,
        name: 'MacBook Air M2',
        category: 'electronics',
        price: 7999,
        stock: 0,
        status: 'inactive',
        image: 'https://via.placeholder.com/200x200?text=MacBook'
      },
      {
        id: 3,
        name: 'Nike Air Max',
        category: 'clothing',
        price: 899,
        stock: 120,
        status: 'active',
        image: 'https://via.placeholder.com/200x200?text=Nike'
      }
    ]

    const getCategoryText = (category) => {
      const categories = {
        electronics: '电子产品',
        clothing: '服装',
        food: '食品'
      }
      return categories[category] || category
    }

    const getStatusClass = (status) => {
      return status === 'active' ? 'success' : 'default'
    }

    const getStatusText = (status) => {
      return status === 'active' ? '上架中' : '已下架'
    }

    const formatNumber = (num) => {
      return num.toLocaleString('zh-CN')
    }

    const handleSearch = () => {
      fetchData()
    }

    const handleFilter = () => {
      fetchData()
    }

    const fetchData = async () => {
      loading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        productsList.value = mockData
        totalCount.value = 1256
      } catch (error) {
        console.error('获取产品列表失败', error)
      } finally {
        loading.value = false
      }
    }

    const addProduct = () => {
      console.log('新增产品')
    }

    const viewProduct = (product) => {
      console.log('查看产品', product)
    }

    const editProduct = (product) => {
      console.log('编辑产品', product)
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

    onMounted(() => {
      fetchData()
    })

    return {
      searchQuery,
      categoryFilter,
      statusFilter,
      viewMode,
      loading,
      currentPage,
      totalCount,
      totalPages,
      totalProducts,
      activeProducts,
      productsList,
      visiblePages,
      getCategoryText,
      getStatusClass,
      getStatusText,
      formatNumber,
      handleSearch,
      handleFilter,
      addProduct,
      viewProduct,
      editProduct,
      changePage,
      changePageSize
    }
  }
}
</script>

<style scoped>
.products {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

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
}

.products-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.product-status.success {
  background-color: #52c41a;
}

.product-status.default {
  background-color: #666;
}

.product-info {
  padding: 16px;
}

.product-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
}

.product-category {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.product-price {
  margin-bottom: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #f5222d;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.table-container {
  padding: 20px;
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

.product-thumb {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-badge.success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-badge.default {
  background-color: rgba(0, 0, 0, 0.1);
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

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

.btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.is-loading {
  position: relative;
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}

/* 分页样式 */
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
</style> 