import request from '@/utils/request'

// 商城订单列表
export function listMall(query) {
  return request({
    url: '/admin/order/list',
    method: 'get',
    params: query
  })
}
// 指派商城 (配送员)
export function designateMall(data) {
  return request({
    url: '/admin/order/designate',
    method: 'post',
    data
  })
}
// 修改商城订单状态
export function statusMall(data) {
  return request({
    url: '/admin/order/status',
    method: 'post',
    data
  })
}
// 修改商城订单备注
export function remarkMall(data) {
  return request({
    url: '/admin/order/remark',
    method: 'post',
    data
  })
}
// 商城订单详情
export function detMall(id) {
  return request({
    url: '/admin/order/read',
    method: 'get',
    params: { id }
  })
}

// 外卖订单列表
export function listTicket(query) {
  return request({
    url: '/admin/takeoutorder/list',
    method: 'get',
    params: query
  })
}
// 指派外卖 (配送员)
export function designateTicket(data) {
  return request({
    url: '/admin/takeoutorder/designate',
    method: 'post',
    data
  })
}
// 修改外卖订单状态
export function statusTicket(data) {
  return request({
    url: '/admin/takeoutorder/status',
    method: 'post',
    data
  })
}
// 修改外卖订单备注
export function remarkTicket(data) {
  return request({
    url: '/admin/takeoutorder/remark',
    method: 'post',
    data
  })
}
// 外卖订单详情
export function detTicket(id) {
  return request({
    url: '/admin/takeoutorder/read',
    method: 'get',
    params: { id }
  })
}

// 券订单列表
export function listDelivery(query) {
  return request({
    url: '/admin/buffetcouponorder/list',
    method: 'get',
    params: query
  })
}
// 修改券订单状态
export function statusDelivery(data) {
  return request({
    url: '/admin/buffetcouponorder/status',
    method: 'post',
    data
  })
}
// 券订单详情
export function detDelivery(id) {
  return request({
    url: '/admin/buffetcouponorder/read',
    method: 'get',
    params: { id }
  })
}

// 流水统计列表
export function listFlow(query) {
  return request({
    url: '/admin/serial/list',
    method: 'get',
    params: query
  })
}
// 流水统计备注
export function remarkFlow(data) {
  return request({
    url: '/admin/serial/remark',
    method: 'post',
    data: data
  })
}
