<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="学生姓名">
          <el-input v-model="queryParams.studentName" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
            <el-option label="已完成" :value="1" />
            <el-option label="已批阅" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="recordList" v-loading="loading" style="width: 100%">
        <el-table-column prop="paper.name" label="考试试卷" min-width="180" />
        <el-table-column prop="studentName" label="考生姓名" width="120" />
        <el-table-column prop="score" label="最终得分" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status === '已批阅'" class="score-text">{{ row.score }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="windowSwitches" label="切屏次数" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.windowSwitches > 3" type="danger">{{ row.windowSwitches }}</el-tag>
            <span v-else>{{ row.windowSwitches }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '已批阅' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AI 操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status !== '已批阅'"
              type="primary" 
              size="small" 
              icon="Cpu"
              @click="handleAiGrade(row)"
            >AI 智能批改</el-button>
            <el-button v-else link type="primary">查看详情</el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getExamRecordList, aiGradeRecord } from '../../../api/exam'
import { ElMessage, ElLoading } from 'element-plus'

const loading = ref(false)
const recordList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  size: 10,
  studentName: '',
  status: null
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getExamRecordList(queryParams)
    recordList.value = res.data.records
    total.value = Number(res.data.total)
  } finally {
    loading.value = false
  }
}

const handleAiGrade = async (row) => {
  // 开启全屏 Loading 体验更具科技感
  const loadingInstance = ElLoading.service({ 
    text: 'AI 正在分析考生答案并进行评分...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    await aiGradeRecord(row.id)
    ElMessage.success('AI 批改完成！')
    fetchList()
  } finally {
    loadingInstance.close()
  }
}

onMounted(fetchList)
</script>

<style scoped>
.app-container { padding: 20px; }
.score-text { font-size: 16px; font-weight: bold; color: #f56c6c; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>