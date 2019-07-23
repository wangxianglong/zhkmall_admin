import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  })
}

export function getUserInfo(name) {
  return request({
    url: '/admin/info',
    method: 'get',
    params: name
  })
}

