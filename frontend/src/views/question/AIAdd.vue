<template>
  <div class="ai-gen-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>✨ AI 智能出题中心</span>
          <el-steps :active="activeStep" finish-status="success" simple>
            <el-step title="配置需求" />
            <el-step title="AI 生成中" />
            <el-step title="预览与入库" />
          </el-steps>
        </div>
      </template>

      <div v-if="activeStep === 0" class="step-content">
        <el-form :model="genForm" label-width="100px" class="standard-form">
          <el-form-item label="题目主题">
            <el-input v-model="genForm.topic" placeholder="例如：Java并发编程、Spring Cloud实战" />
          </el-form-item>
          <el-form-item label="所属分类">
            <el-tree-select v-model="genForm.categoryId" :data="categoryData" :props="{ label: 'name', value: 'id' }" />
          </el-form-item>
          <el-form-item label="生成数量">
            <el-input-number v-model="genForm.count" :min="1" :max="20" />
          </el-form-item>
          <el-form-item label="难度级别">
            <el-radio-group v-model="genForm.difficulty">
              <el-radio-button label="EASY">简单</el-radio-button>
              <el-radio-button label="MEDIUM">中等</el-radio-button>
              <el-radio-button label="HARD">困难</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-button type="primary" class="wide-btn" @click="startGenerate">开始 AI 生成</el-button>
        </el-form>
      </div>

      <div v-if="activeStep === 1" class="loading-content">
        <el-skeleton :rows="5" animated />
        <p class="ai-tip">AI 正在思考并构思题目，请稍候...</p>
      </div>

      <div v-if="activeStep === 2">
        <el-table :data="previewList" style="width: 100%" height="400">
          <el-table-column type="index" width="50" />
          <el-table-column prop="title" label="题目标题" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag>{{ scope.row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button link type="danger" @click="removePreview(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="footer-actions">
          <el-button @click="activeStep = 0">重试</el-button>
          <el-button type="success" @click="handleConfirmImport">确认导入题库</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCategoryTree, aiGenerateQuestions, importQuestions } from '../../api/question'
import { ElMessage } from 'element-plus'

const activeStep = ref(0)
const categoryData = ref([])
const previewList = ref([])
const genForm = reactive({
  topic: '',
  categoryId: null,
  count: 5,
  difficulty: 'MEDIUM',
  types: 'CHOICE,JUDGE,TEXT'
})

// 加载分类树
onMounted(async () => {
  const res = await getCategoryTree()
  categoryData.ref = res.data
})

const startGenerate = async () => {
  if (!genForm.topic) return ElMessage.warning('请输入主题')
  activeStep.value = 1
  try {
    const res = await aiGenerateQuestions(genForm) // 衔接 AI 接口
    previewList.value = res.data
    activeStep.value = 2
  } catch {
    activeStep.value = 0
  }
}

const handleConfirmImport = async () => {
  await importQuestions(previewList.value) // 衔接批量导入接口
  ElMessage.success('导入成功！')
  activeStep.value = 0
}

const removePreview = (index) => {
  previewList.value.splice(index, 1)
}
</script>

<style scoped>
.box-card { border-radius: 15px; margin: 20px; }
.standard-form { max-width: 500px; margin: 40px auto; }
.wide-btn { width: 100%; height: 45px; margin-top: 20px; }
.loading-content { text-align: center; padding: 60px; }
.ai-tip { margin-top: 20px; color: #4f46e5; font-weight: bold; }
.footer-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; }
</style>