import request from '@/utils/request'

export function dashboard() {
  return request({
    url: '/admin/dashboard/index',
    method: 'get'
  })
}
