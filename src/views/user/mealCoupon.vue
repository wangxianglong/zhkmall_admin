<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.userId"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户ID"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-view" @click="showVisible">核销</el-button>
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
      <el-table-column align="center" width="100px" label="券ID" prop="couponId" sortable/>
      <el-table-column align="center" width="100px" label="用户ID" prop="userId" sortable/>
      <el-table-column align="center" width="100px" label="订单ID" prop="orderId" sortable/>
      <el-table-column align="center" min-width="100px" label="兑换码" prop="code"/>
      <el-table-column align="center" min-width="100px" label="有效期开始时间" prop="startTime"/>
      <el-table-column align="center" min-width="100px" label="有效期截至时间" prop="endTime"/>
      <el-table-column align="center" label="餐券类型">
        <template slot-scope="scope">
          <el-tag>{{ couponDic[scope.row.couponType] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-tag :type="statusType[scope.row.status]">{{ statusDic[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="100px" label="使用时间" prop="usedTime"/>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :visible.sync="dialogFormVisible" title="核销">
      <el-form ref="dataForm" :model="dataForm" status-icon style="margin: 0 50px;">
        <el-form-item label prop="name">
          <el-input v-model="dataForm.code" placeholder="请输入兑换码" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="seareachConsume"/>
          </el-input>
        </el-form-item>
        <el-form-item v-if="showCoupon">
          <el-row>
            <el-col :span="12">
              <span>用户名：</span>
              <span>{{ dataForm.name }}</span>
            </el-col>
            <el-col :span="12">
              <span>年龄：</span>
              <span>{{ dataForm.age }}</span>
            </el-col>
            <el-col :span="12">
              <span>实名认证状态：</span>
              <span>{{ dataForm.authStatus }}</span>
            </el-col>
            <el-col :span="12">
              <span>订单ID：</span>
              <span>{{ dataForm.orderId }}</span>
            </el-col>
            <el-col :span="12">
              <span>兑换码：</span>
              <span>{{ dataForm.code }}</span>
            </el-col>
            <el-col :span="12">
              <span>有效开始时间：</span>
              <span>{{ dataForm.startTime }}</span>
            </el-col>
            <el-col :span="12">
              <span>有效截止时间：</span>
              <span>{{ dataForm.endTime }}</span>
            </el-col>
            <el-col :span="12">
              <span>餐券类型：</span>
              <el-tag>{{ couponDic[dataForm.couponType] }}</el-tag>
            </el-col>
            <el-col :span="12">
              <span>状态：</span>
              <el-tag :type="statusType[dataForm.status]">{{ statusDic[dataForm.status] }}</el-tag>
            </el-col>
            <el-col :span="12">
              <span>使用时间：</span>
              <span>{{ dataForm.usedTime }}</span>
            </el-col>
          </el-row>
          <div class="dialog-footer" style="margin-top: 30px;text-align: right;">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="handleChargeOff">确定</el-button>
          </div>
        </el-form-item>
        <el-form-item v-else>
          <div class="el-table__empty-block">
            <span class="el-table__empty-text">查无此券，请核对券码！</span>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mealCoupon, readByCode, mealConsume } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'FootPrint',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined
      },
      dataForm: {
        code: ''
      },
      showCoupon: false,
      statusDic: ['未使用', '已使用', '已过期'],
      couponDic: ['自助餐券', '敬老券'],
      statusType: ['success', '', 'danger'],
      dialogFormVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      mealCoupon(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    showVisible() {
      this.dialogFormVisible = true
      this.showCoupon = false
      this.dataForm.code = ''
    },
    seareachConsume() {
      if (this.dataForm.code) {
        readByCode({ code: this.dataForm.code }).then(res => {
          var data = Object.assign(this.dataForm, res.data.data)
          this.dataForm = data
          if (this.dataForm.userId) {
            this.showCoupon = true
          }
        })
      } else {
        this.$message({
          type: 'warning',
          message: '请输入兑换码!'
        })
      }
    },
    handleChargeOff() {
      this.$confirm('是否使用该优惠券 ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        mealConsume({ id: this.dataForm.id }).then(res => {
          for (const v of this.list) {
            if (v.id === this.dataForm.id) {
              const index = this.list.indexOf(v)
              this.list[index].status = 1
              break
            }
          }
          this.$message({
            type: 'success',
            message: '核销成功!'
          })
          this.dialogFormVisible = false
        })
      })
    }
  }
}
</script>
