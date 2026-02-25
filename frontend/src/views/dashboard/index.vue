<template>
  <div class="dashboard-box">
    <div class="welcome-section animate-up">
      <div class="welcome-text">
        <h2>早安，{{ userStore.userInfo?.realName || '管理员' }}，开始高效工作吧！☀️</h2>
        <p>今日共有 <span class="num">3</span> 个待办事项，系统运行正常。</p>
      </div>
      <img 
        :src="resolveImageUrl(userStore.userInfo?.avatar) || defaultAvatar" 
        class="welcome-img" 
      />
    </div>

    <el-row :gutter="16" class="mt-20">
      <el-col :span="6" v-for="(item, index) in cards" :key="index">
        <el-card shadow="never" class="data-card animate-up" :style="{ animationDelay: index * 0.1 + 's' }">
          <div class="card-header">
            <span class="card-title">{{ item.title }}</span>
            <el-tag size="small" :type="item.tagType || 'primary'">{{ item.tagText }}</el-tag>
          </div>
          <div class="card-content">
            <div class="main-num">{{ item.value }}</div>
            <div class="icon-bg">
              <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
            </div>
          </div>
          <div class="card-footer">
            较昨日 <span :class="item.trend > 0 ? 'up' : 'down'">{{ Math.abs(item.trend) }}% {{ item.trend > 0 ? '↑' : '↓' }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-20">
      <el-col :span="16">
        <el-card shadow="never" class="animate-up" style="animation-delay: 0.4s">
          <template #header>
            <div class="panel-header">
              <span>快捷操作</span>
              <el-button link type="primary">编辑</el-button>
            </div>
          </template>
          <div class="quick-actions">
            <div class="action-item" v-for="action in actions" :key="action.text">
              <div class="action-icon" :style="{ background: action.bg }">
                <el-icon :size="20" :color="action.color"><component :is="action.icon" /></el-icon>
              </div>
              <span>{{ action.text }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="never" class="animate-up" style="animation-delay: 0.5s">
          <template #header><span>系统公告</span></template>
          <div class="notice-list">
            <div class="notice-item" v-for="i in 3" :key="i">
              <el-tag size="small" type="primary" effect="light">通知</el-tag>
              <span class="notice-text">系统将于今晚进行例行维护更新，请注意保存...</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../store/user' // 引入用户状态
// 引入图标组件 (如果你的 main.ts 已经全局注册了图标，这行可以省略，但加上更保险)
import { Document, Files, User, DataLine, Edit, MagicStick, Bell } from '@element-plus/icons-vue'

const userStore = useUserStore()
// 默认头像 (Ant Design 的那个插画)
const defaultAvatar = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'

// ⭐ 修复点2：图片路径处理函数 (防止本地头像 404)
const resolveImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('https')) return url
  // 如果是 /files 开头，拼接 MinIO 地址
  if (url.startsWith('/files')) {
    return 'http://47.95.5.243:9000/exam-system-bucket/banners' + url.replace('/files/banners', '')
  }
  return url
}

const cards = ref([
  // ⭐ 修复点3：将 tagType: '' 改为 'primary' (或者干脆不写，模板里已经做了兼容)
  { title: '总题库数', value: '12,080', icon: 'Document', color: '#165DFF', tagText: '月', tagType: 'primary', trend: 12.5 },
  { title: '试卷总数', value: '84', icon: 'Files', color: '#00B42A', tagText: '周', tagType: 'success', trend: 5.2 },
  { title: '用户人数', value: '5,021', icon: 'User', color: '#FF7D00', tagText: '日', tagType: 'warning', trend: -2.1 },
  { title: '访问量', value: '89,200', icon: 'DataLine', color: '#F53F3F', tagText: '日', tagType: 'danger', trend: 8.4 },
])

const actions = ref([
  { text: '发布题目', icon: 'Edit', bg: '#E8F3FF', color: '#165DFF' },
  { text: '智能组卷', icon: 'MagicStick', bg: '#Eafff1', color: '#00B42A' },
  { text: '发布公告', icon: 'Bell', bg: '#FFF7E8', color: '#FF7D00' },
  { text: '用户管理', icon: 'User', bg: '#F2F3F5', color: '#4E5969' },
])
</script>

<style scoped>
.mt-20 { margin-top: 16px; }
.dashboard-box { min-height: 100%; }

/* 欢迎栏 */
.welcome-section {
  background: #fff;
  padding: 20px 24px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e6eb;
}
.welcome-text h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 500; color: #1D2129; }
.welcome-text p { margin: 0; color: #86909C; font-size: 14px; }
.welcome-text .num { color: #165DFF; font-weight: bold; margin: 0 4px; }
.welcome-img { height: 80px; width: 80px; object-fit: contain; } /* 限制一下图片大小 */

/* 数据卡片 */
.data-card { border: none; border-radius: 4px; }
.card-header { display: flex; justify-content: space-between; color: #86909C; font-size: 14px; }
.card-content { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
.main-num { font-size: 28px; font-weight: 700; color: #1D2129; }
.icon-bg { width: 48px; height: 48px; border-radius: 50%; background: #F7F8FA; display: flex; align-items: center; justify-content: center; }
.card-footer { font-size: 12px; color: #86909C; }
.up { color: #00B42A; }
.down { color: #F53F3F; }

/* 快捷入口 */
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.quick-actions { display: flex; gap: 40px; padding: 10px 0; }
.action-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s; }
.action-item:hover { transform: translateY(-5px); }
.action-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.action-item span { font-size: 13px; color: #4E5969; }

/* 公告 */
.notice-list { display: flex; flex-direction: column; gap: 12px; }
.notice-item { display: flex; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #f2f3f5; }
.notice-item:last-child { border: none; padding-bottom: 0; }
.notice-text { margin-left: 10px; font-size: 13px; color: #4E5969; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

/* 进场动画 */
.animate-up { animation: fadeInUp 0.5s ease-out backwards; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>