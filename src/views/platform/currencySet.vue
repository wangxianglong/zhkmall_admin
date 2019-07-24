<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <!-- <el-card class="box-card" shadow="hover" style="margin-bottom: 5px;">
      </el-card>-->
      <el-button
        v-permission="['POST /admin/link/create']"
        type="primary"
        size="small"
        @click="updateData"
      >保存配置</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table
      ref="relatedData"
      :data="list"
      tooltip-effect="dark"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column label="链接名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.keyName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="链接地址" align="center">
        <template slot-scope="scope">
          <el-input v-model="scope.row.keyValue" placeholder="请输入链接地址" @blur="linkToVerify"/>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { addLink, detLink } from '@/api/platform'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'ShippingSet',
  data() {
    return {
      list: null,
      keyNames: {},
      listLoading: true,
      isVerify: true,
      deliveryType: 1,
      amountLabel: '',
      relatedNum: 1,
      selectlistRow: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      detLink().then(res => {
        this.keyNames = Object.assign({}, res.data.data)
        this.list = Object.keys(this.keyNames).map((key, value) => {
          var name = ''
          switch (key) {
            case 'brief':
              name = '企业简介'
              break
            case 'help':
              name = '帮助手册'
              break
            case 'idea':
              name = '经营理念'
              break
            case 'official':
              name = '企业官网'
              break
            case 'video':
              name = '企业视频'
              break
            default:
              name = '未知'
          }
          return {
            keyValue: this.keyNames[key],
            keyName: name
          }
        })
        this.listLoading = false
      })
    },
    linkToVerify(event) {
      var value = event.srcElement.value.replace(/(^\s*)|(\s*$)/g, '')
      if (!value) {
        this.isVerify = false
        this.$message({
          message: '链接地址不能为空',
          type: 'warning'
        })
      } else {
        var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
        if (!reg.test(value)) {
          this.isVerify = false
          this.$message({
            message: '请输入正确链接地址！',
            type: 'warning'
          })
        } else {
          this.isVerify = true
        }
      }
    },
    updateData() {
      if (this.isVerify) {
        var params = {}
        for (var i in this.list) {
          var name = ''
          switch (this.list[i].keyName) {
            case '企业简介':
              name = 'brief'
              break
            case '帮助手册':
              name = 'help'
              break
            case '经营理念':
              name = 'idea'
              break
            case '企业官网':
              name = 'official'
              break
            case '企业视频':
              name = 'video'
              break
            default:
              name = '未知'
          }
          params[name] = this.list[i].keyValue
        }
        addLink(params).then(res => {
          this.settingDialogVisible = false
          this.$notify({
            title: '成功',
            message: '设置成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        this.$message({
          message: '请输入正确链接地址！',
          type: 'warning'
        })
      }
    }
  }
}
</script>
