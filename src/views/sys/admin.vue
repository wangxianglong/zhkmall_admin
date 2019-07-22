<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入管理员用户名"
      />
      <el-button
        v-permission="['GET /admin/admin/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/admin/create']"
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
      <el-table-column align="center" width="100" label="ID" prop="id" sortable/>
      <el-table-column align="center" width="130" label="用户名" prop="username"/>
      <el-table-column align="center" width="100" label="姓名" prop="name"/>
      <el-table-column align="center" width="130" label="管理员头像" prop="avatar">
        <template slot-scope="scope">
          <img v-if="scope.row.avatar" :src="scope.row.avatar" class="avatar">
        </template>
      </el-table-column>
      <el-table-column align="center" width="100" label="性别" prop="gender">
        <template slot-scope="scope">
          <el-tag>{{ genderDic[scope.row.gender] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" width="130" label="生日" prop="birthday"/>
      <el-table-column align="center" width="100" label="员工号" prop="number"/>
      <el-table-column align="center" label="管理员角色" prop="roleIds">
        <template slot-scope="scope">
          <el-tag
            v-for="roleId in scope.row.roleIds"
            :key="roleId"
            type="primary"
            style="margin-right: 20px;"
          >{{ formatRole(roleId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" width="110" label="状态">
        <template slot-scope="scope">
          <el-tag :type="statusDic[scope.row.status].type">{{ statusDic[scope.row.status].desc }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/admin/status']"
            v-if="scope.row.status === 0"
            size="mini"
            type="info"
            @click="upProduct(scope.$index, scope.row)"
          >冻结</el-button>
          <el-button
            v-permission="['POST /admin/admin/status']"
            v-else
            size="mini"
            type="primary"
            @click="upProduct(scope.$index, scope.row)"
          >启用</el-button>
          <el-button
            v-permission="['POST /admin/admin/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/admin/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="right"
        label-width="100px"
        style="margin: 0 50px;"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="dataForm.username"
            :disabled="dialogStatus==='create'?false:true"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dataForm.name" placeholder="请输入姓名"/>
        </el-form-item>
        <el-form-item label="员工号">
          <el-input
            v-model="dataForm.number"
            :disabled="dialogStatus==='create'?false:true"
            placeholder="请输入员工号"
          />
        </el-form-item>
        <el-form-item label="管理员密码" prop="password">
          <el-input
            v-model="dataForm.password"
            type="password"
            placeholder="请输入密码"
            auto-complete="off"
          />
        </el-form-item>
        <el-form-item label="管理员角色" prop="roleIds">
          <el-select v-model="dataForm.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="管理员头像" prop="avatar">
          <el-upload
            :http-request="fnUploadpicUrl"
            :show-file-list="true"
            :file-list="picUrl"
            :on-remove="handleRemovePic"
            :on-exceed="beyondFile"
            :limit="1"
            :before-upload="beforeAvatarUpload"
            list-type="picture-card"
            action
          >
            <i class="el-icon-plus"/>
          </el-upload>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="dataForm.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="dataForm.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAdmin, createAdmin, updateAdmin, deleteAdmin, statusAdmin } from '@/api/admin'
import { roleOptions } from '@/api/role'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import oss from '@/utils/aliOss'
import { promptMessage } from '@/utils/index'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'Admin',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      roleOptions: null,
      listLoading: true,
      genderDic: ['未知', '男', '女'],
      picUrl: [],
      statusDic: [{
        type: 'success',
        desc: '正常'
      }, {
        type: 'info',
        desc: '冻结'
      }],
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        username: undefined,
        password: undefined,
        avatar: undefined,
        roleIds: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [
          { required: true, message: '管理员姓名不能为空', trigger: 'blur' }
        ],
        roleIds: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    roleOptions().then(response => {
      this.roleOptions = response.data.data
    })
  },
  methods: {
    checkPermission,
    formatRole(roleId) {
      for (let i = 0; i < this.roleOptions.length; i++) {
        if (roleId === this.roleOptions[i].value) {
          return this.roleOptions[i].label
        }
      }
      return ''
    },
    getList() {
      this.listLoading = true
      listAdmin(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    async fnUploadpicUrl(option) {
      oss.ossUploadFile(option).then(res => {
        this.picUrl = [{ url: res.fileUrl }]
      })
    },
    beforeAvatarUpload(file) {
      let isIMAGE = false
      if (file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'image/png') {
        isIMAGE = true
      }
      if (!isIMAGE) {
        this.$message.error('上传文件只能是图片格式!')
      }
      return isIMAGE
    },
    handleRemovePic(file, fileList) {
      this.picUrl = []
    },
    // 添加多个文件事件
    beyondFile(files, fileList) {
      this.$message({
        message: '最多上传' + fileList.length + '张图片',
        type: 'error'
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        username: undefined,
        password: undefined,
        avatar: undefined,
        roleIds: []
      }
      this.picUrl = []
    },
    uploadAvatar(response) {
      this.dataForm.avatar = response.data.url
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
          if (promptMessage(String, this.dataForm.username, '输入用户名')) {
            if (this.dataForm.username.length >= 6 && this.dataForm.username.length <= 20) {
              if (promptMessage(String, this.dataForm.number, '输入员工号')) {
                if (promptMessage(Array, this.dataForm.roleIds, '选择角色')) {
                  if (this.picUrl.length > 0) {
                    this.dataForm.avatar = this.picUrl[0].url
                  }
                  createAdmin(this.dataForm).then(response => {
                    this.getList()
                    this.dialogFormVisible = false
                    this.$notify.success({
                      title: '成功',
                      message: '添加管理员成功'
                    })
                  })
                }
              }
            } else {
              this.$message({
                message: '用户名长度为6-20个字符',
                type: 'warning'
              })
            }
          }
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      if (row.avatar) {
        var picUrl = []
        picUrl.push({
          url: row.avatar
        })
        this.picUrl = picUrl
      } else {
        this.picUrl = []
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.picUrl.length > 0) {
            this.dataForm.avatar = this.picUrl[0].url
          }
          updateAdmin(this.dataForm).then(() => {
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
      this.$confirm('是否删除管理员 ' + row.username + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAdmin({ id: row.id }).then(response => {
          this.list.splice(index, 1)
          this.$notify.success({
            title: '成功',
            message: '删除管理员成功'
          })
        })
      })
    },
    upProduct(index, row) {
      let str = ''
      if (row.status === 0) {
        str = '冻结'
      } else {
        str = '启用'
      }
      this.$confirm('是否' + str + '用户' + row.username + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        var setStatus = 0
        if (row.status === 0) {
          setStatus = 1
        }
        statusAdmin({ id: row.id, status: setStatus }).then(response => {
          row.status = setStatus
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
        })
      })
    }
  }
}
</script>

<style>
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
</style>
