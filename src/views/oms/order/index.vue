<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search" />
        <span>筛选搜索</span>
        <el-button style="float:right" type="primary" size="small" @click="handleSearchList()">查询搜索</el-button>
        <el-button
          style="float:right;margin-right: 15px"
          size="small"
          @click="handleResetSearch()"
        >重置</el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :model="listQuery" :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input v-model="listQuery.orderSn" class="input-width" placeholder="订单编号" />
          </el-form-item>
          <el-form-item label="收货人：">
            <el-input
              v-model="listQuery.receiverKeyword"
              class="input-width"
              placeholder="收货人姓名/手机号码"
            />
          </el-form-item>
          <el-form-item label="提交时间：">
            <el-date-picker
              v-model="listQuery.createTime"
              :picker-options="pickerOptions"
              clearable
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
            />
          </el-form-item>
          <el-form-item label="订单状态：">
            <el-select v-model="listQuery.status" class="input-width" placeholder="全部" clearable>
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="订单类型：">
            <el-select v-model="listQuery.orderType" class="input-width" placeholder="全部" clearable>
              <el-option
                v-for="(item, index) in orderTypeOptions"
                :key="index"
                :label="item"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="订单来源：">
            <el-select
              v-model="listQuery.sourceType"
              class="input-width"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in sourceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>数据列表</span>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="orderTable"
        :data="list"
        border
        stripe
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="订单编号" align="center" prop="orderSn" />
        <el-table-column label="提交时间" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatCreateTime }}</template>
        </el-table-column>
        <el-table-column label="用户账号" align="center" prop="memberUsername" />
        <el-table-column label="订单金额" align="center">
          <template slot-scope="scope">￥{{ scope.row.totalAmount }}</template>
        </el-table-column>
        <el-table-column label="支付方式" align="center">
          <template slot-scope="scope">{{ scope.row.payType | formatPayType }}</template>
        </el-table-column>
        <el-table-column label="订单类型" align="center">
          <template slot-scope="scope">{{ orderTypeOptions[scope.row.orderType] }}</template>
        </el-table-column>
        <el-table-column label="订单来源" align="center">
          <template slot-scope="scope">{{ scope.row.sourceType | formatSourceType }}</template>
        </el-table-column>
        <el-table-column label="订单状态" align="center">
          <template slot-scope="scope">{{ scope.row.status | formatStatus }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleViewOrder(scope.$index, scope.row)">查看订单</el-button>
            <el-button
              v-show="scope.row.status===0"
              size="mini"
              @click="handleCloseOrder(scope.$index, scope.row)"
            >关闭订单</el-button>
            <el-button
              v-show="scope.row.status===1"
              size="mini"
              @click="handleDeliveryOrder(scope.$index, scope.row)"
            >订单发货</el-button>
            <el-button
              v-show="scope.row.status===2||scope.row.status===3"
              size="mini"
              @click="handleViewLogistics(scope.$index, scope.row)"
            >订单跟踪</el-button>
            <el-button
              v-show="scope.row.status===4"
              size="mini"
              type="danger"
              @click="handleDeleteOrder(scope.$index, scope.row)"
            >删除订单</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select v-model="operateType" size="small" placeholder="批量操作">
        <el-option
          v-for="item in operateOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        type="primary"
        size="small"
        @click="handleBatchOperate()"
      >确定</el-button>
    </div>
    <div class="pagination-container">
      <el-pagination
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :current-page.sync="listQuery.pageNum"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog :visible.sync="closeOrder.dialogVisible" title="关闭订单" width="30%">
      <span style="vertical-align: top">操作备注：</span>
      <el-input
        v-model="closeOrder.content"
        :rows="5"
        style="width: 80%"
        type="textarea"
        placeholder="请输入内容"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrder.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrderConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <logistics-dialog v-model="logisticsDialogVisible" />
  </div>
</template>
<script>
import { fetchList, closeOrder, deleteOrder } from '@/api/order'
import { formatDate } from '@/utils/date'
import LogisticsDialog from '@/views/oms/order/components/logisticsDialog'
const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  orderSn: null,
  receiverKeyword: null,
  status: null,
  orderType: null,
  sourceType: null,
  createTime: null
}
export default {
  name: 'OrderList',
  components: { LogisticsDialog },
  filters: {
    formatCreateTime(time) {
      const date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    },
    formatPayType(value) {
      if (value === 1) {
        return '支付宝'
      } else if (value === 2) {
        return '微信'
      } else {
        return '未支付'
      }
    },
    formatSourceType(value) {
      if (value === 1) {
        return 'APP订单'
      } else {
        return 'PC订单'
      }
    },
    formatStatus(value) {
      if (value === 1) {
        return '待发货'
      } else if (value === 2) {
        return '已发货'
      } else if (value === 3) {
        return '已完成'
      } else if (value === 4) {
        return '已关闭'
      } else if (value === 5) {
        return '无效订单'
      } else {
        return '待付款'
      }
    }
  },
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      listLoading: true,
      list: null,
      total: null,
      operateType: null,
      multipleSelection: [],
      closeOrder: {
        dialogVisible: false,
        content: null,
        orderIds: []
      },
      statusOptions: [
        {
          label: '待付款',
          value: 0
        },
        {
          label: '待发货',
          value: 1
        },
        {
          label: '已发货',
          value: 2
        },
        {
          label: '已完成',
          value: 3
        },
        {
          label: '已关闭',
          value: 4
        }
      ],
      orderTypeOptions: ['正常订单', '秒杀订单'],
      sourceTypeOptions: [
        {
          label: 'PC订单',
          value: 0
        },
        {
          label: 'APP订单',
          value: 1
        }
      ],
      operateOptions: [
        {
          label: '批量发货',
          value: 1
        },
        {
          label: '关闭订单',
          value: 2
        },
        {
          label: '删除订单',
          value: 3
        }
      ],
      logisticsDialogVisible: false,
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery)
    },
    handleSearchList() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleViewOrder(index, row) {
      this.$router.push({
        path: '/oms/orderDetail',
        query: { id: row.id }
      })
    },
    handleCloseOrder(index, row) {
      this.closeOrder.dialogVisible = true
      this.closeOrder.orderIds = [row.id]
    },
    handleDeliveryOrder(index, row) {
      const listItem = this.covertOrder(row)
      this.$router.push({
        path: '/oms/deliverOrderList',
        query: { list: [listItem] }
      })
    },
    handleViewLogistics(index, row) {
      this.logisticsDialogVisible = true
    },
    handleDeleteOrder(index, row) {
      const ids = []
      ids.push(row.id)
      this.deleteOrder(ids)
    },
    handleBatchOperate() {
      if (this.multipleSelection == null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请选择要操作的订单',
          type: 'warning',
          duration: 1500
        })
        return
      }
      if (this.operateType === 1) {
        // 批量发货
        const list = []
        for (let i = 0; i < this.multipleSelection.length; i++) {
          if (this.multipleSelection[i].status === 1) {
            list.push(this.covertOrder(this.multipleSelection[i]))
          }
        }
        if (list.length === 0) {
          this.$message({
            message: '选中订单中没有可以发货的订单',
            type: 'warning',
            duration: 1500
          })
          return
        }
        this.$router.push({
          path: '/oms/deliverOrderList',
          query: { list: list }
        })
      } else if (this.operateType === 2) {
        // 关闭订单
        this.closeOrder.orderIds = []
        for (let i = 0; i < this.multipleSelection.length; i++) {
          this.closeOrder.orderIds.push(this.multipleSelection[i].id)
        }
        this.closeOrder.dialogVisible = true
      } else if (this.operateType === 3) {
        // 删除订单
        const ids = []
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id)
        }
        this.deleteOrder(ids)
      }
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleCloseOrderConfirm() {
      if (this.closeOrder.content === null || this.closeOrder.content === '') {
        this.$message({
          message: '操作备注不能为空',
          type: 'warning',
          duration: 1500
        })
        return
      }
      const params = new URLSearchParams()
      params.append('ids', this.closeOrder.orderIds)
      params.append('note', this.closeOrder.content)
      closeOrder(params).then(response => {
        this.closeOrder.orderIds = []
        this.closeOrder.dialogVisible = false
        this.getList()
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1500
        })
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.listLoading = false
        this.list = response.data.list
        this.total = response.data.total
      })
    },
    deleteOrder(ids) {
      this.$confirm('是否要进行该删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('ids', ids)
        deleteOrder(params).then(response => {
          this.$message({
            message: '删除成功！',
            type: 'success',
            duration: 1500
          })
          this.getList()
        })
      })
    },
    covertOrder(order) {
      const address = order.receiverProvince + order.receiverCity + order.receiverRegion + order.receiverDetailAddress
      const listItem = {
        orderId: order.id,
        orderSn: order.orderSn,
        receiverName: order.receiverName,
        receiverPhone: order.receiverPhone,
        receiverPostCode: order.receiverPostCode,
        address: address,
        deliveryCompany: null,
        deliverySn: null
      }
      return listItem
    }
  }
}
</script>
<style scoped>
.input-width {
  width: 203px;
}
</style>
