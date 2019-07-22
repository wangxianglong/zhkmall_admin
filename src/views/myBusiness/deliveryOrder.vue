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
      <el-button
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
      <el-table-column align="center" width="80" label="餐券ID" prop="couponId"/>
      <el-table-column align="center" width="80" label="用户ID" prop="userId"/>
      <el-table-column align="center" width="90" label="推荐人ID" prop="recommendUserId"/>
      <el-table-column align="center" label="订单编号" prop="orderSn"/>
      <el-table-column align="center" width="110" label="订单金额" prop="price"/>
      <el-table-column align="center" label="付款编号" prop="payId"/>
      <el-table-column align="center" label="支付时间" prop="payTime"/>
      <el-table-column align="center" label="订单关闭时间" prop="endTime"/>
      <el-table-column align="center" min-width="110" label="备注" prop="remark"/>
      <el-table-column align="center" label="订单状态" prop="orderStatus">
        <template slot-scope="{row}">
          <el-tag>{{ row.orderStatus | orderStatusFilter }}</el-tag>
          <!-- <el-select v-model="row.orderStatus" class="filter-item" @change="changeStatus(row)">
            <el-option v-for="item in statusArr" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select> -->
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['GET /admin/buffetcouponorder/read']"
            type="success"
            size="mini"
            @click="handleDetail(scope.row)"
          >详情</el-button>
          <el-button
            v-permission="['POST /admin/buffetcouponorder/status']"
            type="primary"
            size="small"
            @click="handleStatus(scope.row)"
          >修改状态</el-button>
        </template>
      </el-table-column> -->
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
          <span>
            (实际费用){{ orderDetail.actualPrice }}元 =
            (商品总价){{ orderDetail.goodsPrice }}元 +
            (配送费用){{ orderDetail.freightPrice }}元
          </span>
        </el-form-item>
        <el-form-item label="收货信息">
          <el-table :data="orderInfo" size="small" border fit highlight-current-row>
            <el-table-column align="center" width="100" label="收货人" prop="consignee"/>
            <el-table-column align="center" width="120" label="手机号" prop="mobile"/>
            <el-table-column align="center" label="地址" prop="address"/>
          </el-table>
        </el-form-item>
        <el-form-item label="快递信息">
          <el-table :data="orderInfo" size="small" border fit highlight-current-row>
            <el-table-column align="center" label="快递单号" prop="shipSn"/>
            <el-table-column align="center" label="快递公司" prop="shipChannel"/>
            <el-table-column align="center" label="发货时间" prop="shipTime"/>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="orderDialogVisible = false">确认</el-button>
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
  </div>
</template>

<style>
</style>

<script>
import { listDelivery, detDelivery } from '@/api/myBusiness'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
// import { statusMap } from '@/utils/index'

const statusMap = {
  0: '待支付',
  1: '已付款',
  2: '支付失败',
  3: '退款中',
  4: '已退款'
}

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
      statusArr: [{
        value: 0,
        label: '待支付'
      }, {
        value: 1,
        label: '已付款'
      }, {
        value: 2,
        label: '支付失败'
      }, {
        value: 3,
        label: '退款中'
      }, {
        value: 4,
        label: '已退款'
      }],
      list: undefined,
      total: 0,
      oldStatus: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
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
    getList() {
      this.listLoading = true
      listDelivery(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
        var orderStatusArr = []
        this.list.forEach(item => {
          orderStatusArr.push(item.orderStatus)
        })
        this.oldStatus = orderStatusArr
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDetail(row) {
      detDelivery(row.id).then(response => {
        var data = response.data.data
        this.orderDetail = data
        var order = []
        order.push(data)
        this.orderInfo = order
        this.orderDialogVisible = true
      })
    },
    handleStatus(row) {
      this.statusForm = {
        id: row.couponId,
        orderStatus: row.orderStatus + ''
      }
      this.statusDialogVisible = true
    },
    changeStatus(row) {
      this.$confirm('是否修改此条订单状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // statusDelivery({ id: row.id, orderStatus: row.orderStatus }).then(res => {
        //   this.$message({
        //     type: 'success',
        //     message: '修改成功!'
        //   })
        // })
      }).catch(() => {
        for (const v of this.list) {
          if (v.id === row.id) {
            const index = this.list.indexOf(v)
            row.orderStatus = this.oldStatus[index]
            break
          }
        }
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
    confirmShip() {
      this.$refs['shipForm'].validate((valid) => {
        if (valid) {
          // shipOrder(this.shipForm).then(response => {
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
      this.$refs['refundForm'].validate((valid) => {
        if (valid) {
          // refundOrder(this.refundForm).then(response => {
          //   this.refundDialogVisible = false
          //   this.$notify.success({
          //     title: '成功',
          //     message: '确认退款成功'
          //   })
          //   this.getList()
          // })
        }
      })
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
