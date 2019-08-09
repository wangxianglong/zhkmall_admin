<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="profile" :rules="rules" ref="dataForm" label-width="150px">
      <el-form-item label="头像：">
        <el-upload
          :http-request="fnUploadpicUrl"
          :show-file-list="true"
          :file-list="picUrl"
          :on-remove="handleRemovePic"
          :on-exceed="beyondFile"
          :limit="1"
          :before-upload="beforeAvatarUpload"
          list-type="picture-card"
          action
        >
          <i class="el-icon-plus" />
        </el-upload>
      </el-form-item>
      <el-form-item label="公司：" prop="company">
        <el-input v-model="profile.company" placeholder="请输入公司" />
      </el-form-item>
      <el-form-item label="用户名：" prop="username">
        <el-input v-model="profile.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="昵称：" prop="nickName">
        <el-input v-model="profile.nickName" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="性别：" prop="gender">
        <el-select v-model="profile.gender" class="filter-item" placeholder="请选择">
          <el-option
            v-for="(item, key) in genderMap"
            :key="key"
            :label="item"
            :value="Number(key)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="电话：" prop="phone">
        <el-input type="number" v-model="profile.phone" placeholder="请输入电话" />
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input v-model="profile.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="所在地址：" prop="address">
        <el-input v-model="profile.address" placeholder="请输入所在地址" />
      </el-form-item>
      <el-form-item label="备注：" prop="note">
        <el-input v-model="profile.note" :rows="2" type="textarea" placeholder="请输入备注信息" />
      </el-form-item>
      <el-form-item style="text-align: center;">
        <el-button type="primary" size="small" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { getUser, fetchEdit } from '@/api/user'
import { mapGetters } from 'vuex'
import oss from '@/utils/aliOss'

export default {
  name: 'UserCenter',
  data() {
    var checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机号不能为空'));
      } else {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error('请输入正确的手机号'));
        }
      }
    }
    return {
      genderMap: { 0: '未知', 1: '男', 3: '女' },
      picUrl: [],
      profile: {
        address: '',
        company: '',
        email: '',
        phone: '',
        gender: 0,
        icon: '',
        nickName: '',
        note: '',
        username: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        company: [{ required: true, company: '请输入公司名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入所在地址', trigger: 'blur' }],
        note: [{ required: true, message: '请输入备注信息', trigger: 'blur' }],
        nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        phone: [{ validator: checkPhone, trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['userid'])
  },
  created() {
    this.getUserProfile()
  },
  methods: {
    getUserProfile() {
      getUser(this.userid).then(res => {
        let data = res.data[0]
        this.profile = data
        this.picUrl.push({ url: data.icon })
      })
    },
    async fnUploadpicUrl(option) {
      oss.ossUploadFile(option).then(res => {
        this.picUrl = [{ url: res.fileUrl }]
      })
    },
    beforeAvatarUpload(file) {
      let isIMAGE = false
      if (
        file.type === 'image/jpeg' ||
        file.type === 'image/gif' ||
        file.type === 'image/png'
      ) {
        isIMAGE = true
      }
      if (!isIMAGE) {
        this.$message.error('上传文件只能是图片格式!')
      }
      return isIMAGE
    },
    handleRemovePic(file, fileList) {
      this.picUrl = []
    },
    // 添加多个文件事件
    beyondFile(files, fileList) {
      this.$message({
        message: '最多上传' + fileList.length + '张图片',
        type: 'error'
      })
    },
    handleSubmit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.profile.icon = this.picUrl[0] ? this.picUrl[0].url : ''
          fetchEdit(this.userid, this.profile).then(res => {
            this.$notify.success({
              title: '成功',
              message: '修改成功',
              duration: 1500
            })
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
