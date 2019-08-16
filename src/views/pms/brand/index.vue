<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search" />
        <span>筛选搜索</span>
        <el-button style="float: right" type="primary" size="small" @click="searchBrandList()">查询结果</el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input v-model="listQuery.keyword" placeholder="品牌名称/关键字" style="width: 203px" />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>数据列表</span>
      <el-button class="btn-add" size="mini" @click="addBrand()">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="brandTable"
        :data="list"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="编号" width="90" align="center" prop="id" sortable />
        <el-table-column label="品牌名称" align="center" prop="name" />
        <el-table-column label="品牌首字母" align="center" prop="firstLetter" />
        <el-table-column label="品牌Logo" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.logo" :alt="scope.row.name" style="height: 40px">
          </template>
        </el-table-column>
        <el-table-column label="品牌制造商" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.factoryStatus"
              @change="handleStatusChange(scope.row, 'factoryStatus')"
            />
          </template>
        </el-table-column>
        <el-table-column label="是否显示" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.showStatus"
              @change="handleStatusChange(scope.row, 'showStatus')"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="85" align="center" prop="sort" sortable />
        <el-table-column label="设置" align="center">
          <template slot-scope="scope">
            <span>商品：{{ scope.row.productCount ? scope.row.productCount : 0 }}</span>
            <!-- <el-button
              size="mini"
              type="text"
              @click="getProductList(scope.$index, scope.row)"
            >{{ scope.row.productCount }}</el-button>-->
            <span
              style="margin-left: 10px;"
            >评价：{{ scope.row.productCommentCount ? scope.row.productCommentCount : 0 }}</span>
            <!-- <el-button
              size="mini"
              type="text"
              @click="getProductCommentList(scope.$index, scope.row)"
            >{{ scope.row.productCommentCount }}</el-button>-->
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select v-model="operateType" size="small" clearable placeholder="批量操作">
        <el-option
          v-for="item in operates"
          :key="item.value"
          :label="item.label"
          :value="item.label"
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
  </div>
</template>
<script>
import { brandList, updateShowStatus, updateFactoryStatus, deleteBrand } from '@/api/brand'

export default {
  name: 'BrandList',
  data() {
    return {
      operates: [
        {
          label: '显示品牌',
          statusType: 'showStatus',
          status: 1
        },
        {
          label: '隐藏品牌',
          statusType: 'showStatus',
          status: 0
        },
        {
          label: '设为制造商',
          statusType: 'factoryStatus',
          status: 1
        },
        {
          label: '取消制造商',
          statusType: 'factoryStatus',
          status: 0
        },
        {
          label: '批量删除',
          statusType: 'delete',
          status: 1
        }
      ],
      statusTypeMap: { factoryStatus: '品牌制造商', showStatus: '显示' },
      operateType: null,
      listQuery: {
        keyword: null,
        pageNum: 1,
        pageSize: 10
      },
      list: null,
      total: null,
      listLoading: true,
      multipleSelection: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      brandList(this.listQuery).then(response => {
        this.listLoading = false
        this.list = response.data.list
        this.total = response.data.total
        this.totalPage = response.data.totalPage
        this.pageSize = response.data.pageSize
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleUpdate(index, row) {
      this.$router.push({
        path: '/pms/updateBrand',
        query: { id: row.id }
      })
    },
    handleDelete(index, row) {
      this.$confirm(`是否要删除品牌${row.name}`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBrand(row.id).then(() => {
          this.list.splice(index, 1)
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1500
          })
        })
      })
    },
    // getProductList(index, row) {
    //   console.log(index, row)
    // },
    // getProductCommentList(index, row) {
    //   console.log(index, row)
    // },
    handleStatusChange(row, statusType) {
      this.$confirm(`是否要修改${this.statusTypeMap[statusType]}状态?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        ids.push(row.id)
        const params = new URLSearchParams()
        params.append('ids', ids)
        params.append(statusType, row[statusType])
        if (statusType === 'factoryStatus') {
          updateFactoryStatus(params).then(response => {
            this.$message({
              message: '修改成功',
              type: 'success',
              duration: 1500
            })
          })
        } else if (statusType === 'showStatus') {
          updateShowStatus(params).then(response => {
            this.$message({
              message: '修改成功',
              type: 'success',
              duration: 1500
            })
          })
        }
      }).catch(() => {
        row[statusType] = ~row[statusType] + 2
      })
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
    searchBrandList() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleBatchOperate() {
      console.log(this.operateType)
      if (!this.operateType || this.operateType === null) {
        this.$message({
          message: '请选择批量操作类型',
          type: 'warning',
          duration: 1500
        })
        return
      }
      if (this.multipleSelection == null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请至少选择一条记录',
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm('是否要进行该批量操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        let statusType = ''
        let status = 0
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id)
        }
        this.operates.forEach(item => {
          if (item.label === this.operateType) {
            statusType = item.statusType
            status = item.status
          }
        })
        this.handleEditStatus(ids, statusType, status)
      })
    },
    handleEditStatus(ids, statusType, status) {
      const params = new URLSearchParams()
      params.append('ids', ids)
      switch (statusType) {
        case 'showStatus':
          params.append(statusType, status)
          updateShowStatus(params).then(() => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        case 'factoryStatus':
          params.append(statusType, status)
          updateFactoryStatus(params).then(() => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        case 'delete':
          deleteBrand(params).then(response => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        default:
          this.$message({
            message: '请选择操作类型',
            type: 'warning',
            duration: 1500
          })
          break
      }
    },
    operateCallBack(ids, statusType, status) {
      this.list.forEach((item, i) => {
        ids.forEach(val => {
          if (item.id === val) {
            if (statusType === 'delete') {
              this.list.splice(i, 1)
            } else {
              item[statusType] = status
            }
            // 修改完数据之后清除勾选框
            this.$refs.brandTable.clearSelection()
          }
        })
      })
      this.$message({
        message: '操作成功',
        type: 'success',
        duration: 1500
      })
    },
    addBrand() {
      this.$router.push({ path: '/pms/addBrand' })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
