import request from '../utils/request'

// ==========================================
//           Part 1: 原有代码 (管理端 - 试卷与批阅)
// ==========================================

// ================= 试卷管理 =================

// 获取试卷列表 (Admin用)
export function getPaperList(params: any) {
  return request({
    url: '/papers/list',
    method: 'get',
    params
  })
}

// 更改试卷状态 (发布/停止)
export function updatePaperStatus(id: number, status: string) {
  return request({
    url: `/papers/${id}/status`,
    method: 'post',
    params: { status }
  })
}

// AI 智能组卷
export function aiCreatePaper(data: any) {
  return request({
    url: '/papers/ai',
    method: 'post',
    data
  })
}

// 删除试卷
export function deletePaper(id: number) {
  return request({
    url: `/papers/${id}`,
    method: 'delete'
  })
}

// ================= 成绩/考试记录管理 =================

// 分页查询考试记录 (Admin用)
export function getExamRecordList(params: any) {
  return request({
    url: '/exam-records/list',
    method: 'get',
    params
  })
}

// AI 自动批阅
export function aiGradeRecord(examRecordId: number) {
  return request({
    url: `/exams/${examRecordId}/grade`,
    method: 'post'
  })
}

// 获取单条记录详情（含答题细节）
export function getExamRecordDetail(id: number) {
  return request({
    url: `/exam-records/${id}`,
    method: 'get'
  })
}


// ==========================================
//           Part 2: 新增代码 (学生端 - 在线考试)
// ==========================================

// 定义考试对象的类型结构（方便前端提示）
export interface ExamVO {
  id: number
  title: string
  description: string 
  startTime: string   
  endTime: string     
  duration: number    
  type: string        
  coverUrl?: string   
  totalScore: number  
}

/**
 * 获取学生端的“在线考试”列表
 * 注意：这里请求的 url 可能和管理端不一样，
 * 管理端是 /papers/list (查试卷库)
 * 学生端是 /exam/list (查发布的考试活动)
 * 如果后端没分开，暂时也可以复用 /papers/list，取决于你后端怎么写的
 */
export function getExamList(params: any) {
  return request({
    // 假设后端有一个专门给学生看发布的考试接口
    url: '/exam/student/list', 
    // 如果没有专门接口，也可以暂时用 '/papers/list'，但在组件里过滤状态
    method: 'get',
    params
  })
}

/**
 * 学生开始考试（获取试卷内容）
 * 区别于 getPaperList，这个接口应该返回题目，且开始倒计时
 */
export function startExam(examId: number) {
  return request({
    url: `/exam/start/${examId}`,
    method: 'post'
  })
}

/**
 * 学生提交试卷
 */
export function submitExam(data: any) {
  return request({
    url: `/exam/submit`,
    method: 'post',
    data
  })
}