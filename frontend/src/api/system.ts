import request from '../utils/request'

// ================= 轮播图管理 =================

// 获取轮播图列表
export function getBannerList() {
  return request({
    url: '/banners/list',
    method: 'get'
  })
}

// 添加轮播图
export function addBanner(data: any) {
  return request({
    url: '/banners/add',
    method: 'post',
    data
  })
}

// 更新轮播图
export function updateBanner(data: any) {
  return request({
    url: '/banners/update',
    method: 'put',
    data
  })
}

// 删除轮播图
export function deleteBanner(id: number) {
  return request({
    url: `/banners/delete/${id}`,
    method: 'delete'
  })
}

// 切换轮播图状态
export function toggleBannerStatus(id: number, isActive: boolean) {
  return request({
    url: `/banners/toggle/${id}`,
    method: 'put',
    params: { isActive }
  })
}

// 上传图片接口
// 注意：通常 ElementPlus 的 Upload 组件会自动处理上传，但如果需要手动上传可用此接口
export const uploadActionUrl = '/api/banners/upload-image' 

// ================= 公告管理 =================

// 获取公告列表
export function getNoticeList() {
  return request({
    url: '/notices/list',
    method: 'get'
  })
}

// 添加公告
export function addNotice(data: any) {
  return request({
    url: '/notices/add',
    method: 'post',
    data
  })
}

// 更新公告
export function updateNotice(data: any) {
  return request({
    url: '/notices/update',
    method: 'put',
    data
  })
}

// 删除公告
export function deleteNotice(id: number) {
  return request({
    url: `/notices/delete/${id}`,
    method: 'delete'
  })
}

// 切换公告状态
export function toggleNoticeStatus(id: number, isActive: boolean) {
  return request({
    url: `/notices/toggle/${id}`,
    method: 'put',
    params: { isActive }
  })
}

// ... 原有代码保持不变 ...

// ================= 学生端/前台专用接口 =================

// 获取启用的轮播图 (前台用)
export function getActiveBanners() {
  return request({
    url: '/banners/active',
    method: 'get'
  })
}

// 获取启用的公告 (前台用)
export function getActiveNotices() {
  return request({
    url: '/notices/active',
    method: 'get'
  })
}

// 获取最新公告 (前台用，通常用于滚动显示)
export function getLatestNotices(limit: number = 5) {
  return request({
    url: '/notices/latest',
    method: 'get',
    params: { limit }
  })
}