<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入姓名"
      />
      <el-input
        v-model="listQuery.idCard"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入身份证号码"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <!-- <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>-->
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      size="small"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" width="100px" label="ID" prop="id" sortable/>
      <el-table-column align="center" label="真实姓名" prop="name"/>
      <el-table-column align="center" label="年龄" prop="age"/>
      <el-table-column align="center" label="身份证号码" prop="idCard"/>
      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag :type="statusType[scope.row.status]">{{ statusDic[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" prop="remark"/>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="showDetail(scope.row)">详情</el-button>
          <el-button
            v-permission="['POST /admin/realname/audit']"
            type="primary"
            size="mini"
            @click="showAudit(scope.row)"
          >审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogFormDetail" title="详情">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="margin:0 50px;"
      >
        <el-form-item label="真实姓名">
          <span>{{ temp.name }}</span>
        </el-form-item>
        <el-form-item label="手机号码">
          <span>{{ temp.mobile }}</span>
        </el-form-item>
        <el-form-item label="年龄">
          <span>{{ temp.age }}</span>
        </el-form-item>
        <el-form-item label="身份证号码">
          <span>{{ temp.mobile }}</span>
        </el-form-item>
        <el-form-item label="身份证正面">
          <img :src="temp.photoFront" alt="身份证正面" style="border-radius: 5px;">
        </el-form-item>
        <el-form-item label="身份证反面">
          <img :src="temp.photoReverse" alt="身份证反面" style="border-radius: 5px;">
        </el-form-item>
        <el-form-item label="身份证手持照">
          <img :src="temp.photoHand" alt="身份证手持照" style="border-radius: 5px;">
        </el-form-item>
        <el-form-item label="推荐员工号">
          <span>{{ temp.referralCode }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ temp.addTime }}</span>
        </el-form-item>
        <el-form-item label="备注">
          <span>{{ temp.remark }}</span>
        </el-form-item>
        <el-form-item label="状态">
          <span>{{ temp.status }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormDetail = false">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogFormVisible" title="实名审核">
      <el-form
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="temp.remark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" placeholder="请选择">
            <el-option
              v-for="item in statusArr"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAudit">确认审核</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { realList, realAudit, realDetail } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'Collect',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        idCard: undefined,
        name: undefined
      },
      statusDic: ['审核中', '审核通过', '拒绝'],
      statusArr: [{
        value: 0,
        label: '审核中'
      }, {
        value: 1,
        label: '审核通过'
      }, {
        value: 2,
        label: '拒绝'
      }],
      statusType: ['', 'success', 'danger'],
      temp: {
        id: undefined,
        remark: '',
        status: 0
      },
      dialogFormVisible: false,
      dialogFormDetail: false,
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      realList(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        userId: '',
        valueId: '',
        addTime: undefined
      }
    },
    showAudit(row) {
      this.temp = {
        id: row.id,
        remark: row.remark,
        status: row.status
      }
      this.dialogFormVisible = true
    },
    showDetail(row) {
      this.dialogFormDetail = true
      realDetail({ id: row.id }).then(res => {
        this.temp = res.data.data
      })
    },
    handleAudit() {
      if (!this.temp.remark) {
        delete this.temp.remark
      }
      realAudit(this.temp).then(res => {
        this.dialogFormVisible = false
        this.list.forEach((item, index) => {
          if (item.id === this.temp.id) {
            item.remark = this.temp.remark
            item.status = this.temp.status
          }
        })
        this.$notify({
          message: res.data.errmsg,
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户ID', '商品ID', '添加时间']
        const filterVal = ['userId', 'valueId', 'addTime']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户收藏信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
