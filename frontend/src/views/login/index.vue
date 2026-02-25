<template>
  <div class="login-wrapper">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>

    <el-card class="glass-card">
      <div class="login-header">
        <div class="logo">🎓</div>
        <h1>智能考试系统</h1>
        <p>AI-Powered Examination Platform</p>
      </div>

      <el-form :model="loginForm" :rules="rules" ref="loginRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            show-password 
          />
        </el-form-item>

        <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
          进入管理端
        </el-button>
      </el-form>
      
      <div class="footer-links">
        <span>忘记密码？</span>
        <span class="divider">|</span>
        <span>联系技术支持</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const loginRef = ref()
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()

const loginForm = reactive({ username: '', password: '' })

// 企业级表单验证
const rules = {
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}

// src/views/login/index.vue 的 handleLogin 函数

// src/views/login/index.vue

const handleLogin = async () => {
  if (!loginRef.value) return
  await loginRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.loginAction(loginForm)
        ElMessage.success('登录成功')

        // 核心逻辑：只有 admin + 20060222 才能进后台
        if (loginForm.username === 'admin' && loginForm.password === '20060222') {
          router.push('/admin/dashboard') // 跳转到新的后台地址
        } else {
          router.push('/student/home')    // 其他人一律去学生端
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-wrapper {
  position: relative;
  width: 400px;
  z-index: 1;
}

/* 磨砂玻璃效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37) !important;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo { font-size: 50px; margin-bottom: 10px; }
h1 { margin: 0; font-size: 24px; color: #333; }
p { color: #666; font-size: 14px; margin-top: 5px; }

.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(to right, #4f46e5, #7c3aed);
  border: none;
  font-weight: bold;
  margin-top: 10px;
}

.footer-links {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #888;
}

/* 装饰性背景球 */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: -1;
}
.circle-1 { width: 200px; height: 200px; top: -100px; right: -100px; }
.circle-2 { width: 150px; height: 150px; bottom: -50px; left: -80px; }
</style>

