<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>系统公告管理</span>
          <el-button type="primary" icon="Plus" @click="handleEdit()">发布新公告</el-button>
        </div>
      </template>

      <el-table :data="noticeList" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="公告标题" min-width="200" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag effect="dark" :type="row.priority === 2 ? 'danger' : (row.priority === 1 ? 'warning' : 'info')">
              {{ row.priority === 2 ? '紧急' : (row.priority === 1 ? '重要' : '普通') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.isActive" @change="(val) => handleStatusChange(row, val)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑公告' : '发布公告'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.type">
            <el-radio-button label="SYSTEM">系统通知</el-radio-button>
            <el-radio-button label="FEATURE">功能更新</el-radio-button>
            <el-radio-button label="NOTICE">普通公告</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="form.priority">
            <el-radio :label="0">普通</el-radio>
            <el-radio :label="1">重要</el-radio>
            <el-radio :label="2">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getNoticeList, addNotice, updateNotice, deleteNotice, toggleNoticeStatus } from '../../../api/system'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const noticeList = ref([])
const dialogVisible = ref(false)

const form = reactive({
  id: 0,
  title: '',
  content: '',
  type: 'SYSTEM',
  priority: 0,
  isActive: true
})

// 辅助函数：类型显示
const getTypeTag = (type) => {
  const map = { SYSTEM: 'danger', FEATURE: 'success', NOTICE: 'primary' }
  return map[type] || 'info'
}
const getTypeLabel = (type) => {
  const map = { SYSTEM: '系统通知', FEATURE: '功能更新', NOTICE: '普通公告' }
  return map[type] || type
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getNoticeList()
    noticeList.value = res.data
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row, val) => {
  try {
    await toggleNoticeStatus(row.id, val)
    ElMessage.success('状态更新成功')
  } catch {
    row.isActive = !val
  }
}

const handleEdit = (row) => {
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, { id: 0, title: '', content: '', type: 'SYSTEM', priority: 0, isActive: true })
  }
  dialogVisible.value = true
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确认删除该公告吗?', '提示', { type: 'warning' })
    .then(async () => {
      await deleteNotice(id)
      ElMessage.success('删除成功')
      fetchList()
    })
}

const submitForm = async () => {
  if (form.id) {
    await updateNotice(form)
  } else {
    await addNotice(form)
  }
  ElMessage.success('发布成功')
  dialogVisible.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.app-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>