import request from '@/utils/request'

// 角色列表
export function listRole(query) {
  return request({
    url: '/role/list',
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
export function updateRole(id, data) {
  return request({
    url: `/role/update/${id}`,
    method: 'post',
    data
  })
}
// 批量删除角色
export function deleteRole(data) {
  return request({
    url: '/role/delete',
    method: 'post',
    data
  })
}
// 获取层级结构所有权限
export function getPermissionTree() {
  return request({
    url: 'permission/treeList',
    method: 'get'
  })
}
// 获取角色权限
export function getRolePerm(id) {
  return request({
    url: `role/permission/${id}`,
    method: 'get'
  })
}
// 更新角色权限
export function updatePermission(id, data) {
  return request({
    url: `/role/permission/update/${id}`,
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
