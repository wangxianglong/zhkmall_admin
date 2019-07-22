import request from '@/utils/request'

// 配送列表
// export function listShip(query) {
//   return request({
//     url: '/admin/distribution/list',
//     method: 'get',
//     params: query
//   })
// }
// 添加配送
export function addShip(data) {
  return request({
    url: '/admin/distribution/create',
    method: 'post',
    data
  })
}
// 配送设置详情
export function detShip(data) {
  return request({
    url: '/admin/distribution/read',
    method: 'get',
    params: data
  })
}

// 介绍设置
export function setIntroduce(data) {
  return request({
    url: '/admin/introduce/create',
    method: 'post',
    data
  })
}
// 介绍详情
export function detIntroduce(id) {
  return request({
    url: '/admin/introduce/read',
    method: 'get',
    params: { id }
  })
}

// 轮播图列表
export function listSlide(query) {
  return request({
    url: '/admin/ad/list',
    method: 'get',
    params: query
  })
}
// 删除轮播图
export function delSlide(data) {
  return request({
    url: '/admin/ad/delete',
    method: 'post',
    data
  })
}
// 添加轮播图
export function addSlide(data) {
  return request({
    url: '/admin/ad/create',
    method: 'post',
    data
  })
}
// 轮播图详情
export function detSlide(id) {
  return request({
    url: '/admin/ad/read',
    method: 'get',
    params: { id }
  })
}
// 编辑轮播图
export function editSlide(data) {
  return request({
    url: '/admin/ad/update',
    method: 'post',
    data
  })
}
// 启用/禁用轮播图
export function statusSlide(data) {
  return request({
    url: '/admin/ad/status',
    method: 'post',
    data
  })
}

// 链接设置
export function addLink(data) {
  return request({
    url: '/admin/link/create',
    method: 'post',
    data
  })
}
// 链接设置详情
export function detLink(data) {
  return request({
    url: '/admin/link/read',
    method: 'get',
    params: data
  })
}

// 餐券规则设置
export function couponSet(data) {
  return request({
    url: '/admin/buffetcoupon/rule/create',
    method: 'post',
    data
  })
}
// 餐券规则详情
export function couponDet() {
  return request({
    url: '/admin/buffetcoupon/rule/read',
    method: 'get'
  })
}

// 门店列表
export function listStore(query) {
  return request({
    url: '/admin/store/list',
    method: 'get',
    params: query
  })
}
// 删除门店
export function delStore(data) {
  return request({
    url: '/admin/store/delete',
    method: 'post',
    data
  })
}
// 添加门店
export function addStore(data) {
  return request({
    url: '/admin/store/create',
    method: 'post',
    data
  })
}
// 门店详情
export function detStore(id) {
  return request({
    url: '/admin/store/read',
    method: 'get',
    params: { id }
  })
}
// 编辑门店
export function editStore(data) {
  return request({
    url: '/admin/store/update',
    method: 'post',
    data
  })
}
// 门店餐厅配送
export function storeToDining(data) {
  return request({
    url: '/admin/store/isdining',
    method: 'post',
    data
  })
}
// 门店商城配送
export function storeToMall(data) {
  return request({
    url: '/admin/store/ismall',
    method: 'post',
    data
  })
}

// 地址搜索
export function mapSearch(data) {
  return request({
    url: '/common/map/search',
    method: 'get',
    params: data
  })
}
// 编辑门店
export function mapDistance(data) {
  return request({
    url: '/common/map/distance',
    method: 'get',
    params: data
  })
}
