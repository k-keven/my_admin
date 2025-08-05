<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <button @click="showAddUserForm = true">添加用户</button>
    </div>
    
    <div class="table-container">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="`status ${user.status === 'active' ? 'active' : 'inactive'}`">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <button class="edit-btn" @click="editUser(user)">编辑</button>
              <button class="delete-btn" @click="deleteUser(user.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- 分页 -->
      <div v-if="!loading && users.length > 0" class="pagination">
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
    
    <!-- 用户表单弹窗 -->
    <div class="modal" v-if="showAddUserForm || editingUser">
      <div class="modal-content">
        <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
        <div class="form-group">
          <label>用户名</label>
          <input v-model="userForm.username" type="text">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="userForm.email" type="email">
        </div>
        <div class="form-group">
          <label>角色</label>
          <select v-model="userForm.role">
            <option value="admin">管理员</option>
            <option value="editor">编辑</option>
            <option value="user">普通用户</option>
          </select>
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="userForm.status">
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
        </div>
        <div class="modal-footer">
          <button @click="cancelEdit">取消</button>
          <button @click="saveUser">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

// 用户数据
const users = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const totalPages = ref(1)

// 获取用户数据
const fetchUsers = async (page = 1) => {
  loading.value = true
  try {
    const response = await fetch(`https://api.miccryp.store/users.php?page=${page}&pageSize=${pageSize.value}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    // 假设API返回的数据格式为 { users: [], total: number, pages: number }
    users.value = data.users || []
    totalCount.value = data.total || 0
    totalPages.value = data.pages || 1
    currentPage.value = page
  } catch (error) {
    console.error('获取用户数据失败:', error)
    // 如果API请求失败，使用模拟数据作为备用
    users.value = [
      { id: 1, username: 'admin', email: 'admin@example.com', role: '管理员', status: 'active' },
      { id: 2, username: 'editor', email: 'editor@example.com', role: '编辑', status: 'active' },
      { id: 3, username: 'user1', email: 'user1@example.com', role: '普通用户', status: 'inactive' },
      { id: 4, username: 'user2', email: 'user2@example.com', role: '普通用户', status: 'active' },
      { id: 5, username: 'user3', email: 'user3@example.com', role: '普通用户', status: 'inactive' },
      { id: 6, username: 'user4', email: 'user4@example.com', role: '编辑', status: 'active' },
      { id: 7, username: 'user5', email: 'user5@example.com', role: '普通用户', status: 'active' },
      { id: 8, username: 'user6', email: 'user6@example.com', role: '普通用户', status: 'inactive' }
    ]
    totalCount.value = 8
    totalPages.value = Math.ceil(8 / pageSize.value)
  } finally {
    loading.value = false
  }
}

const showAddUserForm = ref(false)
const editingUser = ref(null)
const userForm = reactive({
  username: '',
  email: '',
  role: 'user',
  status: 'active'
})

// 编辑用户
const editUser = (user) => {
  editingUser.value = user
  Object.assign(userForm, user)
}

// 删除用户
const deleteUser = (id) => {
  if (confirm('确定要删除此用户吗？')) {
    users.value = users.value.filter(user => user.id !== id)
  }
}

// 取消编辑
const cancelEdit = () => {
  showAddUserForm.value = false
  editingUser.value = null
  resetForm()
}

// 保存用户
const saveUser = () => {
  if (!userForm.username || !userForm.email) {
    alert('请填写完整信息')
    return
  }
  
  if (editingUser.value) {
    // 更新现有用户
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...editingUser.value, ...userForm }
    }
  } else {
    // 添加新用户
    const newUser = {
      id: users.value.length + 1,
      ...userForm
    }
    users.value.push(newUser)
  }
  
  cancelEdit()
}

// 重置表单
const resetForm = () => {
  userForm.username = ''
  userForm.email = ''
  userForm.role = 'user'
  userForm.status = 'active'
}

// 切换页面
const changePage = (page) => {
  fetchUsers(page)
}

// 改变每页显示数量
const changePageSize = () => {
  currentPage.value = 1
  fetchUsers(1)
}

// 计算可见页码
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 组件挂载时获取用户数据
onMounted(() => {
  fetchUsers(1)
})
</script>

<style scoped>
.user-management {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header button {
  padding: 8px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.table-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.data-table thead {
  background-color: #f5f7fa;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status.active {
  background-color: #e6f7ee;
  color: #10b981;
}

.status.inactive {
  background-color: #fef1f2;
  color: #ef4444;
}

.edit-btn, .delete-btn {
  padding: 4px 8px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #3b82f6;
  color: white;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 500px;
  background-color: white;
  border-radius: 4px;
  padding: 20px;
}

.modal-content h3 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-footer button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.modal-footer button:first-child {
  background-color: #f3f4f6;
}

.modal-footer button:last-child {
  background-color: #2563eb;
  color: white;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #ebeef5;
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
  border-color: #2563eb;
  color: #2563eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
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
  border-color: #2563eb;
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