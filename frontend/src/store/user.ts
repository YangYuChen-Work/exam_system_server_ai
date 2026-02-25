import { defineStore } from 'pinia'
// import { login } from '../api/user' // 暂时不需要后端接口了

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('exam_token') || '',
    userInfo: JSON.parse(localStorage.getItem('user_info') || 'null')
  }),
  actions: {
    // 👇 纯前端模拟登录，无需后端
    async loginAction(loginForm: any) {
      console.log('启动上帝模式，直接跳过后端验证...')
      
      // 1. 伪造一个超级管理员对象
      const mockUser = {
        username: loginForm.username || 'admin', // 用你输入的账号，或者默认admin
        realName: '超级管理员(Dev)',
        role: 'ADMIN', // 关键：赋予管理员权限
        token: 'fake-token-dev-123456', // 假的 Token
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }

      // 2. 存入状态管理
      this.token = mockUser.token
      this.userInfo = mockUser
      
      // 3. 持久化到浏览器缓存 (防止刷新后掉线)
      localStorage.setItem('exam_token', mockUser.token)
      localStorage.setItem('user_info', JSON.stringify(mockUser))
      
      // 模拟一点延迟，更有感觉
      await new Promise(resolve => setTimeout(resolve, 300))

      return mockUser
    },

    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('exam_token')
      localStorage.removeItem('user_info')
    }
  }
})