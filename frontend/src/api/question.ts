import request from '../utils/request'

// 题目列表查询参数类型
export interface QuestionQuery {
  current: number
  size: number
  content?: string
  quType?: number
  level?: number
  repoId?: number
}

// 题目对象类型
export interface QuestionVO {
  id?: string | number
  quType: number
  level: number
  content: string
  image?: string
  options?: string
  analysis?: string
  correct?: string
  score?: number
  repoId?: number
}

// 1. 分页获取题目列表
// ⭐ 修复点：尝试去掉 /exam 前缀，直接用 /question/paging
// 如果后端是规范的 RESTful 风格，通常是 /question/paging
export function getQuestionList(data: QuestionQuery) {
  return request({
    url: '/question/paging', 
    method: 'post',
    data
  })
}

// 2. 保存题目
export function saveQuestion(data: QuestionVO) {
  return request({
    url: '/question/save',
    method: 'post',
    data
  })
}

// 3. 修改题目
export function updateQuestion(data: QuestionVO) {
  return request({
    url: '/question/update',
    method: 'post',
    data
  })
}

// 4. 删除题目
export function deleteQuestion(id: string | number) {
  return request({
    url: `/question/delete/${id}`,
    method: 'post'
  })
}