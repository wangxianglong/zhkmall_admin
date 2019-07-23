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
export function fetchEdit(query) {
  return request({
    url: '/admin/update',
    method: 'post',
    data: query
  })
}

// 删除用户
export function fetchDel(query) {
  return request({
    url: '/admin/delete',
    method: 'post',
    data: query
  })
}

// 实名认证列表
export function realList(query) {
  return request({
    url: '/admin/realname/list',
    method: 'get',
    params: query
  })
}

// 实名认证详情
export function realDetail(query) {
  return request({
    url: '/admin/realname/read',
    method: 'get',
    params: query
  })
}

// 实名认证审核
export function realAudit(data) {
  return request({
    url: '/admin/realname/audit',
    method: 'post',
    data: data
  })
}

// 推荐会员列表
export function recommendList(query) {
  return request({
    url: '/admin/userrecommend/list',
    method: 'get',
    params: query
  })
}

// 收获地址列表
export function listAddress(query) {
  return request({
    url: '/admin/address/list',
    method: 'get',
    params: query
  })
}

// 用户餐券列表
export function mealCoupon(query) {
  return request({
    url: '/admin/buffetcouponuser/list',
    method: 'get',
    params: query
  })
}

// 用户餐券详情
export function mealDetail(query) {
  return request({
    url: '/admin/buffetcouponuser/read',
    method: 'get',
    params: query
  })
}

// 用户餐券查找
export function readByCode(query) {
  return request({
    url: '/admin/buffetcouponuser/readByCode',
    method: 'get',
    params: query
  })
}

// 用户餐券核销
export function mealConsume(query) {
  return request({
    url: '/admin/buffetcouponuser/consume',
    method: 'post',
    data: query
  })
}

// export function listCollect(query) {
//   return request({
//     url: '/collect/list',
//     method: 'get',
//     params: query
//   })
// }

// export function listFeedback(query) {
//   return request({
//     url: '/feedback/list',
//     method: 'get',
//     params: query
//   })
// }

// export function listFootprint(query) {
//   return request({
//     url: '/footprint/list',
//     method: 'get',
//     params: query
//   })
// }

// export function listHistory(query) {
//   return request({
//     url: '/history/list',
//     method: 'get',
//     params: query
//   })
// }

