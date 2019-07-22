import request from '@/utils/request'

// 商城订单列表
export function listMall(query) {
  return request({
    url: '/admin/myorder/list',
    method: 'get',
    params: query
  })
}
// 商城订单发货
export function shipMall(data) {
  return request({
    url: '/admin/myorder/ship',
    method: 'post',
    data
  })
}
// 商城订单确认送达
export function deliveryMall(data) {
  return request({
    url: '/admin/myorder/delivery',
    method: 'post',
    data
  })
}
// 商城订单详情
export function detMall(data) {
  return request({
    url: '/admin/myorder/read',
    method: 'get',
    params: data
  })
}

// 外卖订单列表
export function listTicket(query) {
  return request({
    url: '/admin/mytakeoutorder/list',
    method: 'get',
    params: query
  })
}
// 外卖发货 (配送员)
export function shipTicket(data) {
  return request({
    url: '/admin/mytakeoutorder/ship',
    method: 'post',
    data
  })
}
// 外卖订单确认送达
export function deliveryTicket(data) {
  return request({
    url: '/admin/mytakeoutorder/delivery',
    method: 'post',
    data
  })
}
// 外卖订单详情
export function detTicket(data) {
  return request({
    url: '/admin/mytakeoutorder/read',
    method: 'get',
    params: data
  })
}

// 券订单列表
export function listDelivery(query) {
  return request({
    url: '/admin/mybuffetcouponorder/list',
    method: 'get',
    params: query
  })
}
// 券订单详情
export function detDelivery(id) {
  return request({
    url: '/admin/mybuffetcouponorder/read',
    method: 'get',
    params: { id }
  })
}
