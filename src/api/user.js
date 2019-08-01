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