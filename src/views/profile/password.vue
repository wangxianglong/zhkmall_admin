<template>
  <div class="app-container">
    <el-form
      ref="dataForm"
      status-icon
      label-position="left"
      label-width="100px"
      style="width: 400px; margin-left:50px;"
    >
      <el-form-item label="头像">
        <img v-if="avatar" :src="avatar" class="user-avatar">
        <img
          v-else
          class="user-avatar"
          src="http://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80"
        >
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="name"/>
      </el-form-item>
      <el-form-item label="推荐码">
        <canvas id="canvas"/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vue from 'vue'
import QRCode from 'qrcode'
Vue.use(QRCode)

export default {
  name: 'ChangePassword',
  data() {
    return {
      dataForm: {
        qrcode: '',
        codes: '',
        newPassword: '',
        newPassword2: ''
      }
    }
  },
  computed: {
    ...mapGetters(['name', 'avatar', 'code'])
  },
  created() {
    this.$nextTick(function() {
      this.useqrcode()
    })
  },
  methods: {
    useqrcode() {
      var canvas = document.getElementById('canvas')
      QRCode.toCanvas(canvas, `http://www.baidu.com?referralCode=${this.code}`, function(error) {
        if (error) console.error(error)
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
#canvas {
  width: 200px !important;
  height: 200px !important;
}
</style>
