<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <!-- <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button style="float: right" @click="handleFilter" type="primary" size="small">查询结果</el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input
              v-model="listQuery.roleName"
              clearable
              class="filter-item"
              style="width: 200px;"
              placeholder="请输入角色名称"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>-->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>数据列表</span>
      <el-button class="btn-add" size="mini" @click="handleCreate">添加</el-button>
    </el-card>

    <!-- 查询结果 -->
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="relatedData"
        :data="list"
        size="small"
        element-loading-text="正在查询中。。。"
        border
        fit
        stripe
        highlight-current-row
        @selection-change="selectRow"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column align="center" label="角色名称" prop="name" sortable />
        <el-table-column align="center" label="用户数量" prop="adminCount" />
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <el-tag :type="statuType[scope.row.status]">{{ statusMap[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" />
        <el-table-column align="center" label="描述" prop="description" />
        <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="success" size="mini" @click="handlePermission(scope.row)">授权</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="dataForm.status" class="filter-item" placeholder="请选择">
            <el-option
              v-for="(item, index) in statusMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dataForm.description" :rows="2" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog :visible.sync="permissionDialogFormVisible" title="权限配置">
      <el-tree
        ref="tree"
        :data="systemPermissions"
        :default-checked-keys="assignedPermissions"
        :props="treeProps"
        show-checkbox
        node-key="id"
        highlight-current
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePerm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, createRole, updateRole, deleteRole, getPermissionTree, getRolePerm, updatePermission } from '@/api/role'
import { resolvingDate } from '@/utils/index'
// import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'Role',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10
      },
      dataForm: {
        id: undefined,
        name: undefined,
        desc: undefined
      },
      dialogFormVisible: false,
      multipleSelection: [],
      statusMap: ['禁用', '启用'],
      statuType: ['info', 'success'],
      treeProps: { label: 'name' },
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '描述不能为空', trigger: 'blur' }]
      },
      permissionDialogFormVisible: false,
      systemPermissions: null,
      assignedPermissions: null,
      permissionForm: {
        roleId: undefined,
        permissionIds: []
      }
    }
  },
  created() {
    this.getList()
    this.getPermTreeList()
  },
  methods: {
    // checkPermission,
    getList() {
      this.listLoading = true
      listRole(this.listQuery).then(response => {
        const data = response.data
        data.list.forEach(item => {
          item.createTime = resolvingDate(item.createTime)
        })
        this.list = data.list
        this.total = data.total
        this.listLoading = false
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
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    selectRow(val) {
      this.multipleSelection = val
    },
    handleBatchOperate() {
      if (this.multipleSelection == null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请选择要操作的角色',
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
        deleteRole(params).then(response => {
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
          this.$refs.relatedData.clearSelection()
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1500
          })
        })
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: '',
        description: '',
        status: 0
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createRole(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '添加角色成功',
              duration: 1500
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateRole(this.dataForm.id, this.dataForm).then(() => {
            for (const v of this.list) {
              if (v.id === this.dataForm.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.dataForm)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '更新角色成功',
              duration: 1500
            })
          })
        }
      })
    },
    handleDelete(index, row) {
      this.$confirm('是否删除角色 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = new URLSearchParams()
        params.append('ids', [row.id])
        deleteRole(params).then(response => {
          this.list.splice(index, 1)
          this.$notify.success({
            title: '成功',
            message: '删除角色成功',
            duration: 1500
          })
        })
      })
    },
    getPermTreeList() {
      getPermissionTree().then(response => {
        this.systemPermissions = response.data
      })
    },
    handlePermission(row) {
      this.permissionDialogFormVisible = true
      getRolePerm(row.id).then(response => {
        this.assignedPermissions = []
        const data = response.data
        data.forEach(item => {
          this.assignedPermissions.push(item.id)
        })
      })
      this.permissionForm.roleId = row.id
    },
    handleUpdatePerm() {
      this.permissionForm.permissionIds = this.$refs.tree.getCheckedKeys()
      const params = new URLSearchParams()
      params.append('permissionIds', this.permissionForm.permissionIds)

      updatePermission(this.permissionForm.roleId, params).then(response => {
        this.permissionDialogFormVisible = false
        this.$notify.success({
          title: '成功',
          message: '授权成功',
          duration: 1500
        })
      })
    }
  }
}
</script>
