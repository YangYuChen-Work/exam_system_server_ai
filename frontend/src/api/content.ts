import request from '../utils/request'

// ================= 分类管理 (Category) =================
// 文档地址: /api/categories

export interface CategoryVO {
  id?: number
  name: string
  parentId?: number
  sort?: number
  count?: number
  children?: CategoryVO[]
  createTime?: string
  updateTime?: string
}

// 1. 获取分类列表
// 文档: GET /api/categories
export function getCategoryTree() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

// 2. 添加新分类
// 文档: POST /api/categories
export function addCategory(data: CategoryVO) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

// 3. 更新分类信息
// 文档: PUT /api/categories
export function updateCategory(data: CategoryVO) {
  // 提取需要更新的字段，避免传输无关数据
  const { id, name, parentId, sort } = data
  return request({
    url: '/categories',
    method: 'put',
    data: { id, name, parentId, sort }
  })
}

// 4. 删除分类
// 文档: DELETE /api/categories/{id}
export function deleteCategory(id: number) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}

// ================= 题目管理 (Question) =================
// 文档地址: /api/questions

// 5. 分页查询题目列表
// 文档: GET /api/questions/list
export function getQuestionPage(params: any) {
  return request({
    url: '/questions/list',
    method: 'get', // ❗文档指定用 GET
    params // GET 请求参数用 params
  })
}

// 6. 根据ID查询题目详情
// 文档: GET /api/questions/{id}
export function getQuestionDetail(id: number | string) {
  return request({
    url: `/questions/${id}`,
    method: 'get'
  })
}

// 7. 创建新题目
// 文档: POST /api/questions
export function addQuestion(data: any) {
  return request({
    url: '/questions',
    method: 'post',
    data
  })
}

// 8. 更新题目信息
// 文档: PUT /api/questions/{id}
// 注意：文档里更新题目 url 是带 id 的
export function updateQuestion(data: any) {
  return request({
    url: `/questions/${data.id}`, // 这里需要把 ID 拼上去
    method: 'put',
    data
  })
}

// 9. 删除题目
// 文档: DELETE /api/questions/{id}
export function deleteQuestion(id: number | string) {
  return request({
    url: `/questions/${id}`,
    method: 'delete'
  })
}