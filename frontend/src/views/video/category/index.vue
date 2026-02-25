<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>视频栏目分类</span>
          <el-button type="primary" icon="Plus" @click="handleAdd(null)">新增一级栏目</el-button>
        </div>
      </template>

      <el-table
        :data="categoryList"
        style="width: 100%"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        v-loading="loading"
      >
        <el-table-column prop="name" label="栏目名称" sortable />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="100" align="center" />
        <el-table-column prop="videoCount" label="视频数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" round>{{ row.videoCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button link type="primary" icon="Plus" @click="handleAdd(row)">添加子栏目</el-button>
            <el-button link type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑栏目' : '新增栏目'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="父级栏目">
          <el-input :value="parentName" disabled placeholder="顶级栏目" />
        </el-form-item>
        <el-form-item label="栏目名称" required>
          <el-input v-model="form.name" placeholder="例如：Java并发编程" />
        </el-form-item>
        <el-form-item label="栏目描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { getVideoCategoryTree, addVideoCategory, updateVideoCategory, deleteVideoCategory } from '../../../api/video'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const categoryList = ref([])
const dialogVisible = ref(false)
const parentName = ref('顶级栏目')

const form = reactive({
  id: 0,
  parentId: 0,
  name: '',
  description: '',
  sortOrder: 1,
  status: 1
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getVideoCategoryTree()
    categoryList.value = res.data
  } finally {
    loading.value = false
  }
}

const handleAdd = (row) => {
  Object.assign(form, { id: 0, name: '', description: '', sortOrder: 1, status: 1 })
  if (row) {
    form.parentId = row.id
    parentName.value = row.name
  } else {
    form.parentId = 0
    parentName.value = '顶级栏目'
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  parentName.value = row.parentId === 0 ? '顶级栏目' : '（保持原父级）'
  dialogVisible.value = true
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该分类吗？', '警告', { type: 'warning' })
    .then(async () => {
      await deleteVideoCategory(id)
      ElMessage.success('删除成功')
      fetchList()
    })
}

const submitForm = async () => {
  if (form.id) {
    await updateVideoCategory(form)
  } else {
    await addVideoCategory(form)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.app-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>