import request from '../utils/request'

// ================= 视频分类管理 =================

// 获取视频分类树
export function getVideoCategoryTree() {
  return request({
    url: '/video-categories/tree',
    method: 'get'
  })
}

// 添加视频分类
export function addVideoCategory(data: any) {
  return request({
    url: '/video-categories',
    method: 'post',
    data
  })
}

// 更新视频分类
export function updateVideoCategory(data: any) {
  return request({
    url: '/video-categories',
    method: 'put',
    data
  })
}

// 删除视频分类
export function deleteVideoCategory(id: number) {
  return request({
    url: `/video-categories/${id}`,
    method: 'delete'
  })
}

// ================= 视频资源管理 (管理端) =================

// 管理端分页获取视频列表
export function getAdminVideoList(params: any) {
  return request({
    url: '/admin/videos',
    method: 'get',
    params
  })
}

// 管理员上传视频 (FormData)
export function adminUploadVideo(formData: FormData) {
  return request({
    url: '/admin/videos/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 审核视频
export function auditVideo(videoId: number, status: number, reason?: string) {
  return request({
    url: `/admin/videos/${videoId}/audit`,
    method: 'post',
    params: { status, reason }
  })
}

// 下架视频
export function offlineVideo(videoId: number) {
  return request({
    url: `/admin/videos/${videoId}/offline`,
    method: 'post'
  })
}

// 删除视频
export function deleteVideo(videoId: number) {
  return request({
    url: `/admin/videos/${videoId}`,
    method: 'delete'
  })
}