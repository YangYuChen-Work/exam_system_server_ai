import request from '../utils/request'

// 用户登录
export function login(data: any) {
  return request({
    url: '/user/login',
    method: 'post',
    // 改回 data (JSON 提交)
    data: {
      username: data.username,
      password: data.password
    }
  })
}

export function checkAdmin(userId: number) {
  return request({
    url: `/user/check-admin/${userId}`,
    method: 'get'
  })
}