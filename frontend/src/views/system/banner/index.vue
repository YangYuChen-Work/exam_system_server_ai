<template>
  <div class="app-container">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>轮播图配置</span>
          <el-button type="primary" icon="Plus" @click="handleEdit()">新增轮播图</el-button>
        </div>
      </template>

      <el-table :data="bannerList" v-loading="loading" style="width: 100%">
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />

        <el-table-column label="轮播图片" width="220">
          <template #default="scope">
            <el-image style="width: 160px; height: 90px; border-radius: 4px; border: 1px solid #eee"
              :src="resolveImageUrl(scope.row.imageUrl)" :preview-src-list="[resolveImageUrl(scope.row.imageUrl)]"
              fit="cover" preview-teleported>
              <template #error>
                <div class="image-slot"
                  style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;background:#f5f7fa;color:#909399;">
                  <el-icon>
                    <Picture />
                  </el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="linkUrl" label="跳转链接" min-width="200" show-overflow-tooltip />

        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.isActive" @change="(val) => handleStatusChange(scope.row, val)"
              active-color="#13ce66" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑轮播图' : '新增轮播图'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="图片" required>
          <el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false"
            :on-success="handleUploadSuccess" name="file" :headers="{ Authorization: token }">
            <img v-if="form.imageUrl" :src="resolveImageUrl(form.imageUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.linkUrl" placeholder="点击轮播图跳转的地址" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
// 请确保这个路径是对的，如果报错请改回你原来的路径
import { getBannerList, addBanner, updateBanner, deleteBanner, toggleBannerStatus, uploadActionUrl } from '../../../api/system'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Picture } from '@element-plus/icons-vue' // 引入图标

const loading = ref(false)
const bannerList = ref([])
const dialogVisible = ref(false)
const uploadUrl = uploadActionUrl
// 注意：有些后端需要 'Bearer ' 前缀，有些不需要，根据你之前代码保留了 Bearer
const token = 'Bearer ' + localStorage.getItem('exam_token')

const form = reactive({
  id: 0,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 1,
  description: '',
  isActive: true
})

// ⭐ 全能型图片路径修复函数
const resolveImageUrl = (url) => {
  if (!url) return ''

  // 1. 定义 MinIO 的基础路径 (你的阿里云地址)
  // 注意：这里是 bucket 的根目录
  const minioRoot = 'http://47.95.5.243:9000/exam-system-bucket'

  // 2. 情况 A: 已经是完整 HTTP 链接
  if (url.startsWith('http') || url.startsWith('https')) {
    // 🚨 关键：对 URL 进行编码，解决“微信图片”等中文乱码导致的 404
    return encodeURI(url)
  }

  // 3. 情况 B: 以前的相对路径 "/files/banners/..."
  if (url.startsWith('/files')) {
    // 替换 /files 为空，拼接到 MinIO 后面
    // 结果: http://.../banners/xxx.jpg
    return minioRoot + encodeURI(url.replace('/files', ''))
  }

  // 4. 情况 C: 【本次修复重点】纯文件名 "c3472ee...jpg"
  // 如果不是 / 开头，也不是 http 开头，说明它只是个文件名
  if (!url.startsWith('/')) {
    // 默认假设它是一张轮播图，拼上 /banners/ 前缀
    // 如果是头像，可能需要改成 /avatars/，根据实际情况调整
    return `${minioRoot}/banners/${encodeURI(url)}`
  }

  // 5. 其他情况 (比如 /images/logo.png 本地静态资源)
  return url
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getBannerList()
    // ⭐ 核心修复 B: 数据转换
    // 后端如果返回的是 1/0 (数字)，我们需要把它转成 true/false，否则 switch 开关不显示状态
    bannerList.value = res.data.map(item => {
      // 兼容后端字段名: 可能叫 is_active 或 isActive
      const rawStatus = item.isActive !== undefined ? item.isActive : item.is_active
      return {
        ...item,
        // 强制转为布尔值，解决开关不灵的问题
        isActive: rawStatus === 1 || rawStatus === true || rawStatus === '1'
      }
    })
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row, val) => {
  try {
    // 传给后端时，有些后端需要 1/0，有些能吃 boolean。
    // 如果报错，可以试着改成: await toggleBannerStatus(row.id, val ? 1 : 0)
    await toggleBannerStatus(row.id, val)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.isActive = !val // 失败回滚
    console.error(error)
  }
}

const handleEdit = (row) => {
  if (row) {
    Object.assign(form, row)
  } else {
    // 新增时重置
    Object.assign(form, { id: 0, title: '', imageUrl: '', linkUrl: '', sortOrder: 1, description: '', isActive: true })
  }
  dialogVisible.value = true
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确认删除该轮播图吗?', '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(async () => {
      await deleteBanner(id)
      ElMessage.success('删除成功')
      fetchList()
    })
}

const handleUploadSuccess = (res) => {
  // 兼容后端返回结构
  if (res.code === 200) {
    // 如果后端直接返回字符串url
    if (typeof res.data === 'string') {
      form.imageUrl = res.data
    } else {
      // 如果 data 里还有 url 字段
      form.imageUrl = res.data.url || res.data
    }
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const submitForm = async () => {
  try {
    // 提交前，确保 status 是后端想要的格式 (如果后端要 int，这里转一下)
    const submitData = { ...form }
    // 如果后端严格要求 1/0，取消下面这行的注释
    // submitData.isActive = form.isActive ? 1 : 0 

    if (form.id) {
      await updateBanner(submitData)
    } else {
      await addBanner(submitData)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

onMounted(fetchList)
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card {
  border-radius: 8px;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  transition: .3s;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 20px;
}
</style>