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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="排序" width="100" align="center" prop="sort" sortable />
        <el-table-column label="品牌名称" align="center" prop="name" />
        <el-table-column label="品牌首字母" align="center" prop="firstLetter" />
        <el-table-column label="品牌Logo" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.logo" :alt="scope.row.name" style="height: 40px">
          </template>
        </el-table-column>
        <el-table-column label="商品数" align="center" prop="productCount" />
        <el-table-column label="评论数" align="center" prop="productCommentCount" />
        <el-table-column label="品牌制造商" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.factoryStatus"
              @change="handleFactoryStatusChange(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="是否显示" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.showStatus"
              @change="handleShowStatusChange(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column label="相关" align="center">
          <template slot-scope="scope">
            <span>商品数：</span>
            <el-button size="mini" type="text" @click="getProductList(scope.$index, scope.row)">{{ scope.row.productCount }}</el-button>
            <span style="margin-left: 10px;">评论数：</span>
            <el-button
              size="mini"
              type="text"
              @click="getProductCommentList(scope.$index, scope.row)"
            >{{ scope.row.productCommentCount }}</el-button>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select v-model="operateType" size="small" placeholder="批量操作">
        <el-option
          v-for="item in operates"
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
          value: 'showBrand'
        },
        {
          label: '隐藏品牌',
          value: 'hideBrand'
        }
      ],
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
      this.$router.push({ path: '/pms/updateBrand', query: { id: row.id }})
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该品牌', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBrand(row.id).then(response => {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1500
          })
          this.getList()
        })
      })
    },
    // getProductList(index, row) {
    //   console.log(index, row)
    // },
    // getProductCommentList(index, row) {
    //   console.log(index, row)
    // },
    handleFactoryStatusChange(index, row) {
      var data = new URLSearchParams()
      data.append('ids', row.id)
      data.append('factoryStatus', row.factoryStatus)
      updateFactoryStatus(data).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1500
        })
      }).catch(() => {
        if (row.factoryStatus === 0) {
          row.factoryStatus = 1
        } else {
          row.factoryStatus = 0
        }
      })
    },
    handleShowStatusChange(index, row) {
      const data = new URLSearchParams()
      data.append('ids', row.id)
      data.append('showStatus', row.showStatus)
      updateShowStatus(data).then(response => {
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1500
        })
      }).catch(() => {
        if (row.showStatus === 0) {
          row.showStatus = 1
        } else {
          row.showStatus = 0
        }
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
      console.log(this.multipleSelection)
      if (this.multipleSelection < 1) {
        this.$message({
          message: '请选择一条记录',
          type: 'warning',
          duration: 1500
        })
        return
      }
      let showStatus = 0
      if (this.operateType === 'showBrand') {
        showStatus = 1
      } else if (this.operateType === 'hideBrand') {
        showStatus = 0
      } else {
        this.$message({
          message: '请选择批量操作类型',
          type: 'warning',
          duration: 1500
        })
        return
      }
      const ids = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        ids.push(this.multipleSelection[i].id)
      }
      const data = new URLSearchParams()
      data.append('ids', ids)
      data.append('showStatus', showStatus)
      updateShowStatus(data).then(response => {
        this.getList()
        this.$message({
          message: '修改成功',
          type: 'success',
          duration: 1500
        })
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
