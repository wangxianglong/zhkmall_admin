<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.orderSn"
        type="number"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入订单编号"
      />
      <el-button
        v-permission="['GET /admin/mytakeoutorder/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
    </div>

    <!-- 查询结果 -->
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
          <!-- <el-button
            v-permission="['GET /admin/order/detail']"
            type="success"
            size="small"
            @click="handleDetail(scope.row)"
          >详情</el-button> -->
          <!-- <el-button
            v-permission="['POST /admin/order/status']"
            type="primary"
            size="small"
            @click="handleStatus(scope.row)"
          >修改状态</el-button>-->
          <el-button
            v-permission="['POST /admin/mytakeoutorder/ship']"
            v-if="scope.row.orderStatus==201"
            type="primary"
            size="small"
            @click="confirmShip(scope.$index, scope.row)"
          >确认发货</el-button>
          <el-button
            v-permission="['POST /admin/mytakeoutorder/delivery']"
            v-else-if="scope.row.orderStatus==301"
            type="primary"
            size="small"
            @click="confirmRefund(scope.$index, scope.row)"
          >确认送达</el-button>
          <span v-else>无</span>
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
    <!-- <el-dialog :visible.sync="statusDialogVisible" title="修改状态">
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
    </el-dialog> -->
  </div>
</template>

<style>
</style>

<script>
import { listTicket, deliveryTicket, detTicket, shipTicket } from '@/api/myBusiness'
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
      listQuery: {
        page: 1,
        limit: 20,
        orderSn: undefined,
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
      this.getList()
    },
    handleDetail(row) {
      detTicket({ orderId: row.id }).then(response => {
        var data = response.data.data
        this.orderDetail = data
        var order = []
        order.push(data)
        this.orderInfo = order
      })
      this.orderDialogVisible = true
    },
    // handleStatus(row) {
    //   this.statusForm = {
    //     id: row.id,
    //     orderStatus: row.orderStatus + ''
    //   }
    //   this.statusDialogVisible = true
    // },
    // changeStatus() {
    //   statusMall(this.statusForm).then(res => {
    //     for (const v of this.list) {
    //       if (v.id === this.statusForm.id) {
    //         const index = this.list.indexOf(v)
    //         this.list[index].orderStatus = this.statusForm.orderStatus
    //         break
    //       }
    //     }
    //     this.statusDialogVisible = false
    //     this.$message({
    //       type: 'success',
    //       message: '修改成功!'
    //     })
    //   })
    // },
    confirmShip(index, row) {
      this.$confirm('订单 ' + row.orderSn + ' 是否发货 ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        shipTicket({ id: row.id }).then(response => {
          this.$notify.success({
            title: '成功',
            message: '确认发货成功'
          })
          this.list[index].orderStatus = 301
        })
      })
    },
    confirmRefund(index, row) {
      this.$confirm('订单 ' + row.orderSn + ' 是否送达 ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deliveryTicket({ id: row.id }).then(response => {
          this.refundDialogVisible = false
          this.$notify.success({
            title: '成功',
            message: '确认送达成功'
          })
          this.list[index].orderStatus = 402
        })
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
