<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.key"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入对象KEY"
      />
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入对象名称"
      />
      <el-button
        v-permission="['GET /admin/storage/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/storage/create']"
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
      <!-- <el-button :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">导出</el-button> -->
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
      <el-table-column align="center" label="对象KEY" prop="key"/>

      <el-table-column align="center" label="对象名称" prop="name"/>

      <el-table-column align="center" label="对象类型" prop="type"/>

      <el-table-column align="center" label="对象大小" prop="size"/>

      <el-table-column align="center" property="url" label="图片">
        <template slot-scope="scope">
          <img :src="scope.row.url" width="40">
        </template>
      </el-table-column>

      <el-table-column align="center" label="图片链接" prop="url"/>

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/storage/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/storage/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    /> -->

    <!-- 添加对话框 -->
    <el-dialog :visible.sync="createDialogVisible" title="上传对象">
      <!-- <el-upload :show-file-list="false" :limit="1" :http-request="handleUpload" action="#" list-type="picture">
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>-->
      <!-- <el-upload
        action="上传路径"
        list-type="text"
        :file-list="fileList"
        :before-upload="beforeAvatarUpload"
        :http-request="Upload"
        :show-file-list="false"
      >
        <div class="btn_upload">上传图片</div>
      </el-upload>-->
      <el-upload
        :http-request="Upload"
        :show-file-list="true"
        :file-list="fileList"
        :on-remove="handleRemove"
        :on-exceed="beyondFile"
        :limit="9"
        :before-upload="beforeAvatarUpload"
        list-type="picture-card"
        action
      >
        <i class="el-icon-plus"/>
      </el-upload>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :visible.sync="updateDialogVisible" title="修改对象名称">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="对象名称" prop="name">
          <el-input v-model="dataForm.name"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listStorage, createStorage, updateStorage, deleteStorage } from '@/api/storage'
import axios from 'axios'

export default {
  name: 'Storage',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      fileList: [],
      uploadPercent: 0,
      createDialogVisible: false,
      dataForm: {
        id: undefined,
        name: ''
      },
      updateDialogVisible: false,
      rules: {
        name: [{ required: true, message: '对象名称不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listStorage(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
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
    Upload(file) {
      // 先要获取后端签名
      const pro = new Promise((resolve, rej) => {
        axios.get('http://192.168.1.5:8080/common/storage/verify/web').then(res => {
          resolve(res.data.data)
        })
      })
      pro.then(success => {
        var data = success
        var ossData = new FormData()
        var dir = data.dir
        // ossData.append('name', file.file.name)
        ossData.append(
          'key',
          data.dir + file.file.name
        )
        ossData.append('policy', data.policy)
        ossData.append('OSSAccessKeyId', data.accessKeyId)
        ossData.append('success_action_status', 200)
        ossData.append('signature', data.signature)
        ossData.append('file', file.file, file.file.name)
        axios.post('http://cwx-mall.oss-cn-hangzhou.aliyuncs.com/', ossData).then(res => {
          this.fileList.push({
            name: file.file.name,
            url: res.config.url + dir + file.file.name
          })
          console.log(this.fileList)
        })
      })
    },
    // 删除图片
    handleRemove(file, fileList) {
      console.log(file)
      this.fileList.forEach((item, index) => {
        if (item.name === file.name) {
          this.fileList.splice(index, 1)
        }
      })
      console.log(this.fileList)
    },
    // 添加多个文件事件
    beyondFile(files, fileList) {
      this.$message({
        message: '最多上传' + fileList.length + '张图片',
        type: 'error'
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: ''
      }
    },
    handleCreate() {
      this.fileList = []
      this.createDialogVisible = true
    },
    handleUpload(item) {
      const formData = new FormData()
      formData.append('file', item.file)
      createStorage(formData).then(response => {
        this.list.unshift(response.data.data)
        this.createDialogVisible = false
        this.$notify.success({
          title: '成功',
          message: '上传成功'
        })
      }).catch(() => {
        this.$message.error('上传失败，请重新上传')
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.updateDialogVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateStorage(this.dataForm).then(() => {
            for (const v of this.list) {
              if (v.id === this.dataForm.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.dataForm)
                break
              }
            }
            this.updateDialogVisible = false
            this.$notify.success({
              title: '成功',
              message: '更新成功'
            })
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleDelete(row) {
      deleteStorage(row).then(response => {
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
        const index = this.list.indexOf(row)
        this.list.splice(index, 1)
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '对象KEY', '对象名称', '对象类型', '对象大小', '访问链接']
        const filterVal = ['id', 'key', 'name', 'type', 'size', 'url']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '对象存储信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
