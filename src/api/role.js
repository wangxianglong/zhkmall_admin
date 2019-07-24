import request from '@/utils/request'

// 角色列表
export function listRole(query) {
  return request({
    url: '/admin/role/list',
    method: 'get',
    params: query
  })
}
// 创建角色
export function createRole(data) {
  return request({
    url: '/role/create',
    method: 'post',
    data
  })
}
// 角色详情
export function readRole(data) {
  return request({
    url: '/admin/role/read',
    method: 'get',
    data
  })
}
// 编辑角色
export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'post',
    data
  })
}
// 删除角色
export function deleteRole(data) {
  return request({
    url: '/role/delete',
    method: 'post',
    data
  })
}
// 获取角色权限
export function getPermission(query) {
  return request({
    url: '/admin/role/permissions',
    method: 'get',
    params: query
  })
}
// 更新角色权限
export function updatePermission(data) {
  return request({
    url: '/admin/role/permissions',
    method: 'post',
    data
  })
}
// 获取角色选项
export function roleOptions() {
  return request({
    url: '/admin/role/options',
    method: 'get'
  })
}
