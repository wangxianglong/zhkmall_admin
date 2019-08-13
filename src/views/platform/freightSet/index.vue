<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px" />
      <span style="margin: 5px 20px 0 0">数据列表</span>
      <el-select v-model="parentId" placeholder="请选择" @change="changeCategory">
        <el-option
          v-for="(item, index) in categoryOptions"
          :key="index"
          :label="item"
          :value="index"
        />
      </el-select>
      <el-button class="btn-add" size="mini" @click="handleAddProductCate()">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="productCateTable"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column align="center" width="80" label="排序" prop="sort" sortable />
        <el-table-column align="center" label="分类名称" prop="name" />
        <el-table-column label="级别" align="center">
          <template slot-scope="scope">{{ scope.row.level | levelFilter }}</template>
        </el-table-column>
        <el-table-column align="center" label="商品数量" prop="productCount" />
        <el-table-column align="center" label="数量单位" prop="productUnit" />
        <el-table-column label="导航栏展示" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.navStatus"
              @change="handleStatusChange(scope.row, 'navStatus')"
            />
          </template>
        </el-table-column>
        <el-table-column label="是否启用" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.showStatus"
              @change="handleStatusChange(scope.row, 'showStatus')"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column label="设置" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              :disabled="scope.row.level | disableNextLevel"
              @click="handleShowNextLevel(scope.$index, scope.row)"
            >查看下级</el-button>
            <el-button size="mini" @click="handleTransferProduct(scope.$index, scope.row)">转移商品</el-button>
          </template>
        </el-table-column>-->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
import { categoryList, deleteProductCate, updateShowStatus, updateNavStatus } from '@/api/productCate'

export default {
  name: 'ProductCateList',
  filters: {
    levelFilter(value) {
      if (value === 0) {
        return '一级'
      } else if (value === 1) {
        return '二级'
      }
    },
    disableNextLevel(value) {
      if (value === 0) {
        return false
      } else {
        return true
      }
    }
  },
  data() {
    return {
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      statusTypeMap: { navStatus: '导航栏显示', showStatus: '启用' },
      categoryOptions: ['一级分类', '二级分类'],
      parentId: 0
    }
  },
  watch: {
    $route(route) {
      this.resetParentId()
      this.getList()
    }
  },
  created() {
    this.resetParentId()
    this.getList()
  },
  methods: {
    resetParentId() {
      if (this.$route.query.parentId != null) {
        this.parentId = this.$route.query.parentId
      } else {
        this.parentId = 0
      }
    },
    handleAddProductCate() {
      this.$router.push('/pms/addProductCate')
    },
    getList() {
      this.listLoading = true
      categoryList(this.parentId, this.listQuery).then(response => {
        this.listLoading = false
        this.list = response.data.list
        this.total = response.data.total
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
    handleStatusChange(row, statusType) {
      this.$confirm(`是否修改${this.statusTypeMap[statusType]}状态?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        ids.push(row.id)
        const params = new URLSearchParams()
        params.append('ids', ids)
        params.append(statusType, row[statusType])
        if (statusType === 'navStatus') {
          updateNavStatus(params).then(response => {
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
    changeCategory(val) {
      this.getList()
    },
    handleTransferProduct(index, row) {
      console.log('handleAddProductCate')
    },
    handleUpdate(index, row) {
      this.$router.push({ path: '/pms/updateProductCate', query: { id: row.id }})
    },
    handleDelete(index, row) {
      this.$confirm('是否删除 ' + row.name + ' 分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteProductCate(row.id).then(response => {
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    }
  }
}
</script>

<style scoped>
</style>
