<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="题型">
          <el-select v-model="queryParams.quType" placeholder="全部题型" clearable style="width: 140px">
            <el-option label="单选题" :value="1" />
            <el-option label="多选题" :value="2" />
            <el-option label="判断题" :value="3" />
            <el-option label="简答题" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="queryParams.level" placeholder="全部难度" clearable style="width: 140px">
            <el-option label="简单" :value="1" />
            <el-option label="中等" :value="2" />
            <el-option label="困难" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="queryParams.content" 
            placeholder="输入题目内容搜索..." 
            clearable 
            style="width: 240px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="success" icon="Plus" @click="handleAdd">录入题目</el-button>
        </el-form-item>
      </el-form>

      <el-table 
        v-loading="loading" 
        :data="questionList" 
        border 
        stripe 
        class="mt-20"
        empty-text="暂无数据"
      >
        <el-table-column label="ID" prop="id" width="80" align="center" />
        
        <el-table-column label="题目内容" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.content }}</span>
          </template>
        </el-table-column>

        <el-table-column label="题型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getQuTypeTag(scope.row.quType)">{{ getQuTypeName(scope.row.quType) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="难度" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getLevelTag(scope.row.level)" effect="plain">{{ getLevelName(scope.row.level) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="分值" prop="score" width="80" align="center" />
        
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-if="total > 0"
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>

    <el-dialog 
      :title="form.id ? '编辑题目' : '录入题目'" 
      v-model="dialogVisible" 
      width="700px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题型" prop="quType">
              <el-select v-model="form.quType" placeholder="请选择" @change="handleTypeChange">
                <el-option label="单选题" :value="1" />
                <el-option label="多选题" :value="2" />
                <el-option label="判断题" :value="3" />
                <el-option label="简答题" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度" prop="level">
              <el-select v-model="form.level" placeholder="请选择">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="分值" prop="score">
          <el-input-number v-model="form.score" :min="1" :max="100" />
        </el-form-item>

        <el-form-item label="题目题干" prop="content">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入题目详细内容" 
          />
        </el-form-item>

        <div v-if="form.quType !== 4" class="options-box">
          <el-divider content-position="left">答案选项配置</el-divider>
          
          <div v-if="form.quType === 1 || form.quType === 2">
            <div v-for="(opt, idx) in dynamicOptions" :key="idx" class="option-row">
              <el-tag size="large" class="opt-key">{{ opt.key }}</el-tag>
              <el-input v-model="opt.content" placeholder="选项内容" class="opt-input" />
              
              <el-radio v-if="form.quType === 1" v-model="form.correct" :value="opt.key">
                正确答案
              </el-radio>
              
              <el-checkbox v-if="form.quType === 2" v-model="multiCorrectList" :value="opt.key">
                正确答案
              </el-checkbox>
            </div>
          </div>

          <div v-if="form.quType === 3" class="judge-box">
            <el-radio-group v-model="form.correct">
              <el-radio value="1">正确 (True)</el-radio>
              <el-radio value="0">错误 (False)</el-radio>
            </el-radio-group>
          </div>
        </div>

        <el-form-item label="题目解析" prop="analysis">
          <el-input 
            v-model="form.analysis" 
            type="textarea" 
            placeholder="请输入题目答案解析 (可选)" 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">提交保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getQuestionList, saveQuestion, updateQuestion, deleteQuestion, type QuestionVO, type QuestionOption } from '../../api/question'

// --- 状态 ---
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const total = ref(0)
const questionList = ref<QuestionVO[]>([])

const queryParams = reactive({
  current: 1,
  size: 10,
  content: '',
  quType: undefined,
  level: undefined
})

const formRef = ref()
const form = reactive<QuestionVO>({
  id: undefined,
  quType: 1,
  level: 1,
  content: '',
  score: 5,
  correct: '',
  analysis: '',
  options: ''
})

const dynamicOptions = ref<QuestionOption[]>([
  { key: 'A', content: '' },
  { key: 'B', content: '' },
  { key: 'C', content: '' },
  { key: 'D', content: '' }
])
const multiCorrectList = ref<string[]>([])

const rules = {
  content: [{ required: true, message: '题干内容不能为空', trigger: 'blur' }],
  quType: [{ required: true, message: '请选择题型', trigger: 'change' }],
  level: [{ required: true, message: '请选择难度', trigger: 'change' }]
}

// --- 核心逻辑 ---

const getList = async () => {
  loading.value = true
  try {
    const res = await getQuestionList(queryParams)
    
    // ⭐ 核心修复：防御性代码
    // 即使后端返回 null，这里也不会崩，而是给一个空数组
    if (res && res.data) {
      questionList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      questionList.value = []
      total.value = 0
    }
    
  } catch (error) {
    console.error('获取题目列表失败:', error)
    questionList.value = []
  } finally {
    loading.value = false
  }
}

const handleTypeChange = (val: number) => {
  form.correct = ''
  multiCorrectList.value = []
}

const handleAdd = () => {
  // 重置表单
  Object.assign(form, { id: undefined, quType: 1, level: 1, content: '', score: 5, correct: '', analysis: '', options: '' })
  dynamicOptions.value = [
    { key: 'A', content: '' },
    { key: 'B', content: '' },
    { key: 'C', content: '' },
    { key: 'D', content: '' }
  ]
  multiCorrectList.value = []
  dialogVisible.value = true
}

const handleEdit = (row: QuestionVO) => {
  Object.assign(form, row)
  
  // 选项回显
  if (row.quType === 1 || row.quType === 2) {
    try {
      dynamicOptions.value = row.options ? JSON.parse(row.options) : []
    } catch (e) {
      dynamicOptions.value = []
    }
  }
  
  // 多选答案回显
  if (row.quType === 2) {
    multiCorrectList.value = row.correct ? row.correct.split(',') : []
  }
  
  dialogVisible.value = true
}

const handleDelete = (row: QuestionVO) => {
  ElMessageBox.confirm(`确认删除ID为 ${row.id} 的题目吗?`, '警告', { type: 'warning' })
    .then(async () => {
      await deleteQuestion(row.id!)
      ElMessage.success('删除成功')
      getList()
    })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    // 提交前处理选项
    if (form.quType === 1 || form.quType === 2) {
      form.options = JSON.stringify(dynamicOptions.value)
    }
    
    // 提交前处理多选答案
    if (form.quType === 2) {
      form.correct = multiCorrectList.value.sort().join(',')
    }

    submitLoading.value = true
    try {
      if (form.id) {
        await updateQuestion(form)
        ElMessage.success('更新成功')
      } else {
        await saveQuestion(form)
        ElMessage.success('录入成功')
      }
      dialogVisible.value = false
      getList()
    } catch (e) {
      console.error(e)
    } finally {
      submitLoading.value = false
    }
  })
}

const handleQuery = () => { queryParams.current = 1; getList() }
const resetQuery = () => { 
  queryParams.content = ''
  queryParams.quType = undefined
  queryParams.level = undefined
  handleQuery() 
}

// 辅助展示函数
const getQuTypeName = (t: number) => ({ 1: '单选', 2: '多选', 3: '判断', 4: '简答' }[t] || '未知')
const getQuTypeTag = (t: number) => ({ 1: '', 2: 'success', 3: 'warning', 4: 'info' }[t] || '')
const getLevelName = (l: number) => ({ 1: '简单', 2: '中等', 3: '困难' }[l] || '未知')
const getLevelTag = (l: number) => ({ 1: 'success', 2: 'warning', 3: 'danger' }[l] || '')

onMounted(getList)
</script>

<style scoped>
.filter-form { background: #f9f9f9; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
.mt-20 { margin-top: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.options-box { background: #fafafa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ebeef5; }
.option-row { display: flex; align-items: center; margin-bottom: 12px; gap: 10px; }
.opt-input { flex: 1; }
.opt-key { width: 40px; text-align: center; font-weight: bold; }
.judge-box { padding: 10px 0; }
</style>