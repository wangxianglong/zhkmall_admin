import request from '@/utils/request'

// 商品类目列表
export function listCategory(query) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params: query
  })
}
// 一级类目选项
export function listCatL1() {
  return request({
    url: '/admin/category/l1',
    method: 'get'
  })
}
// 添加商品类目
export function createCategory(data) {
  return request({
    url: '/admin/category/create',
    method: 'post',
    data
  })
}
// 商品类目详情
export function readCategory(data) {
  return request({
    url: '/admin/category/read',
    method: 'get',
    data
  })
}
// 编辑商品类目
export function updateCategory(data) {
  return request({
    url: '/admin/category/update',
    method: 'post',
    data
  })
}
// 删除商品类目
export function deleteCategory(data) {
  return request({
    url: '/admin/category/delete',
    method: 'post',
    data
  })
}
