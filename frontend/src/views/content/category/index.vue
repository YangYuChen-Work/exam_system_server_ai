<template>
  <div class="category-container">
    <el-card shadow="never" class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">分类管理</span>
          <div class="header-actions">
            <el-button type="primary" icon="Plus" @click="handleAddRoot">新增顶级分类</el-button>
            <el-button icon="Refresh" circle @click="getList" />
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="categoryList"
        row-key="id"
        border
        default-expand-all
        :indent="20"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        :cell-style="{ verticalAlign: 'middle' }" 
        class="category-table"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="name" label="分类名称" min-width="250">
          <template #default="{ row }">
            <span :style="{ fontWeight: row.level === 1 ? 'bold' : 'normal' }">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.level === 1" effect="light" size="small">一级</el-tag>
            <el-tag v-else-if="row.level === 2" type="success" effect="light" size="small">二级</el-tag>
            <el-tag v-else-if="row.level === 3" type="warning" effect="light" size="small">三级</el-tag>
            <el-tag v-else type="info" effect="light" size="small">{{ row.level }} 级</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        
        <el-table-column prop="count" label="题目数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="(row.totalCount || row.count) > 0 ? 'success' : 'info'" effect="plain" round size="small">
              {{ row.totalCount || row.count || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handleAddChild(row)">添加子分类</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗部分 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="父级分类" v-if="form.parentId">
          <el-tag type="info">{{ parentName }}</el-tag>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getCategoryTree, addCategory, updateCategory, deleteCategory, type CategoryVO } from '../../../api/content'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const categoryList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref()
const parentName = ref('')

const form = reactive<CategoryVO>({
  id: undefined,
  name: '',
  parentId: 0,
  sort: 1
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
}

/**
 * 将扁平数组转换为树形结构，并注入层级、计算总数
 */
const arrayToTree = (items: any[], parentId: number = 0, level: number = 1): any[] => {
  return items
    .filter(item => (item.parentId || 0) === parentId)
    .map(item => {
      const children = arrayToTree(items, item.id, level + 1)
      const selfCount = item.count || 0
      const childrenTotalCount = children.reduce((sum, child) => sum + (child.totalCount || child.count || 0), 0)
      const totalCount = selfCount + childrenTotalCount

      return {
        ...item,
        level: level, // 注入层级
        children: children.length > 0 ? children : undefined,
        totalCount: totalCount 
      }
    })
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getCategoryTree()
    let list: any[] = []
    if (res.data && Array.isArray(res.data)) {
      list = res.data
    } else if (res.data?.records && Array.isArray(res.data.records)) {
      list = res.data.records
    }
    
    categoryList.value = arrayToTree(list, 0, 1)
    
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('获取数据异常')
  } finally {
    loading.value = false
  }
}

const handleAddRoot = () => {
  dialogType.value = 'add'
  form.id = undefined
  form.name = ''
  form.parentId = 0
  form.sort = 1
  parentName.value = '顶级分类'
  dialogVisible.value = true
}

const handleAddChild = (row: any) => {
  dialogType.value = 'add'
  form.id = undefined
  form.name = ''
  form.parentId = row.id
  form.sort = 1
  parentName.value = row.name
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.parentId = row.parentId
  form.sort = row.sort
  parentName.value = row.parentId ? '上级分类' : '顶级分类' 
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分类 "${row.name}" 吗？`, '警告',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    try {
      await deleteCategory(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) { /* 错误已由拦截器处理 */ }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await addCategory(form)
          ElMessage.success('新增成功')
        } else {
          await updateCategory(form)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        getList()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const formatDateTime = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.category-container {
  padding: 20px;
}

.box-card {
  border-radius: 4px;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.time-text {
  color: #909399;
  font-size: 13px;
}

/* 强制表格单元格内容垂直居中 */
.category-table :deep(.el-table__cell) {
  vertical-align: middle;
}

.category-table :deep(.cell) {
  display: flex;
  align-items: center;
  gap: 8px; /* 给单元格内元素增加一些间距 */
}
</style>