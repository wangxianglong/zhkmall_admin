import axios from 'axios'
import { uploadPath } from '@/api/storage'
// import { Message } from 'element-ui'

export default {
  /**
   * 文件上传
   * @param option 参考csdn: https://blog.csdn.net/qq_27626333/article/details/81463139
   */
  ossUploadFile(option) {
    // 先要获取后端签名
    const pro = new Promise((resolve, rej) => {
      axios.get(uploadPath).then(res => {
        resolve(res.data.data)
      })
    })

    var file = option.file
    return new Promise((resolve, reject) => {
      pro.then(success => {
        var data = success
        var ossData = new FormData()
        var dir = data.dir
        ossData.append('key', data.dir + file.name)
        ossData.append('policy', data.policy)
        ossData.append('OSSAccessKeyId', data.accessKeyId)
        ossData.append('success_action_status', 200)
        ossData.append('signature', data.signature)
        ossData.append('file', file, file.name)
        axios
          .post('http://cwx-mall.oss-cn-hangzhou.aliyuncs.com/', ossData)
          .then(res => {
            resolve({
              fileName: file.name,
              fileUrl: res.config.url + dir + file.name
            })
          })
      })
    })
  }
}
