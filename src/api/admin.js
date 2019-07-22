import request from '@/utils/request'

// 管理员列表
export function listAdmin(query) {
  return request({
    url: '/admin/admin/list',
    method: 'get',
    params: query
  })
}
// 创建管理员
export function createAdmin(data) {
  return request({
    url: '/admin/admin/create',
    method: 'post',
    data
  })
}
// 管理员详情
export function readminAdmin(data) {
  return request({
    url: '/admin/admin/read',
    method: 'get',
    data
  })
}
// 编辑管理员
export function updateAdmin(data) {
  return request({
    url: '/admin/admin/update',
    method: 'post',
    data
  })
}
// 删除管理员
export function deleteAdmin(data) {
  return request({
    url: '/admin/admin/delete',
    method: 'post',
    data
  })
}
// 修改管理员状态
export function statusAdmin(data) {
  return request({
    url: '/admin/admin/status',
    method: 'post',
    data
  })
}

// 对象存储列表
export function listOs(query) {
  return request({
    url: '/os/list',
    method: 'get',
    params: query
  })
}
// 删除对象存储
export function deleteOs(data) {
  return request({
    url: '/os/delete',
    method: 'post',
    data
  })
}
