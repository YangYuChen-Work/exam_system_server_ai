<template>
  <div class="question-manage-container">
    <el-container>
      <!-- 左侧主内容区 -->
      <el-main>
        <el-card shadow="never" class="mb-20">
          <div class="top-bar">
            <el-form :inline="true" :model="queryParams" class="filter-form">
              <el-form-item>
                <el-input v-model="queryParams.keywords" placeholder="输入题目关键词搜索..." :prefix-icon="Search" clearable @keyup.enter="handleSearch" />
              </el-form-item>
              <el-form-item>
                <el-select v-model="queryParams.type" placeholder="全部题型" clearable style="width: 120px;">
                  <el-option label="单选题" value="CHOICE" />
                  <el-option label="判断题" value="JUDGE" />
                  <el-option label="简答题" value="TEXT" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select v-model="queryParams.difficulty" placeholder="全部难度" clearable style="width: 120px;">
                  <el-option label="简单" value="EASY" />
                  <el-option label="中等" value="MEDIUM" />
                  <el-option label="困难" value="HARD" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
                <el-button :icon="Refresh" @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
            
            <div class="action-buttons">
              <el-button :icon="Plus" type="primary" @click="openDialog()">录入题目</el-button>
              <el-button :icon="Delete" type="danger" @click="handleBulkDelete" :disabled="selectedIds.length === 0">批量删除</el-button>
              <el-button :icon="Upload" type="info" disabled>导入题目</el-button>
              <el-button :icon="MagicStick" type="warning" disabled>AI生成</el-button>
            </div>
          </div>
        </el-card>

        <el-card shadow="never">
          <el-table :data="questionList" v-loading="loading" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="题目内容" show-overflow-tooltip min-width="300" />
            <el-table-column label="题型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'JUDGE' ? 'success' : row.type === 'TEXT' ? 'warning' : 'info'">{{ formatType(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="难度" width="100">
              <template #default="{ row }">
                <el-tag :type="row.difficulty === 'HARD' ? 'danger' : row.difficulty === 'MEDIUM' ? 'warning' : 'success'">
                  {{ formatDifficulty(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分值" width="80" align="center" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(row.id)">删除</el-button>
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
      </el-main>

      <!-- 右侧分类栏 -->
      <el-aside width="250px" class="category-aside">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>题目分类</span>
              <el-button link type="primary" @click="handleResetCategory">重置</el-button>
            </div>
          </template>
          <el-tree
            :data="categoryTreeData"
            :props="{ label: 'name', children: 'children' }"
            @node-click="handleCategoryClick"
            default-expand-all
            class="category-tree"
          />
        </el-card>
      </el-aside>
    </el-container>

    <el-drawer v-model="drawerVisible" :title="form.id ? '编辑题目' : '录入新题'" size="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="题型" required>
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio-button label="CHOICE">单选题</el-radio-button>
            <el-radio-button label="JUDGE">判断题</el-radio-button>
            <el-radio-button label="TEXT">简答题</el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="所属分类" required>
          <el-tree-select 
            v-model="form.categoryId" 
            :data="categoryOptions" 
            :props="{ label: 'name', value: 'id' }" 
            check-strictly
            placeholder="请选择分类"
            class="w-100"
          />
        </el-form-item>

        <el-form-item label="题目内容" required>
          <el-input v-model="form.title" type="textarea" :rows="3" placeholder="请输入题目题干..." />
        </el-form-item>

        <div v-if="form.type === 'CHOICE'" class="options-area">
          <el-divider content-position="left">选项配置</el-divider>
          <div v-for="(item, index) in form.choices" :key="index" class="option-item">
            <el-radio v-model="correctChoiceIndex" :label="index" class="radio-label">
              {{ String.fromCharCode(65 + index) }}
            </el-radio>
            <el-input v-model="item.content" placeholder="选项内容" style="flex:1" />
            <el-button type="danger" icon="Delete" circle size="small" @click="removeOption(index)" v-if="form.choices.length > 2"/>
          </div>
          <el-button type="dashed" class="w-100 mt-10" @click="addOption" icon="Plus">添加选项</el-button>
        </div>

        <div v-if="form.type === 'JUDGE'">
          <el-form-item label="正确答案">
            <el-switch 
              v-model="form.answer" 
              active-value="正确" 
              inactive-value="错误" 
              active-text="正确" 
              inactive-text="错误" 
            />
          </el-form-item>
        </div>

        <div v-if="form.type === 'TEXT'">
          <el-form-item label="参考答案">
            <el-input v-model="form.answer" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item label="AI关键词">
            <el-input v-model="form.keywords" placeholder="用于AI自动批改，多个关键词用逗号隔开" />
          </el-form-item>
        </div>

        <el-divider />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="难度">
              <el-rate v-model="difficultyRate" :max="3" :texts="['简单', '中等', '困难']" show-text />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认分值">
              <el-input-number v-model="form.score" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="解析">
          <el-input v-model="form.analysis" type="textarea" placeholder="题目答案解析..." />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存题目</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Refresh, Plus, Delete, Upload, MagicStick, Edit } from '@element-plus/icons-vue'
import { getQuestionPage, addQuestion, updateQuestion, deleteQuestion, getCategoryTree } from '../../../api/content'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表相关
const loading = ref(false)
const questionList = ref([])
const selectedIds = ref([]) // 用于存储表格多选的id
const total = ref(0)
const queryParams = reactive({
  page: 1,
  size: 10,
  type: '',
  difficulty: '',
  keywords: '',
  categoryId: undefined
})

// 分类树数据
const categoryTreeData = ref([])

// 表单相关
const drawerVisible = ref(false)
const categoryOptions = ref([])
const correctChoiceIndex = ref(0) // 临时记录单选选中项的索引
const difficultyRate = ref(2) // 1=EASY, 2=MEDIUM, 3=HARD

const form = reactive({
  id: 0,
  title: '',
  type: 'CHOICE',
  categoryId: null,
  difficulty: 'MEDIUM',
  score: 5,
  analysis: '',
  answer: '', // 判断/简答题答案
  keywords: '',
  choices: [
    { content: '', isCorrect: true, sort: 1 },
    { content: '', isCorrect: false, sort: 2 },
    { content: '', isCorrect: false, sort: 3 },
    { content: '', isCorrect: false, sort: 4 }
  ]
})

const arrayToTree = (items, parentId = 0) => {
  if (!Array.isArray(items)) return []
  return items
    .filter(item => (item.parentId || 0) === parentId)
    .map(item => {
      const children = arrayToTree(items, item.id)
      return {
        ...item,
        children: children.length > 0 ? children : undefined,
      }
    })
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

// 初始化加载
onMounted(async () => {
  fetchList()
  const res = await getCategoryTree()
  const categories = res.data || []
  categoryOptions.value = categories // For form dropdown
  categoryTreeData.value = arrayToTree(categories) // For side tree view
})

// src/views/content/question/index.vue

const fetchList = async () => {
  loading.value = true
  try {
    const params = { ...queryParams }
                    console.log('Sending params to API:', params) // <--- 添加日志
                    // Clean up params by removing empty or null values
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })

    const res = await getQuestionPage(params)
    
    if (res.data && res.data.records) {
      questionList.value = res.data.records
      total.value = Number(res.data.total)
    } else {
      questionList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化工具
const formatType = (type) => ({ CHOICE: '单选题', JUDGE: '判断题', TEXT: '简答题' }[type] || type)
const formatDifficulty = (diff) => ({ EASY: '简单', MEDIUM: '中等', HARD: '困难' }[diff] || diff)

// 右侧分类树筛选
const handleCategoryClick = (data) => {
  queryParams.categoryId = data.id
  handleSearch() // Reset page to 1 and fetch
}

const handleResetCategory = () => {
  queryParams.categoryId = undefined
  handleSearch()
}

// 表单逻辑
const openDialog = () => {
  Object.assign(form, {
    id: 0, title: '', type: 'CHOICE', categoryId: null, difficulty: 'MEDIUM', score: 5, analysis: '', answer: '', keywords: '',
    choices: [{ content: '', isCorrect: true, sort: 1 }, { content: '', isCorrect: false, sort: 2 }, { content: '', isCorrect: false, sort: 3 }, { content: '', isCorrect: false, sort: 4 }]
  })
  correctChoiceIndex.value = 0
  difficultyRate.value = 2
  drawerVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, JSON.parse(JSON.stringify(row))) // 深拷贝
  // 难度回显
  const diffMap = { EASY: 1, MEDIUM: 2, HARD: 3 }
  difficultyRate.value = diffMap[row.difficulty] || 2
  
  // 单选题选项回显处理
  if (row.type === 'CHOICE' && row.choices) {
    const idx = row.choices.findIndex(c => c.isCorrect)
    correctChoiceIndex.value = idx >= 0 ? idx : 0
  }
  
  drawerVisible.value = true
}

const handleTypeChange = () => {
  // 切换题型时重置一些默认值
  if (form.type === 'JUDGE') form.answer = '正确'
  if (form.type === 'TEXT') form.answer = ''
}

const addOption = () => {
  form.choices.push({ content: '', isCorrect: false, sort: form.choices.length + 1 })
}
const removeOption = (index) => {
  form.choices.splice(index, 1)
  if (correctChoiceIndex.value === index) correctChoiceIndex.value = 0
}

const submitForm = async () => {
  // 数据预处理
  const diffMapReverse = { 1: 'EASY', 2: 'MEDIUM', 3: 'HARD' }
  form.difficulty = diffMapReverse[difficultyRate.value]

  // 单选题处理选中状态
  if (form.type === 'CHOICE') {
    form.choices.forEach((c, idx) => {
      c.isCorrect = (idx === correctChoiceIndex.value)
      c.sort = idx + 1
    })
    // 单选题不需要 answer 字段，后端看 choices
    form.answer = '' 
  }

  if (form.id) {
    await updateQuestion(form.id, form)
  } else {
    await addQuestion(form)
  }
  ElMessage.success('保存成功')
  drawerVisible.value = false
  fetchList()
}

const handleSearch = () => {
  queryParams.page = 1
  fetchList()
}

const handleReset = () => {
  queryParams.page = 1
  queryParams.keywords = ''
  queryParams.type = ''
  queryParams.difficulty = ''
  queryParams.categoryId = undefined // Also reset the category filter
  fetchList()
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该题目吗？', '提示', { type: 'warning' })
  await deleteQuestion(id)
  ElMessage.success('删除成功')
  fetchList()
}

const handleBulkDelete = async () => {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条题目吗？`, '提示', { type: 'warning' })
  try {
    // The backend API doesn't support real bulk deletion, so we have to iterate.
    // Using Promise.all to send requests in parallel for better performance.
    const deletePromises = selectedIds.value.map(id => deleteQuestion(id))
    await Promise.all(deletePromises)
    
    ElMessage.success(`成功删除了 ${selectedIds.value.length} 条题目`)
    fetchList() // Refresh the list
  } catch (error) {
    console.error("批量删除失败:", error)
    ElMessage.error('批量删除失败，请稍后重试')
  }
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}
</script>

<style scoped>
.question-manage-container {
  padding: 20px;
}

.el-main {
  padding: 0;
}

.category-aside {
  padding-left: 20px;
}

.mb-20 { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.w-100 { width: 100%; }
.mt-10 { margin-top: 10px; }
.option-item { display: flex; align-items: center; margin-bottom: 10px; gap: 10px; }
.radio-label { margin-right: 0; min-width: 40px; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tree {
  margin-top: 10px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form .el-form-item {
  margin-bottom: 0;
}
</style>