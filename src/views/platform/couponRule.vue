<template>
  <div class="app-container">
    <el-form
      v-loading="listLoading"
      ref="dataForm"
      :model="dataForm"
      element-loading-text="正在查询中。。。"
      status-icon
      label-position="left"
      label-width="150px"
      style="width: 400px; margin-left:50px;"
    >
      <el-form-item label="敬老券领取年龄" prop="oldCouponGetAge">
        <el-input-number v-model="dataForm.oldCouponGetAge" :min="0"/>
      </el-form-item>
      <el-form-item label="每周领取次数" prop="oldCouponGetNum">
        <el-input-number v-model="dataForm.oldCouponGetNum" :min="0"/>
      </el-form-item>
      <div class="dialog-footer" style="float: right;">
        <el-button v-permission="['POST /admin/buffetcoupon/rule/create']" type="primary" @click="updateData">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { couponSet, couponDet } from '@/api/platform'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'CouponRule',
  data() {
    return {
      listLoading: true,
      dataForm: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      couponDet().then(response => {
        this.dataForm = response.data.data
        this.listLoading = false
      })
    },
    updateData() {
      couponSet(this.dataForm).then(res => {
        this.$notify({
          title: '成功',
          message: '设置成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>
