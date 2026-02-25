<template>
  <div class="home-container">
    <div class="banner-section">
      <el-carousel trigger="click" height="360px" class="banner-carousel">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-item" :style="{ backgroundImage: `url(${item.imageUrl})` }">
            <div class="banner-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card shadow="hover" class="feature-card">
          <template #header>
            <div class="card-header">
              <span class="title">🎓 快速开始</span>
            </div>
          </template>
          <div class="quick-nav">
            <div class="nav-item" @click="$router.push('/student/exam')">
              <div class="icon-box bg-blue"><el-icon><EditPen /></el-icon></div>
              <span>参加考试</span>
            </div>
            <div class="nav-item" @click="$router.push('/student/video')">
              <div class="icon-box bg-green"><el-icon><VideoPlay /></el-icon></div>
              <span>视频课程</span>
            </div>
            <div class="nav-item">
              <div class="icon-box bg-orange"><el-icon><Trophy /></el-icon></div>
              <span>错题本</span>
            </div>
            <div class="nav-item">
              <div class="icon-box bg-purple"><el-icon><DataAnalysis /></el-icon></div>
              <span>成绩分析</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="notice-card">
          <template #header>
            <div class="card-header">
              <span class="title">📢 系统公告</span>
              <el-button link type="primary">更多</el-button>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <el-tag size="small" :type="getNoticeTagType(notice.type)" effect="plain" class="notice-tag">
                {{ getNoticeLabel(notice.type) }}
              </el-tag>
              <span class="notice-title" :title="notice.title">{{ notice.title }}</span>
              <span class="notice-date">{{ formatDate(notice.createTime) }}</span>
            </div>
            <el-empty v-if="notices.length === 0" description="暂无公告" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getActiveBanners, getLatestNotices } from '../../../api/system'
import { EditPen, VideoPlay, Trophy, DataAnalysis } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const banners = ref([])
const notices = ref([])

// 加载数据
onMounted(async () => {
  // 并发请求，提升加载速度
  const [bannerRes, noticeRes] = await Promise.all([
    getActiveBanners(),
    getLatestNotices(6)
  ])
  banners.value = bannerRes.data || []
  notices.value = noticeRes.data || []
})

// 工具函数
const getNoticeTagType = (type) => ({ SYSTEM: 'danger', FEATURE: 'success', NOTICE: 'primary' }[type] || 'info')
const getNoticeLabel = (type) => ({ SYSTEM: '通知', FEATURE: '更新', NOTICE: '公告' }[type] || '消息')
const formatDate = (date) => dayjs(date).format('MM-DD')
</script>

<style scoped>
.banner-section { border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.banner-item { height: 100%; background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; }
.banner-content { width: 100%; padding: 40px 60px; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); color: white; }
.banner-content h2 { font-size: 32px; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.banner-content p { font-size: 16px; opacity: 0.9; margin: 0; }

.mt-20 { margin-top: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header .title { font-size: 16px; font-weight: bold; color: #1D2129; border-left: 4px solid #165DFF; padding-left: 10px; }

/* 快捷入口 */
.quick-nav { display: flex; justify-content: space-around; padding: 20px 0; }
.nav-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s; }
.nav-item:hover { transform: translateY(-5px); }
.icon-box { width: 60px; height: 60px; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; margin-bottom: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.bg-blue { background: linear-gradient(135deg, #6aa1ff, #165DFF); }
.bg-green { background: linear-gradient(135deg, #6dd6b0, #00B42A); }
.bg-orange { background: linear-gradient(135deg, #ffcd8b, #FF7D00); }
.bg-purple { background: linear-gradient(135deg, #b8a6ff, #722ED1); }

/* 公告列表 */
.notice-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f2f3f5; cursor: pointer; transition: background 0.2s; }
.notice-item:hover { background: #f9f9f9; padding-left: 8px; }
.notice-item:last-child { border: none; }
.notice-tag { margin-right: 8px; }
.notice-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: #333; }
.notice-date { font-size: 12px; color: #999; margin-left: 10px; }
</style>