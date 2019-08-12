<template>
  <el-card class="form-container" shadow="never">
    <el-form ref="dataForm" :model="dataForm" :rules="rules" label-width="150px">
      <el-form-item label="公司：">
        <span v-if="company">{{ company }}</span>
        <span v-else>暂无</span>
      </el-form-item>
      <el-form-item label="旧密码：" prop="password">
        <el-input v-model="dataForm.password" show-password placeholder="请输入旧密码" />
      </el-form-item>
      <el-form-item label="新密码：" prop="new_password">
        <el-input v-model="dataForm.new_password" show-password placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认新密码：" prop="confirm_password">
        <el-input v-model="dataForm.confirm_password" show-password placeholder="请确认新密码" />
      </el-form-item>
      <el-form-item style="text-align: center;">
        <el-button type="primary" size="small" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { updPassword } from '@/api/user'

export default {
  name: 'ChangePassword',
  data() {
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.dataForm.new_password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      dataForm: {
        password: '',
        new_password: '',
        confirm_password: ''
      },
      rules: {
        password: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { pattern: /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){6,20}$/, message: '密码长度为 6 - 20位' }
        ],
        new_password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { pattern: /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){6,20}$/, message: '密码长度为 6 - 20位' }
        ],
        confirm_password: [
          { required: true, validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['company'])
  },
  created() { },
  methods: {
    handleSubmit() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const params = new URLSearchParams()
          params.append('password', this.dataForm.password)
          params.append('new_password', this.dataForm.new_password)
          params.append('confirm_password', this.dataForm.confirm_password)
          updPassword(params).then(res => {
            this.dataForm = {
              password: '',
              new_password: '',
              confirm_password: ''
            }
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
