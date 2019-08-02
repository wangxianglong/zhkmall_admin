<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.roleName"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入角色名称"
      />
      <el-button
        v-permission="['GET /admin/role/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/role/create']"
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
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
      <el-table-column align="center" width="100" label="Id" prop="id" sortable/>
      <el-table-column align="center" label="角色名称" prop="name" sortable/>
      <el-table-column align="center" label="描述" prop="adminCount"/>
      <el-table-column align="center" label="描述" prop="createTime"/>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-tag
            :type="statuType[scope.row.status]"
          >{{ statusMap[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="描述" prop="description"/>
      <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/role/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['GET /admin/role/permissions']"
            type="success"
            size="mini"
            @click="handlePermission(scope.row)"
          >授权</el-button>
          <el-button
            v-permission="['POST /admin/role/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page-num.sync="listQuery.pageNum"
      :page-size.sync="listQuery.pageSize"
      @pagination="getList"
    /> -->

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
          <el-input v-model="dataForm.name" placeholder="请输入角色名称"/>
        </el-form-item>
        <el-form-item label="说明" prop="desc">
          <el-input v-model="dataForm.desc" placeholder="请输入角色说明"/>
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
        show-checkbox
        node-key="id"
        highlight-current
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>{{ data.label }}</span>
          <el-tag v-if="data.api" type="success" size="mini">{{ data.api }}</el-tag>
        </span>
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogFormVisible = false">取消</el-button>
        <el-button v-permission="['POST /admin/role/permissions']" type="primary" @click="updatePermission">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRole, createRole, updateRole, deleteRole, getPermission, updatePermission } from '@/api/role'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'Role',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined
      },
      dataForm: {
        id: undefined,
        name: undefined,
        desc: undefined
      },
      dialogFormVisible: false,
      statusMap: ['可用', '停用'],
      statuType: ['success', 'info'],
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      permissionDialogFormVisible: false,
      systemPermissions: null,
      assignedPermissions: null,
      permissionForm: {
        roleId: undefined,
        permissions: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      listRole().then(response => {
        this.list = response.data
        // this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: undefined,
        desc: undefined
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
            this.list.unshift(response.data.data)
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '添加角色成功'
            })
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
          updateRole(this.dataForm).then(() => {
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
              message: '更新管理员成功'
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
        if (row.id === 1) {
          this.$message({
            message: '最高管理员不可删除',
            type: 'warning'
          })
        } else {
          deleteRole({ id: row.id }).then(response => {
            this.list.splice(index, 1)
            this.$notify.success({
              title: '成功',
              message: '删除角色成功'
            })
          })
        }
      })
    },
    handlePermission(row) {
      this.permissionDialogFormVisible = true
      this.permissionForm.roleId = row.id
      getPermission({ roleId: row.id }).then(response => {
        this.systemPermissions = response.data.data.systemPermissions
        this.assignedPermissions = response.data.data.assignedPermissions
      })
    },
    updatePermission() {
      this.permissionForm.permissions = this.$refs.tree.getCheckedKeys(true)
      updatePermission(this.permissionForm)
        .then(response => {
          this.permissionDialogFormVisible = false
          this.$notify.success({
            title: '成功',
            message: '授权成功'
          })
        })
    }
  }
}
</script>
