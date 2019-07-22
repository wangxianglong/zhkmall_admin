<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.userId"
        type="number"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户ID"
      />
      <el-input
        v-model="listQuery.orderSn"
        type="number"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入订单编号"
      />
      <el-select
        v-model="orderStatusArray"
        multiple
        style="width: 400px"
        class="filter-item"
        placeholder="请选择订单状态"
      >
        <el-option v-for="(key, value) in statusMap" :key="key" :label="key" :value="value"/>
      </el-select>
      <el-button
        v-permission="['GET /admin/takeoutorder/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <!-- <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button> -->
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
      <el-table-column align="center" width="65" label="ID" prop="id"/>
      <el-table-column align="center" label="订单编号" prop="orderSn"/>
      <el-table-column align="center" width="80" label="用户ID" prop="userId"/>
      <el-table-column align="center" label="付款编号" prop="payId"/>
      <el-table-column align="center" label="发货编号" prop="shipSn"/>
      <el-table-column align="center" label="收货人名称" prop="consignee"/>
      <el-table-column align="center" label="收货人手机号" prop="mobile"/>
      <el-table-column align="center" min-width="150" label="收货人地址" prop="address"/>
      <el-table-column align="center" width="120" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['GET /admin/takeoutorder/read']"
            type="success"
            size="mini"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            v-permission="['POST /admin/takeoutorder/status']"
            type="primary"
            size="small"
            @click="handleStatus(scope.row)"
          >修改状态</el-button>
          <!-- <el-button v-permission="['POST /admin/order/ship']" v-if="scope.row.orderStatus==201" type="primary" size="mini" @click="handleShip(scope.row)">发货</el-button>
          <el-button v-permission="['POST /admin/order/refund']" v-if="scope.row.orderStatus==202" type="primary" size="mini" @click="handleRefund(scope.row)">退款</el-button>-->
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

    <!-- 订单详情对话框 -->
    <el-dialog :visible.sync="orderDialogVisible" title="订单详情">
      <el-form
        :model="orderDetail"
        label-position="left"
        label-width="70px"
        style="margin: 0 50px;"
      >
        <el-form-item label="订单信息">
          <el-table :data="orderInfo" size="small" border fit highlight-current-row>
            <el-table-column align="center" label="订单编号" prop="orderSn"/>
            <el-table-column align="center" label="订单费用" prop="orderPrice"/>
            <el-table-column align="center" label="付款编号" prop="payId"/>
            <el-table-column align="center" label="付款时间" prop="payTime"/>
            <el-table-column align="center" label="订单状态">
              <template slot-scope="scope">
                <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="费用信息">
          <el-table :data="orderInfo" size="small" border fit highlight-current-row>
            <el-table-column align="center" label="外卖总费用" prop="supperPrice"/>
            <el-table-column align="center" label="配送费用" prop="freightPrice"/>
          </el-table>
        </el-form-item>
        <el-form-item label="收货信息">
          <el-table :data="orderInfo" size="small" border fit highlight-current-row>
            <el-table-column align="center" width="100" label="收货人" prop="consignee"/>
            <el-table-column align="center" width="120" label="手机号" prop="mobile"/>
            <el-table-column align="center" label="地址" prop="address"/>
          </el-table>
        </el-form-item>
        <el-form-item label="发货备注">
          <el-input
            v-model="orderDetail.shipRemark"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRemark">保存</el-button>
      </div>
    </el-dialog>

    <!-- 修改状态对话框 -->
    <el-dialog :visible.sync="statusDialogVisible" title="修改状态">
      <el-form
        ref="statusForm"
        :model="statusForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="订单状态">
          <el-select v-model="statusForm.orderStatus" class="filter-item" placeholder="请选择订单状态">
            <el-option v-for="(key, value) in statusMap" :key="key" :label="key" :value="value"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changeStatus">确定</el-button>
      </div>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog :visible.sync="shipDialogVisible" title="发货">
      <el-form
        ref="shipForm"
        :model="shipForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="快递公司" prop="shipChannel">
          <el-input v-model="shipForm.shipChannel"/>
        </el-form-item>
        <el-form-item label="快递编号" prop="shipSn">
          <el-input v-model="shipForm.shipSn"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip">确定</el-button>
      </div>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog :visible.sync="refundDialogVisible" title="退款">
      <el-form
        ref="refundForm"
        :model="refundForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="退款金额" prop="refundMoney">
          <el-input v-model="refundForm.refundMoney" :disabled="true"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRefund">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style>
