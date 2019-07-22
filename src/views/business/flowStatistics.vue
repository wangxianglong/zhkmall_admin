<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-row style="padding-bottom: 5px;">
        <el-col :xs="8" :sm="8" :md="8" :lg="5" :xl="4">
          <el-input
            v-model="listQuery.name"
            clearable
            class="filter-item"
            style="width: 200px;"
            placeholder="请输入姓名"
          />
        </el-col>
        <el-col :xs="8" :sm="8" :md="8" :lg="5" :xl="4">
          <el-input
            v-model="listQuery.orderSn"
            clearable
            class="filter-item"
            style="width: 200px;"
            placeholder="请输入订单号"
          />
        </el-col>
        <el-col :xs="8" :sm="8" :md="8" :lg="6" :xl="4">
          <el-select
            v-model="orderTypeList"
            multiple
            clearable
            style="width: 250px"
            class="filter-item"
            placeholder="请选择订单类别"
          >
            <el-option v-for="(key, value) in orderMap" :key="key" :label="key" :value="value"/>
          </el-select>
        </el-col>
        <el-col :xs="8" :sm="8" :md="8" :lg="5" :xl="4">
          <el-select
            v-model="payTypeList"
            multiple
            clearable
            style="width: 200px"
            class="filter-item"
            placeholder="请选择支付类型"
          >
            <el-option
              v-for="item in payOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>

        <el-col :xs="14" :sm="12" :md="12" :lg="6" :xl="6">
          <el-date-picker
            v-model="validTime"
            :picker-options="pickerOptions"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            value-format="yyyy-MM-dd hh:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="selectValidTime"
          />
        </el-col>

        <el-button
          v-permission="['GET /admin/serial/list']"
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          @click="handleFilter"
        >查找</el-button>
      </el-row>
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
      <el-table-column align="center" label="订单金额" width="100" prop="amount"/>
      <el-table-column align="center" label="订单提交时间" prop="orderAddTime"/>
      <el-table-column align="center" label="配送员名称" width="110" prop="deliveryUserName"/>
      <el-table-column align="center" label="生成时间" prop="addTime"/>
      <el-table-column align="center" label="推荐人名称" width="110" prop="recommendUserName"/>
      <el-table-column align="center" label="用户名称" width="110" prop="userName"/>
      <el-table-column align="center" width="120" label="订单类别">
        <template slot-scope="scope">
          <el-tag>{{ orderMap[scope.row.orderType] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" width="120" label="支付类型">
        <template slot-scope="scope">
          <el-tag>{{ payMap[scope.row.payType] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="120" label="备注">
        <template slot-scope="{ row }">
          <el-input v-model="row.remark" placeholder="请输入备注" @blur="handleRemark(row)"/>
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
  </div>
</template>

<style>
</style>

<script>
import { listFlow, remarkFlow } from '@/api/business'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { pickerOptions } from '@/utils/index'

export default {
  name: 'Order',
  components: { Pagination },
  data() {
    return {
      orderOptions: [
        {
          value: 0,
          label: '商城'
        },
        {
          value: 1,
          label: '外卖'
        },
        {
          value: 2,
          label: '餐券'
        }
      ],
      payOptions: [
        {
          value: 1,
          label: '支付宝'
        },
        {
          value: 2,
          label: '微信'
        }
      ],
      orderMap: ['商城', '外卖', '餐券'],
      payMap: ['', '支付宝', '微信'],
      validTime: [],
      orderTypeList: [],
      payTypeList: [],
      pickerOptions,
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        orderSn: undefined,
        orderTypeList: [],
        payTypeList: [],
        startTime: undefined,
        endTime: undefined,
        sort: 'add_time',
        order: 'desc'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listFlow(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.listQuery.orderTypeList = this.orderTypeList + ''
      this.listQuery.payTypeList = this.payTypeList + ''
      var hasValidTime = this.validTime instanceof Array
      if (!hasValidTime) {
        this.listQuery.startTime = ''
        this.listQuery.endTime = ''
      }
      for (const key in this.listQuery) {
        if (this.listQuery[key] === '') {
          delete this.listQuery[key]
        }
      }
      this.getList()
    },
    selectValidTime(val) {
      if (val) {
        this.listQuery.startTime = val[0]
        this.listQuery.endTime = val[1]
      }
    },
    handleRemark(row) {
      if (row.remark.replace(/(^\s*)|(\s*$)/g, '')) {
        var params = {
          id: row.id,
          remark: row.remark
        }
        remarkFlow(params).then(res => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
        })
      } else {
        this.$message({
          type: 'warning',
          message: '请输入备注信息'
        })
      }
    }
  }
}
</script>
