<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" @click="handleAdd">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="returnReasonTable"
        :data="list"
        border
        stripe
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="排序" width="100" align="center" prop="sort" />
        <el-table-column label="原因类型" align="center" prop="name" />
        <el-table-column label="是否可用" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.$index,scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="添加时间" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatCreateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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
        @click="handleBatchOperate"
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
    <el-dialog :visible.sync="dialogVisible" title="添加退货原因" width="30%">
      <el-form ref="reasonForm" :model="returnReason" label-width="150px">
        <el-form-item label="原因类型：">
          <el-input v-model="returnReason.name" class="input-width" />
        </el-form-item>
        <el-form-item label="排序：">
          <el-input v-model="returnReason.sort" class="input-width" />
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-switch v-model="returnReason.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { formatDate } from '@/utils/date'
import { fetchList, deleteReason, updateStatus, addReason, getReasonDetail, updateReason } from '@/api/returnReason'
const defaultListQuery = {
  pageNum: 1,
  pageSize: 10
}
const defaultReturnReason = {
  name: null,
  sort: 0,
  status: 1,
  createTime: null
}
export default {
  name: 'ReturnReasonList',
  filters: {
    formatCreateTime(time) {
      const date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  data() {
    return {
      list: null,
      total: null,
      multipleSelection: [],
      listLoading: true,
      listQuery: Object.assign({}, defaultListQuery),
      operateType: null,
      operateOptions: [
        {
          label: '删除',
          value: 1
        }
      ],
      dialogVisible: false,
      returnReason: Object.assign({}, defaultReturnReason),
      operateReasonId: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleAdd() {
      this.dialogVisible = true
      this.operateReasonId = null
      this.returnReason = Object.assign({}, defaultReturnReason)
    },
    handleConfirm() {
      if (this.operateReasonId == null) {
        // 添加操作
        addReason(this.returnReason).then(response => {
          this.dialogVisible = false
          this.operateReasonId = null
          this.$message({
            message: '添加成功！',
            type: 'success',
            duration: 1500
          })
          this.getList()
        })
      } else {
        // 编辑操作
        updateReason(this.operateReasonId, this.returnReason).then(response => {
          this.dialogVisible = false
          this.operateReasonId = null
          this.$message({
            message: '修改成功！',
            type: 'success',
            duration: 1500
          })
          this.getList()
        })
      }
    },
    handleUpdate(index, row) {
      this.dialogVisible = true
      this.operateReasonId = row.id
      getReasonDetail(row.id).then(response => {
        this.returnReason = response.data
      })
    },
    handleDelete(index, row) {
      const ids = []
      ids.push(row.id)
      this.deleteReason(ids)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleStatusChange(index, row) {
      const ids = []
      ids.push(row.id)
      const param = new URLSearchParams()
      param.append('status', row.status)
      param.append('ids', ids)
      updateStatus(param).then(response => {
        this.$message({
          message: '状态修改成功',
          type: 'success'
        })
      })
    },
    handleBatchOperate() {
      if (this.multipleSelection === null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请选择要操作的条目',
          type: 'warning',
          duration: 1500
        })
        return
      }
      if (this.operateType === 1) {
        const ids = []
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id)
        }
        this.deleteReason(ids)
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
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.listLoading = false
        this.list = response.data.list
        this.total = response.data.total
      })
    },
    deleteReason(ids) {
      this.$confirm('是否要进行该删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('ids', ids)
        deleteReason(params).then(response => {
          this.$message({
            message: '删除成功！',
            type: 'success',
            duration: 1500
          })
          this.listQuery.pageNum = 1
          this.getList()
        })
      })
    }
  }
}
</script>
<style scoped>
.input-width {
  width: 80%;
}
</style>
