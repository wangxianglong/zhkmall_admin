import request from '@/utils/request'

// 商品类目列表
export function listCategory(query) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params: query
  })
}
// 删除商品类目
export function delCategory(data) {
  return request({
    url: '/admin/category/delete',
    method: 'post',
    data
  })
}
// 添加商品类目
export function addCategory(data) {
  return request({
    url: '/admin/category/create',
    method: 'post',
    data
  })
}
// 商品类目详情
export function detCategory(id) {
  return request({
    url: '/admin/category/read',
    method: 'get',
    params: { id }
  })
}
// 编辑商品类目
export function editCategory(data) {
  return request({
    url: '/admin/category/update',
    method: 'post',
    data
  })
}

// 商品管理列表
export function listGoods(query) {
  return request({
    url: '/admin/goods/list',
    method: 'get',
    params: query
  })
}
// 删除商品
export function deleteGoods(data) {
  return request({
    url: '/admin/goods/delete',
    method: 'post',
    data
  })
}
// 添加商品
export function publishGoods(data) {
  return request({
    url: '/admin/goods/create',
    method: 'post',
    data
  })
}
// 商品详情
export function detailGoods(id) {
  return request({
    url: '/admin/goods/read',
    method: 'get',
    params: { id }
  })
}
// 编辑商品
export function editGoods(data) {
  return request({
    url: '/admin/goods/update',
    method: 'post',
    data
  })
}
// 商品上下架
export function upDownGoods(data) {
  return request({
    url: '/admin/goods/standUpAndDown',
    method: 'post',
    data
  })
}

export function listCatAndBrand() {
  return request({
    url: '/admin/goods/catAndBrand',
    method: 'get'
  })
}
