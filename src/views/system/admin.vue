<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>筛选搜索</span>
        <el-button style="float: right" @click="handleSearchList()" type="primary" size="small">查询结果</el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input
              v-model="listQuery.name"
              clearable
              style="width: 203px;"
              placeholder="请输入用户名"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleCreate" size="mini">添加</el-button>
    </el-card>

    <!-- 查询结果 -->
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        :data="list"
        size="small"
        element-loading-text="正在查询中。。。"
        border
        fit
        highlight-current-row
      >
        <!-- <el-table-column align="center" width="100px" label="用户ID" prop="id" sortable /> -->
        <el-table-column align="center" width="100" label="用户名" prop="username" />
        <el-table-column align="center" width="100" label="昵称" prop="nickName" />
        <el-table-column align="center" width="100" label="性别" prop="gender">
          <template slot-scope="scope">
            <el-tag>{{ genderMap[scope.row.gender] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="电话" prop="phone" />
        <el-table-column align="center" label="邮箱" prop="email" />
        <el-table-column align="center" label="公司" prop="company" />
        <el-table-column align="center" label="所在地址" prop="address" />
        <el-table-column align="center" label="头像">
          <template slot-scope="scope">
            <img :src="scope.row.icon" style="width: 50px;border-radius: 50%;" alt="头像" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" width="100" prop="status">
          <template slot-scope="scope">
            <el-tag>{{ statusDic[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注信息" prop="note" />
        <el-table-column align="center" label="创建时间" min-width="90" prop="createTime" />
        <el-table-column align="center" label="最后登录时间" min-width="90" prop="loginTime" />
        <el-table-column
          align="center"
          label="操作"
          width="180"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :current-page.sync="listQuery.pageNum"
        :total="total"
      ></el-pagination>
    </div>

    <el-dialog :visible.sync="dialogFormVisible" :title="textMap[dialogStatus]">
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
        <el-form-item label="密码：" prop="password">
          <el-input placeholder="请输入密码" v-model="temp.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="昵称：" prop="nickName">
          <el-input v-model="temp.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="性别：" prop="gender">
          <el-select v-model="temp.gender" class="filter-item" placeholder="请选择">
            <el-option
              v-for="(item, key) in genderMap"
              :key="key"
              :label="item"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="电话：" prop="phone">
          <el-input type="number" v-model="temp.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="temp.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="公司：" prop="company">
          <el-input v-model="temp.company" placeholder="请输入公司" />
        </el-form-item>
        <el-form-item label="所在地址：" prop="address">
          <el-input v-model="temp.address" placeholder="请输入所在地址" />
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
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchDel, fetchEdit, fetchAdd } from '@/api/user'
import { resolvingDate } from '@/utils/index'
import oss from '@/utils/aliOss'

export default {
  name: 'User',
  data() {
    var checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机号不能为空'));
      } else {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
        console.log(reg.test(value));
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error('请输入正确的手机号'));
        }
      }
    }
    return {
      list: null,
      total: 0,
      listLoading: true,
      dialogFormVisible: false,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
      },
      temp: {
        id: undefined,
        address: '',
        company: '',
        email: '',
        phone: '',
        gender: 0,
        icon: '',
        nickName: '',
        note: '',
        password: '',
        status: 1,
        username: ''
      },
      picUrl: [],
      statusDic: ['禁用', '启用'],
      genderMap: { 0: '未知', 1: '男', 3: '女' },
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){6,20}$/, message: '密码长度为 6 - 20位' }
        ],
        phone: [{ validator: checkPhone, trigger: 'blur' }],
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
        let data = response.data.list
        data.forEach(item => {
          item.createTime = resolvingDate(item.createTime)
          item.loginTime = resolvingDate(item.loginTime)
        })
        this.list = data
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleSearchList() {
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
    resetForm() {
      this.temp = {
        address: '',
        company: '',
        email: '',
        phone: '',
        gender: 0,
        nickName: '',
        note: '',
        password: '',
        status: 1,
        username: ''
      }
      this.picUrl = []
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
          this.temp.icon = this.picUrl[0] ? this.picUrl[0].url : ''
          fetchAdd(this.temp).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '添加管理员成功',
              duration: 1500
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.temp.password = ''
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
          let params = Object.assign({}, this.temp)
          delete params.createTime
          delete params.loginTime
          fetchEdit(this.temp.id, params).then(res => {
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
      this.$confirm('是否删除管理员 ' + row.username + ' ?', '提示', {
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
