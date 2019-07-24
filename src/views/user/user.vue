<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户名"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
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
      <el-table-column align="center" width="100px" label="用户ID" prop="id" sortable />
      <el-table-column align="center" label="用户名" prop="username" />
      <el-table-column align="center" label="昵称" prop="nickName" />
      <el-table-column align="center" label="邮箱" prop="email" />
      <el-table-column align="center" label="头像">
        <template slot-scope="scope">
          <img :src="scope.row.icon" style="width: 50px;border-radius: 50%;" alt="头像" >
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag>{{ statusDic[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注信息" prop="note" />
      <el-table-column align="center" label="创建时间" min-width="130" prop="createTime" />
      <el-table-column align="center" label="最后登录时间" min-width="130" prop="loginTime" />
      <el-table-column align="center" label="操作" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <!-- <el-button
            v-permission="['POST /admin/supper/standUpAndDown']"
            v-if="row.isOnSale"
            size="mini"
            type="info"
            @click="handleSetStatus(row)"
          >下架</el-button>
          <el-button
            v-permission="['POST /admin/supper/standUpAndDown']"
            v-else
            size="mini"
            type="primary"
            @click="handleSetStatus(row)"
          >上架</el-button>-->
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page-num.sync="listQuery.pageNum"
      :page-size.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogFormVisible" title="编辑">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="90px"
        style="margin: 0 50px;"
      >
        <el-form-item label="头像：">
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
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名：" prop="username">
          <el-input v-model="temp.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称：" prop="nickName">
          <el-input v-model="temp.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="temp.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择">
            <el-option
              v-for="(item, index) in statusDic"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注信息：" prop="note">
          <el-input v-model="temp.note" :rows="2" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchDel, fetchEdit } from '@/api/user'
import oss from '@/utils/aliOss'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      dialogFormVisible: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined
      },
      temp: {
        id: undefined,
        createTime: '',
        email: '',
        icon: '',
        loginTime: '',
        nickName: '',
        note: '',
        password: '',
        status: undefined,
        username: ''
      },
      picUrl: [],
      statusDic: ['禁用', '启用'],
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择账号状态', trigger: 'change' }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    async fnUploadpicUrl(option) {
      oss.ossUploadFile(option).then(res => {
        this.picUrl = [{ url: res.fileUrl }]
      })
    },
    beforeAvatarUpload(file) {
      let isIMAGE = false
      if (
        file.type === 'image/jpeg' ||
        file.type === 'image/gif' ||
        file.type === 'image/png'
      ) {
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      var picUrl = []
      picUrl.push({ url: row.icon })
      this.picUrl = picUrl
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.temp.icon = this.picUrl[0].url
          fetchEdit(this.temp.id, this.temp).then(res => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('是否删除用户 ' + row.username + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        fetchDel(row.id).then(response => {
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
