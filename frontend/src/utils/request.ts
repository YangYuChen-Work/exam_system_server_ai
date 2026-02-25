import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截
service.interceptors.request.use(config => {
  const token = localStorage.getItem('exam_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}` // 适配文档中的 token 验证
  }
  return config
})

// 响应拦截
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '系统错误')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)

export default service