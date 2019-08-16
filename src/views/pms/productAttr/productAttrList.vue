<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px" />
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="addProductAttr()">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="productAttrTable"
        :data="list"
        style="width: 100%"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column align="center" width="80" label="排序" prop="sort" sortable />
        <el-table-column label="属性名称" prop="name" width="100" align="center" />
        <el-table-column label="商品类型" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.cname }}</template>
        </el-table-column>
        <el-table-column label="属性是否可选" align="center">
          <template slot-scope="scope">{{ scope.row.selectType|selectTypeFilter }}</template>
        </el-table-column>
        <el-table-column label="属性值的录入方式" align="center">
          <template slot-scope="scope">{{ scope.row.inputType|inputTypeFilter }}</template>
        </el-table-column>
        <el-table-column label="检索类型" align="center">
          <template slot-scope="scope">{{ searchTypeOption[scope.row.searchType] }}</template>
        </el-table-column>
        <el-table-column label="可选值列表" prop="inputList" min-width="100" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="batch-operate-container">
      <el-button class="search-button" type="danger" size="small" @click="handleBatchOperate()">批量删除</el-button>
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
import { cidToProdAttrList, deleteProductAttr } from '@/api/productAttr'

export default {
  name: 'ProductAttrList',
  filters: {
    inputTypeFilter(value) {
      if (value === 1) {
        return '从列表中选取'
      } else {
        return '手工录入'
      }
    },
    selectTypeFilter(value) {
      if (value === 1) {
        return '单选'
      } else if (value === 2) {
        return '多选'
      } else {
        return '唯一'
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
        pageSize: 10,
        type: this.$route.query.type
      },
      cname: this.$route.query.cnam,
      cid: this.$route.query.cid,
      searchTypeOption: ['不需要进行检索', '关键字检索', '范围检索'],
      operateType: null,
      multipleSelection: [],
      operates: [
        {
          label: '删除',
          value: 'deleteProductAttr'
        }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      cidToProdAttrList(this.cid, this.listQuery).then(response => {
        this.listLoading = false
        const data = response.data
        data.list.forEach(item => {
          item.cname = this.cname
        })
        this.list = data.list
        this.total = data.total
      })
    },
    addProductAttr() {
      this.$router.push({
        path: '/pms/addProductAttr',
        query: { cid: this.cid, type: this.listQuery.type }
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleBatchOperate() {
      if (this.multipleSelection == null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请选择一条记录',
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
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id)
        }
        const params = new URLSearchParams()
        params.append('ids', ids)
        deleteProductAttr(params).then(response => {
          for (let i = 0; i < this.multipleSelection.length; i++) {
            // 获取选中行的索引的方法
            // 遍历表格中relatedData数据和选中的val数据，比较它们的sort,相等则输出选中行的索引
            ids.forEach((val, index) => {
              this.list.forEach((v, i) => {
                if (val === v.id) {
                  // i 为选中的索引
                  this.list.splice(i, 1)
                }
              })
            })
          }
          // // 删除完数据之后清除勾选框
          this.$refs.productAttrTable.clearSelection()
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1500
          })
        })
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
    handleUpdate(index, row) {
      this.$router.push({
        path: '/pms/updateProductAttr',
        query: { id: row.id }
      })
    },
    handleDeleteProductAttr(ids) {
      this.$confirm('是否要删除该属性', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = new URLSearchParams()
        data.append('ids', ids)
        deleteProductAttr(data).then(response => {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1500
          })
          this.getList()
        })
      })
    },
    handleDelete(index, row) {
      this.$confirm('是否删除属性 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('ids', [row.id])
        deleteProductAttr(params).then(response => {
          this.list.splice(index, 1)
          this.$notify.success({
            title: '成功',
            message: '删除属性成功',
            duration: 1500
          })
        })
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
