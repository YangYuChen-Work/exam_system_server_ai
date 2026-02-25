<template>
  <div class="exam-container">
    <div class="filter-header">
      <div class="header-title">
        <span class="icon">📝</span>
        <h2>在线考试中心</h2>
        <el-tag type="info" effect="plain" round class="count-tag">
          共 {{ total }} 场考试
        </el-tag>
      </div>

      <div class="search-box">
        <el-input v-model="queryParams.keyword" placeholder="搜索考试名称..." prefix-icon="Search" clearable
          @clear="handleSearch" @keyup.enter="handleSearch" class="custom-input" />
        <el-button type="primary" round class="search-btn" @click="handleSearch">
          智能搜索
        </el-button>
      </div>
    </div>

    <el-skeleton :loading="loading" animated :count="3" v-if="loading">
      <template #template>
        <el-row :gutter="20">
          <el-col :span="6" v-for="i in 4" :key="i">
            <el-skeleton-item variant="image" style="width: 100%; height: 160px; border-radius: 12px;" />
            <div style="padding: 14px;">
              <el-skeleton-item variant="h3" style="width: 50%;" />
              <el-skeleton-item variant="text" style="margin-top: 10px;" />
            </div>
          </el-col>
        </el-row>
      </template>
    </el-skeleton>

    <div v-else class="exam-grid">
      <el-empty v-if="examList.length === 0" description="暂无相关考试安排" />

      <el-row :gutter="24">
        <el-col v-for="exam in examList" :key="exam.id" :xs="24" :sm="12" :md="8" :lg="6" class="card-col">
          <div class="exam-card" @click="goToDetail(exam)">
            <div class="card-cover" :class="getStatusClass(exam)">
              <div class="status-badge">
                {{ getStatusText(exam) }}
              </div>
              <img v-if="exam.coverUrl" :src="exam.coverUrl" alt="cover" />
              <div v-else class="placeholder-cover">
                <span>{{ exam.type || '综合考试' }}</span>
              </div>

              <div class="duration-badge">
                <el-icon>
                  <Timer />
                </el-icon> {{ exam.duration }} 分钟
              </div>
            </div>

            <div class="card-content">
              <h3 class="exam-title" :title="exam.title">{{ exam.title }}</h3>
              <p class="exam-desc">{{ exam.description || '暂无描述' }}</p>

              <div class="card-footer">
                <div class="meta-info">
                  <span class="score">总分: {{ exam.totalScore || 100 }}</span>
                </div>
                <el-button :type="getBtnType(exam)" size="small" round class="action-btn">
                  {{ getBtnText(exam) }}
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="pagination-area">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total"
        layout="prev, pager, next" background @current-change="getList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// import { useRouter } from 'vue-router' // 👈 暂时先注释掉，没用到就先不引
//import { Search, Timer } from '@element-plus/icons-vue'
// 确保这里引入没报错（如果有红线，说明 src/api/exam.ts 里没加 export interface ExamVO）
import { getExamList, type ExamVO } from '../../api/exam'

// const router = useRouter() // 👈 暂时注释掉，解决“未使用变量”报错
const loading = ref(false)
const total = ref(0)
const examList = ref<ExamVO[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 8,
  keyword: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getExamList(queryParams)
    // 兼容逻辑：防止后端返回 null 导致页面白屏
    examList.value = res?.data?.records || res?.data || []
    total.value = res?.data?.total || 0
  } catch (e) {
    console.error('获取考试列表失败:', e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  getList()
}

// ... (getStatus, getStatusText 等辅助函数保持不变，不用改) ...
const getStatus = (exam: any) => {
  const now = new Date().getTime()
  const start = new Date(exam.startTime).getTime()
  const end = new Date(exam.endTime).getTime()
  if (now < start) return 'upcoming'
  if (now > end) return 'finished'
  return 'ongoing'
}
const getStatusText = (exam: any) => {
  const map: any = { upcoming: '未开始', ongoing: '进行中', finished: '已结束' }
  return map[getStatus(exam)]
}
const getStatusClass = (exam: any) => `status-${getStatus(exam)}`
const getBtnType = (exam: any) => {
  const status = getStatus(exam)
  if (status === 'ongoing') return 'primary'
  if (status === 'upcoming') return 'warning'
  return 'info'
}
const getBtnText = (exam: any) => {
  const status = getStatus(exam)
  if (status === 'ongoing') return '立即考试'
  if (status === 'upcoming') return '等待开始'
  return '查看回顾'
}

// 👇 修复跳转函数
const goToDetail = (exam: any) => {
  if (getStatus(exam) === 'upcoming') {
    console.log('考试还没开始')
    return
  }

  // router.push(...) // 还没做详情页，先别写这行
  console.log('准备进入考试 ID:', exam.id)
  alert(`准备进入考试：${exam.title} (ID: ${exam.id})`) // 暂时弹窗代替跳转
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.exam-container {
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 头部样式 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-title .icon {
  font-size: 28px;
  background: #ecf5ff;
  padding: 10px;
  border-radius: 12px;
}

.header-title h2 {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.search-box {
  display: flex;
  gap: 10px;
}

.custom-input {
  width: 260px;
  transition: all 0.3s;
}

.custom-input:focus-within {
  width: 320px;
  /* 搜索框聚焦变长动画 */
}

/* 卡片栅格 */
.card-col {
  margin-bottom: 24px;
}

.exam-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid #f0f0f0;
}

.exam-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(64, 158, 255, 0.15);
  /* 悬浮时的科技蓝光晕 */
  border-color: #d9ecff;
}

/* 封面区 */
.card-cover {
  height: 140px;
  position: relative;
  overflow: hidden;
}

.placeholder-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* 高端渐变色 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.exam-card:hover .card-cover img {
  transform: scale(1.05);
}

/* 状态标签 */
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.status-ongoing .status-badge {
  background: rgba(103, 194, 58, 0.9);
}

/* 绿色 */
.status-upcoming .status-badge {
  background: rgba(230, 162, 60, 0.9);
}

/* 橙色 */
.status-finished .status-badge {
  background: rgba(144, 147, 153, 0.9);
}

/* 灰色 */

.duration-badge {
  position: absolute;
  bottom: 8px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 内容区 */
.card-content {
  padding: 16px;
}

.exam-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #303133;
}

.exam-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 16px 0;
  height: 36px;
  /* 限制两行 */
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
   -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f7fa;
  padding-top: 12px;
}

.score {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.action-btn {
  padding: 8px 18px;
}

/* 分页 */
.pagination-area {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>