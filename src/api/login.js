import request from '@/utils/request'

export function loginByUsername(username, password) {
  return request({
    url: '/admin/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getUserInfo(params) {
  return request({
    url: '/admin/info',
    method: 'get',
    params: params
  })
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}
