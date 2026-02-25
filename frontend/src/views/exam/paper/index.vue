<template>
  <div class="app-container">
    <el-card shadow="never" class="mb-20">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="试卷名称">
          <el-input v-model="queryParams.name" placeholder="输入名称搜索..." />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已停止" value="STOPPED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="fetchList">查询</el-button>
          <el-button type="success" icon="MagicStick" @click="openAiDialog">AI 智能组卷</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table :data="paperList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="试卷名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="totalScore" label="总分" width="100" align="center" />
        <el-table-column prop="duration" label="时长(分)" width="100" align="center" />
        <el-table-column prop="questionCount" label="题数" width="100" align="center" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'DRAFT' || row.status === 'STOPPED'"
              link type="success" 
              @click="handleStatus(row, 'PUBLISHED')"
            >发布</el-button>
            <el-button 
              v-if="row.status === 'PUBLISHED'"
              link type="warning" 
              @click="handleStatus(row, 'STOPPED')"
            >停止</el-button>
            <el-button link type="primary">详情</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="aiDialogVisible" title="🤖 AI 智能组卷配置" width="600px">
      <el-form :model="aiForm" label-width="100px">
        <el-form-item label="试卷名称" required>
          <el-input v-model="aiForm.name" placeholder="例如：Java高级期末考试" />
        </el-form-item>
        <el-form-item label="考试时长">
          <el-input-number v-model="aiForm.duration" :min="10" :step="10" /> 分钟
        </el-form-item>
        
        <el-divider content-position="left">出题规则</el-divider>
        <div v-for="(rule, index) in aiForm.rules" :key="index" class="rule-item">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-select v-model="rule.type" placeholder="题型">
                <el-option label="单选题" value="CHOICE" />
                <el-option label="判断题" value="JUDGE" />
                <el-option label="简答题" value="TEXT" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input v-model.number="rule.count" placeholder="数量">
                <template #append>题</template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-input v-model.number="rule.score" placeholder="分值">
                <template #append>分/题</template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="danger" icon="Delete" circle @click="removeRule(index)" v-if="aiForm.rules.length > 1"/>
            </el-col>
          </el-row>
        </div>
        <el-button type="dashed" class="w-100 mt-10" @click="addRule" icon="Plus">添加规则</el-button>
      </el-form>
      <template #footer>
        <el-button @click="aiDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAiPaper" :loading="creating">开始生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPaperList, updatePaperStatus, deletePaper, aiCreatePaper } from '../../../api/exam'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const paperList = ref([])
const aiDialogVisible = ref(false)
const creating = ref(false)

const queryParams = reactive({
  name: '',
  status: ''
})

const aiForm = reactive({
  name: '',
  description: 'AI自动生成试卷',
  duration: 90,
  rules: [
    { type: 'CHOICE', count: 10, score: 2 } // 默认规则
  ]
})

// 状态字典
const getStatusTag = (status) => ({ DRAFT: 'info', PUBLISHED: 'success', STOPPED: 'danger' }[status])
const getStatusLabel = (status) => ({ DRAFT: '草稿', PUBLISHED: '已发布', STOPPED: '已停止' }[status])

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getPaperList(queryParams)
    paperList.value = res.data
  } finally {
    loading.value = false
  }
}

const handleStatus = async (row, status) => {
  await updatePaperStatus(row.id, status)
  ElMessage.success('状态更新成功')
  fetchList()
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确认删除该试卷吗？已发布的试卷无法删除。', '警告', { type: 'warning' })
    .then(async () => {
      await deletePaper(id)
      ElMessage.success('删除成功')
      fetchList()
    })
}

// AI 组卷逻辑
const openAiDialog = () => {
  aiDialogVisible.value = true
}
const addRule = () => aiForm.rules.push({ type: 'CHOICE', count: 5, score: 2 })
const removeRule = (idx) => aiForm.rules.splice(idx, 1)

const submitAiPaper = async () => {
  creating.value = true
  try {
    await aiCreatePaper(aiForm)
    ElMessage.success('AI 组卷成功！')
    aiDialogVisible.value = false
    fetchList()
  } finally {
    creating.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.app-container { padding: 20px; }
.mb-20 { margin-bottom: 20px; }
.rule-item { margin-bottom: 10px; }
.w-100 { width: 100%; }
.mt-10 { margin-top: 10px; }
</style>