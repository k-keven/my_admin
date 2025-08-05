<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <router-link to="/dashboard" class="back-btn">返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
}

.content {
  text-align: center;
  padding: 40px;
}

h1 {
  font-size: 120px;
  margin: 0;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

h2 {
  font-size: 32px;
  margin: 0 0 20px;
  color: #1e293b;
}

p {
  color: #64748b;
  margin-bottom: 30px;
  font-size: 18px;
}

.back-btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #2563eb;
}
</style> 