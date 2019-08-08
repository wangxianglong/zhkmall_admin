import request from '@/utils/request'

// 用户列表
export function fetchList(query) {
  return request({
    url: '/admin/list',
    method: 'get',
    params: query
  })
}

// 编辑用户
export function fetchEdit(id, query) {
  return request({
    url: `/admin/update/${id}`,
    method: 'post',
    data: query
  })
}

// 删除用户
export function fetchDel(query) {
  return request({
    url: `/admin/delete/${query}`,
    method: 'post'
  })
}

// 创建用户
export function fetchAdd(query) {
  return request({
    url: 'admin/register',
    method: 'post',
    data: query
  })
}

// 获取用户权限
export function getAdminPerm(id) {
  return request({
    url: `admin/permission/${id}`,
    method: 'get'
  })
}

// 更新用户权限
export function updAdminPerm(id, data) {
  return request({
    url: `/admin/permission/update/${id}`,
    method: 'post',
    data
  })
}

// 获取用户角色
export function getAdminRole(id) {
  return request({
    url: `admin/role/${id}`,
    method: 'get'
  })
}

// 更新用户角色
export function updAdminRole(id, data) {
  return request({
    url: `/admin/role/update/${id}`,
    method: 'post',
    data
  })
}

// 用户中心
export function getUser() {
  return request({
    url: '/admin/admin/Center',
    method: 'get'
  })
}

// 修改用户密码
export function updPassword(data) {
  return request({
    url: '/admin/update/password',
    method: 'post',
    data
  })
}
