<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"/>
        <span>筛选搜索</span>
        <el-button style="float:right" type="primary" size="small" @click="handleSearchList()">查询搜索</el-button>
        <el-button
          style="float:right;margin-right: 15px"
          size="small"
          @click="handleResetSearch()"
        >重置</el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="品牌名称：">
            <el-input v-model="listQuery.brandName" class="input-width" placeholder="品牌名称"/>
          </el-form-item>
          <el-form-item label="推荐状态：">
            <el-select
              v-model="listQuery.recommendStatus"
              placeholder="全部"
              clearable
              class="input-width"
            >
              <el-option
                v-for="item in recommendOptions"
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
      <i class="el-icon-tickets"/>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleSelectBrand()">选择品牌</el-button>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="homeBrandTable"
        :data="list"
        style="width: 100%;"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center"/>
        <el-table-column label="编号" width="120" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="品牌名称" align="center">
          <template slot-scope="scope">{{ scope.row.brandName }}</template>
        </el-table-column>
        <el-table-column label="是否推荐" width="200" align="center">
          <template slot-scope="scope">
            <el-switch
              :active-value="1"
              :inactive-value="0"
              v-model="scope.row.recommendStatus"
              @change="handleRecommendStatusStatusChange(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.sort }}</template>
        </el-table-column>
        <el-table-column label="状态" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.recommendStatus | formatRecommendStatus }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="handleEditSort(scope.$index, scope.row)">设置排序</el-button>
            <el-button size="mini" type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
    <el-dialog :visible.sync="selectDialogVisible" title="选择品牌" width="40%">
      <el-input
        v-model="dialogData.listQuery.keyword"
        style="width: 250px;margin-bottom: 20px"
        size="small"
        placeholder="品牌名称搜索"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSelectSearch()"/>
      </el-input>
      <el-table :data="dialogData.list" border @selection-change="handleDialogSelectionChange">
        <el-table-column type="selection" width="60" align="center"/>
        <el-table-column label="品牌名称" align="center">
          <template slot-scope="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column label="相关" width="220" align="center">
          <template slot-scope="scope">
            商品：
            <span class="color-main">{{ scope.row.productCount }}</span>
            评价：
            <span class="color-main">{{ scope.row.productCommentCount }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          :page-size="dialogData.listQuery.pageSize"
          :page-sizes="[5,10,15]"
          :current-page.sync="dialogData.listQuery.pageNum"
          :total="dialogData.total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleDialogSizeChange"
          @current-change="handleDialogCurrentChange"
        />
      </div>
      <div style="clear: both;"/>
      <div slot="footer">
        <el-button size="small" @click="selectDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="handleSelectDialogConfirm()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="sortDialogVisible" title="设置排序" width="40%">
      <el-form :model="sortDialogData" label-width="150px">
        <el-form-item label="排序：">
          <el-input v-model="sortDialogData.sort" style="width: 200px"/>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="sortDialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="handleUpdateSort">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { fetchList, updateRecommendStatus, deleteHomeBrand, createHomeBrand, updateHomeBrandSort } from '@/api/homeBrand'
import { brandList } from '@/api/brand'

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  brandName: null,
  recommendStatus: null
}
const defaultRecommendOptions = [
  {
    label: '未推荐',
    value: 0
  },
  {
    label: '推荐中',
    value: 1
  }
]
export default {
  name: 'HomeBrandList',
  filters: {
    formatRecommendStatus(status) {
      if (status === 1) {
        return '推荐中'
      } else {
        return '未推荐'
      }
    }
  },
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      recommendOptions: Object.assign({}, defaultRecommendOptions),
      list: null,
      total: null,
      listLoading: false,
      multipleSelection: [],
      operates: [
        {
          label: '设为推荐',
          value: 0
        },
        {
          label: '取消推荐',
          value: 1
        },
        {
          label: '删除',
          value: 2
        }
      ],
      operateType: null,
      selectDialogVisible: false,
      dialogData: {
        list: null,
        total: null,
        multipleSelection: [],
        listQuery: {
          keyword: null,
          pageNum: 1,
          pageSize: 5
        }
      },
      sortDialogVisible: false,
      sortDialogData: { sort: 0, id: null }
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
    handleSizeChange(val) {
      this.listQuery.pageNum = 1
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleRecommendStatusStatusChange(index, row) {
      this.updateRecommendStatusStatus(row.id, row.recommendStatus)
    },
    handleDelete(index, row) {
      this.deleteBrand(row.id)
    },
    handleBatchOperate() {
      if (this.multipleSelection < 1) {
        this.$message({
          message: '请选择一条记录',
          type: 'warning',
          duration: 1000
        })
        return
      }
      const ids = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        ids.push(this.multipleSelection[i].id)
      }
      if (this.operateType === 0) {
        // 设为推荐
        this.updateRecommendStatusStatus(ids, 1)
      } else if (this.operateType === 1) {
        // 取消推荐
        this.updateRecommendStatusStatus(ids, 0)
      } else if (this.operateType === 2) {
        // 删除
        this.deleteBrand(ids)
      } else {
        this.$message({
          message: '请选择批量操作类型',
          type: 'warning',
          duration: 1000
        })
        return
      }
    },
    handleSelectBrand() {
      this.selectDialogVisible = true
      this.getDialogList()
    },
    handleSelectSearch() {
      this.getDialogList()
    },
    handleDialogSizeChange(val) {
      this.dialogData.listQuery.pageNum = 1
      this.dialogData.listQuery.pageSize = val
      this.getDialogList()
    },
    handleDialogCurrentChange(val) {
      this.dialogData.listQuery.pageNum = val
      this.getDialogList()
    },
    handleDialogSelectionChange(val) {
      this.dialogData.multipleSelection = val
    },
    handleSelectDialogConfirm() {
      if (this.dialogData.multipleSelection < 1) {
        this.$message({
          message: '请选择一条记录',
          type: 'warning',
          duration: 1000
        })
        return
      }
      const selectBrands = []
      for (let i = 0; i < this.dialogData.multipleSelection.length; i++) {
        selectBrands.push({
          brandId: this.dialogData.multipleSelection[i].id,
          brandName: this.dialogData.multipleSelection[i].name
        })
      }
      this.$confirm('使用要进行添加操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        createHomeBrand(selectBrands).then(response => {
          this.selectDialogVisible = false
          this.dialogData.multipleSelection = []
          this.getList()
          this.$message({
            type: 'success',
            message: '添加成功!'
          })
        })
      })
    },
    handleEditSort(index, row) {
      this.sortDialogVisible = true
      this.sortDialogData.sort = row.sort
      this.sortDialogData.id = row.id
    },
    handleUpdateSort() {
      this.$confirm('是否要修改排序?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateHomeBrandSort(this.sortDialogData).then(response => {
          this.sortDialogVisible = false
          this.getList()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
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
    updateRecommendStatusStatus(ids, status) {
      this.$confirm('是否要修改推荐状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('ids', ids)
        params.append('recommendStatus', status)
        updateRecommendStatus(params).then(response => {
          this.getList()
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'success',
          message: '已取消操作!'
        })
        this.getList()
      })
    },
    deleteBrand(ids) {
      this.$confirm('是否要删除该推荐?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('ids', ids)
        deleteHomeBrand(params).then(response => {
          this.getList()
          this.$message({
            type: 'success',
            message: '删成功!'
          })
        })
      })
    },
    getDialogList() {
      brandList(this.dialogData.listQuery).then(response => {
        this.dialogData.list = response.data.list
        this.dialogData.total = response.data.total
      })
    }
  }
}
</script>
<style></style>

