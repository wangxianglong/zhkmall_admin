import request from '@/utils/request'
// 获取商品属性列表
export function prodAttrList(params) {
  return request({
    url: '/productAttribute/value/list',
    method: 'get',
    params: params
  })
}

// 获取商品属性列表
export function cidToProdAttrList(cid, params) {
  return request({
    url: `/productAttribute/list/${cid}`,
    method: 'get',
    params: params
  })
}

export function deleteProductAttr(data) {
  return request({
    url: '/productAttribute/delete',
    method: 'post',
    data: data
  })
}

export function createProductAttr(data) {
  return request({
    url: '/productAttribute/create',
    method: 'post',
    data: data
  })
}

export function updateProductAttr(id, data) {
  return request({
    url: '/productAttribute/update/' + id,
    method: 'post',
    data: data
  })
}
export function getProductAttr(id) {
  return request({
    url: '/productAttribute/' + id,
    method: 'get'
  })
}

export function getProductAttrInfo(productCategoryId) {
  return request({
    url: '/productAttribute/attrInfo/' + productCategoryId,
    method: 'get'
  })
}
