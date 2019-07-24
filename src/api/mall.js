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
export function delCategory(id) {
  return request({
    url: `/productCategory/delete/${id}`,
    method: 'post'
  })
}
// 添加商品类目
export function addCategory(data) {
  return request({
    url: '/productCategory/create',
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
    url: '/product/list',
    method: 'get',
    params: query
  })
}
// 删除商品
export function deleteGoods(data) {
  return request({
    url: '/product/update/deleteStatus',
    method: 'post',
    data
  })
}
// 添加商品
export function publishGoods(data) {
  return request({
    url: '/product/create',
    method: 'post',
    data
  })
}
// 商品详情
export function detailGoods(id) {
  return request({
    url: `/product/updateInfo/${id}`,
    method: 'get'
  })
}
// 编辑商品
export function editGoods(id, data) {
  return request({
    url: `/product/update/${id}`,
    method: 'post',
    data
  })
}
// 商品上下架
export function upDownGoods(data) {
  return request({
    url: '/product/update/publishStatus',
    method: 'post',
    data
  })
}
// 推荐商品
export function recommendStatus(data) {
  return request({
    url: '/product/update/recommendStatus',
    method: 'post',
    data
  })
}
// 修改商品审核状态
export function verifyStatus(data) {
  return request({
    url: '/product/update/verifyStatus',
    method: 'post',
    data
  })
}
// 设为新品
export function setNew(data) {
  return request({
    url: '/product/update/newStatus',
    method: 'post',
    data
  })
}
