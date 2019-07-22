import request from '@/utils/request'

// 菜品类目列表
export function listCategory(query) {
  return request({
    url: '/admin/suppercategory/list',
    method: 'get',
    params: query
  })
}
// 删除菜品类目
export function delCategory(data) {
  return request({
    url: '/admin/suppercategory/delete',
    method: 'post',
    data
  })
}
// 添加菜品类目
export function addCategory(data) {
  return request({
    url: '/admin/suppercategory/create',
    method: 'post',
    data
  })
}
// 菜品类目详情
export function detCategory(id) {
  return request({
    url: '/admin/suppercategory/read',
    method: 'get',
    params: { id }
  })
}
// 编辑菜品类目
export function editCategory(data) {
  return request({
    url: '/admin/suppercategory/update',
    method: 'post',
    data
  })
}
// 菜品类目选项
export function getCategory() {
  return request({
    url: '/admin/suppercategory/l1',
    method: 'get'
  })
}

// 菜品列表
export function listSupper(query) {
  return request({
    url: '/admin/supper/list',
    method: 'get',
    params: query
  })
}
// 删除菜品
export function delSupper(data) {
  return request({
    url: '/admin/supper/delete',
    method: 'post',
    data
  })
}
// 添加菜品
export function addSupper(data) {
  return request({
    url: '/admin/supper/create',
    method: 'post',
    data
  })
}
// 菜品详情
export function detSupper(id) {
  return request({
    url: '/admin/supper/read',
    method: 'get',
    params: { id }
  })
}
// 编辑菜品
export function editSupper(data) {
  return request({
    url: '/admin/supper/update',
    method: 'post',
    data
  })
}
// 菜品上下架
export function upDownSupper(data) {
  return request({
    url: '/admin/supper/standUpAndDown',
    method: 'post',
    data
  })
}

// 自助餐券列表
export function listCoupon(query) {
  return request({
    url: '/admin/buffetcoupon/list',
    method: 'get',
    params: query
  })
}
// 删除自助餐券
export function delCoupon(data) {
  return request({
    url: '/admin/buffetcoupon/delete',
    method: 'post',
    data
  })
}
// 添加自助餐券
export function addCoupon(data) {
  return request({
    url: '/admin/buffetcoupon/create',
    method: 'post',
    data
  })
}
// 自助餐券详情
export function detCoupon(id) {
  return request({
    url: '/admin/buffetcoupon/read',
    method: 'get',
    params: { id }
  })
}
// 编辑自助餐券
export function editCoupon(data) {
  return request({
    url: '/admin/buffetcoupon/update',
    method: 'post',
    data
  })
}
// 自助餐券上下架
export function upDownCoupon(data) {
  return request({
    url: '/admin/buffetcoupon/standUpAndDown',
    method: 'post',
    data
  })
}
