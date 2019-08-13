import request from '@/utils/request'
// 获取商品属性分类列表
export function attrCategoryList(params) {
  return request({
    url: '/productAttribute/category/list',
    method: 'get',
    params: params
  })
}

export function createProductAttrCate(data) {
  return request({
    url: '/productAttribute/category/create',
    method: 'post',
    data: data
  })
}

export function deleteProductAttrCate(id) {
  return request({
    url: '/productAttribute/category/delete/' + id,
    method: 'get'
  })
}

export function updateProductAttrCate(id, data) {
  return request({
    url: '/productAttribute/category/update/' + id,
    method: 'post',
    data: data
  })
}
export function fetchListWithAttr() {
  return request({
    url: '/productAttribute/category/list/withAttr',
    method: 'get'
  })
}
