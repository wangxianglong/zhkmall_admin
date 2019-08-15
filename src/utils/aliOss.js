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
    const pro = new Promise((resolve) => {
      axios.get(uploadPath).then(res => {
        resolve(res.data.data)
      })
    })

    var file = option.file
    return new Promise((resolve) => {
      pro.then(res => {
        var ossData = new FormData()
        const key = res.dir + file.name
        ossData.append('key', key)
        ossData.append('policy', res.policy)
        ossData.append('OSSAccessKeyId', res.accessKeyId)
        ossData.append('success_action_status', 200)
        ossData.append('signature', res.signature)
        ossData.append('file', file, file.name)
        axios.post(res.host, ossData).then(() => {
          resolve({
            fileName: file.name,
            fileUrl: res.host + '/' + key
          })
        })
      })
    })
  }
}
