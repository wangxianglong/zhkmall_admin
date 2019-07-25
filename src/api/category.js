import request from '@/utils/request'

// 商品类目列表
export function listCategory(query) {
  return request({
    url: '/productCategory/list',
    method: 'get',
    params: query
  })
}
// 一级类目选项
export function listCatL1() {
  return request({
    url: '/productCategory/list/withChildren',
    method: 'get'
  })
}
// 添加商品类目
export function createCategory(data) {
  return request({
    url: '/productCategory/create',
    method: 'post',
    data
  })
}
// 商品类目详情
export function readCategory(id) {
  return request({
    url: `/productCategory/${id}`,
    method: 'get'
  })
}
// 编辑商品类目
export function updateCategory(id, data) {
  return request({
    url: `/productCategory/update/${id}`,
    method: 'post',
    data
  })
}
// 修改导航栏显示状态
export function isShowNav(data) {
  return request({
    url: `/productCategory/update/navStatus`,
    method: 'post',
    data
  })
}
// 修改显示状态
export function isShow(data) {
  return request({
    url: `/productCategory/update/showStatus`,
    method: 'post',
    data
  })
}
// 删除商品类目
export function deleteCategory(id) {
  return request({
    url: `/productCategory/delete/${id}`,
    method: 'post'
  })
}