</style>

<script>
import { listTicket, statusTicket, remarkTicket, detTicket } from '@/api/business'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数
import { statusMap } from '@/utils/index'

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status]
    }
  },
  data() {
    return {
      statusMap,
      list: undefined,
      total: 0,
      listLoading: true,
      orderStatusArray: [],
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        orderSn: undefined,
        orderStatusArray: [],
        sort: 'add_time',
        order: 'desc'
      },
      orderDialogVisible: false,
      orderInfo: [],
      orderDetail: {
        order: {},
        user: {},
        orderGoods: []
      },
      shipForm: {
        orderId: undefined,
        shipChannel: undefined,
        shipSn: undefined
      },
      shipDialogVisible: false,
      statusDialogVisible: false,
      statusForm: {
        id: undefined,
        orderStatus: undefined
      },
      refundForm: {
        orderId: undefined,
        refundMoney: undefined
      },
      refundDialogVisible: false,
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
      listTicket(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.orderStatusArray = this.orderStatusArray + ''
      this.getList()
    },
    handleDetail(row) {
      detTicket(row.id).then(res => {
        this.orderDetail = Object.assign({}, res.data.data)
        var order = []
        order.push(this.orderDetail)
        this.orderInfo = order
        this.orderDialogVisible = true
      })
    },
    handleRemark() {
      var params = {
        id: this.orderDetail.id,
        shipRemark: this.orderDetail.shipRemark
      }
      remarkTicket(params).then(res => {
        this.orderDialogVisible = false
        for (const v of this.list) {
          if (v.id === this.orderDetail.id) {
            const index = this.list.indexOf(v)
            this.list[index].shipRemark = this.orderDetail.shipRemark
            break
          }
        }
        this.$message({
          type: 'success',
          message: '修改成功!'
        })
      })
    },
    handleShip(row) {
      this.shipForm.orderId = row.id
      this.shipForm.shipChannel = row.shipChannel
      this.shipForm.shipSn = row.shipSn

      this.shipDialogVisible = true
      this.$nextTick(() => {
        this.$refs['shipForm'].clearValidate()
      })
    },
    handleStatus(row) {
      this.statusForm = {
        id: row.id,
        orderStatus: row.orderStatus + ''
      }
      this.statusDialogVisible = true
    },
    changeStatus() {
      statusTicket(this.statusForm).then(res => {
        for (const v of this.list) {
          if (v.id === this.statusForm.id) {
            const index = this.list.indexOf(v)
            this.list[index].orderStatus = this.statusForm.orderStatus
            break
          }
        }
        this.statusDialogVisible = false
        this.$message({
          type: 'success',
          message: '修改成功!'
        })
      })
    },
    confirmShip() {
      this.$refs['shipForm'].validate((valid) => {
        if (valid) {
          // designateMall(this.shipForm).then(response => {
          //   this.shipDialogVisible = false
          //   this.$notify.success({
          //     title: '成功',
          //     message: '确认发货成功'
          //   })
          //   this.getList()
          // })
        }
      })
    },
    handleRefund(row) {
      this.refundForm.orderId = row.id
      this.refundForm.refundMoney = row.actualPrice
      this.refundDialogVisible = true
      this.$nextTick(() => {
        this.$refs['refundForm'].clearValidate()
      })
    },
    confirmRefund() {
      // this.$refs['refundForm'].validate((valid) => {
      //   if (valid) {
      //     refundOrder(this.refundForm).then(response => {
      //       this.refundDialogVisible = false
      //       this.$notify.success({
      //         title: '成功',
      //         message: '确认退款成功'
      //       })
      //       this.getList()
      //     })
      //   }
      // })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['订单ID', '订单编号', '用户ID', '订单状态', '是否删除', '收货人', '收货联系电话', '收货地址']
        const filterVal = ['id', 'orderSn', 'userId', 'orderStatus', 'isDelete', 'consignee', 'mobile', 'address']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '订单信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
