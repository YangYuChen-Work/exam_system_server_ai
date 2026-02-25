<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="视频标题">
          <el-input v-model="queryParams.keyword" placeholder="关键词搜索..." />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待审核" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已拒绝" :value="2" />
            <el-option label="已下架" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="queryParams.uploaderType" placeholder="全部来源" clearable style="width: 150px">
            <el-option label="用户投稿" :value="1" />
            <el-option label="管理员上传" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button type="success" icon="Upload" @click="openUploadDialog">上传视频</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="videoList" v-loading="loading" stripe>
        <el-table-column label="封面" width="140">
          <template #default="{ row }">
            <div class="cover-wrapper" @click="playVideo(row)">
              <el-image :src="row.coverUrl" class="video-cover" fit="cover" />
              <div class="play-icon"><el-icon><VideoPlay /></el-icon></div>
              <span class="duration-badge">{{ row.durationText }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column label="上传者" width="150">
          <template #default="{ row }">
            <div>{{ row.uploaderName }}</div>
            <el-tag size="small" :type="row.uploaderType === 2 ? 'warning' : 'info'">
              {{ row.uploaderTypeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据" width="120" align="center">
          <template #default="{ row }">
            <div class="stats-info">
              <span><el-icon><View /></el-icon> {{ row.viewCount }}</span>
              <span><el-icon><Star /></el-icon> {{ row.likeCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" type="success" size="small" @click="openAudit(row)">审核</el-button>
            <el-button v-if="row.status === 1" type="warning" size="small" @click="handleOffline(row)">下架</el-button>
            
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="playVisible" title="视频预览" width="800px" destroy-on-close>
      <video v-if="currentVideoUrl" :src="currentVideoUrl" controls style="width: 100%; max-height: 500px;" autoplay></video>
    </el-dialog>

    <el-dialog v-model="uploadVisible" title="上传视频" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="uploadForm.title" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="所属分类" required>
          <el-tree-select 
            v-model="uploadForm.categoryId" 
            :data="categoryTree" 
            :props="{ label: 'name', value: 'id' }" 
            check-strictly 
            placeholder="请选择分类"
            class="w-100"
          />
        </el-form-item>
        <el-form-item label="视频文件" required>
          <input type="file" accept="video/*" @change="handleVideoFileChange" />
          <div class="tip">支持 mp4, webm 格式</div>
        </el-form-item>
        <el-form-item label="封面图片">
          <input type="file" accept="image/*" @change="handleCoverFileChange" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload" :loading="uploading">开始上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditVisible" title="视频审核" width="400px">
      <p>是否通过该视频的发布申请？</p>
      <el-input v-model="auditReason" type="textarea" placeholder="如果拒绝，请填写原因" class="mt-10" />
      <template #footer>
        <el-button type="danger" @click="submitAudit(2)">拒绝</el-button>
        <el-button type="success" @click="submitAudit(1)">通过</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getAdminVideoList, adminUploadVideo, auditVideo, offlineVideo, deleteVideo, getVideoCategoryTree } from '../../../api/video'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, VideoPlay } from '@element-plus/icons-vue'

const loading = ref(false)
const videoList = ref([])
const total = ref(0)
const categoryTree = ref([])

// 弹窗控制
const playVisible = ref(false)
const currentVideoUrl = ref('')
const uploadVisible = ref(false)
const auditVisible = ref(false)
const uploading = ref(false)

// 临时状态
const currentAuditId = ref(0)
const auditReason = ref('')
const selectedVideoFile = ref(null)
const selectedCoverFile = ref(null)

const queryParams = reactive({
  page: 1,
  size: 10,
  keyword: '',
  status: '',
  uploaderType: ''
})

const uploadForm = reactive({
  title: '',
  categoryId: null,
  description: '',
  uploaderName: '管理员' // 默认传管理员
})

// 状态字典
const getStatusTag = (status) => ({ 0: 'info', 1: 'success', 2: 'danger', 3: 'warning' }[status])

const fetchList = async () => {
  loading.value = true
  try {
    // 清洗空参数
    const params = { ...queryParams }
    if (params.status === '') delete params.status
    if (params.uploaderType === '') delete params.uploaderType
    
    const res = await getAdminVideoList(params)
    if (res.data) {
      videoList.value = res.data.records
      total.value = Number(res.data.total)
    }
  } finally {
    loading.value = false
  }
}

// 播放
const playVideo = (row) => {
  currentVideoUrl.value = row.fileUrl
  playVisible.value = true
}

// 上传相关
const openUploadDialog = async () => {
  uploadVisible.value = true
  if (categoryTree.value.length === 0) {
    const res = await getVideoCategoryTree()
    categoryTree.value = res.data
  }
}
const handleVideoFileChange = (e) => { selectedVideoFile.value = e.target.files[0] }
const handleCoverFileChange = (e) => { selectedCoverFile.value = e.target.files[0] }

const submitUpload = async () => {
  if (!uploadForm.title || !uploadForm.categoryId || !selectedVideoFile.value) {
    return ElMessage.warning('请填写必填项并选择视频文件')
  }
  
  const formData = new FormData()
  formData.append('title', uploadForm.title)
  formData.append('categoryId', uploadForm.categoryId)
  formData.append('uploaderName', uploadForm.uploaderName)
  formData.append('description', uploadForm.description)
  formData.append('videoFile', selectedVideoFile.value)
  if (selectedCoverFile.value) {
    formData.append('coverFile', selectedCoverFile.value)
  }

  uploading.value = true
  try {
    await adminUploadVideo(formData)
    ElMessage.success('上传成功，视频已自动发布')
    uploadVisible.value = false
    fetchList()
  } finally {
    uploading.value = false
  }
}

// 审核相关
const openAudit = (row) => {
  currentAuditId.value = row.id
  auditReason.value = ''
  auditVisible.value = true
}
const submitAudit = async (status) => {
  if (status === 2 && !auditReason.value) return ElMessage.warning('拒绝请填写原因')
  await auditVideo(currentAuditId.value, status, auditReason.value)
  ElMessage.success('审核完成')
  auditVisible.value = false
  fetchList()
}

// 下架
const handleOffline = async (row) => {
  await offlineVideo(row.id)
  ElMessage.success('视频已下架')
  fetchList()
}

// 删除
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该视频吗？', '提示', { type: 'warning' })
  await deleteVideo(id)
  ElMessage.success('删除成功')
  fetchList()
}

const handleSearch = () => {
  queryParams.page = 1
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.app-container { padding: 20px; }
.mb-20 { margin-bottom: 20px; }
.w-100 { width: 100%; }
.mt-10 { margin-top: 10px; }
.tip { font-size: 12px; color: #999; margin-top: 5px; }

/* 视频封面样式 */
.cover-wrapper { position: relative; width: 120px; height: 68px; cursor: pointer; border-radius: 4px; overflow: hidden; }
.video-cover { width: 100%; height: 100%; }
.play-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.8); font-size: 24px; display: none; }
.cover-wrapper:hover .play-icon { display: block; }
.duration-badge { position: absolute; bottom: 2px; right: 4px; background: rgba(0,0,0,0.6); color: white; font-size: 10px; padding: 0 4px; border-radius: 2px; }

.stats-info { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #666; }
</style>