<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.id"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入类目ID"
      />
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入类目名称"
      />
      <el-button
        v-permission="['GET /admin/category/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>-->
      <el-button
        v-permission="['POST /admin/category/create']"
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
      <el-table-column align="center" label="ID" prop="id" />
      <el-table-column align="center" label="分类名称" prop="name" />
      <el-table-column align="center" property="iconUrl" label="分类图标">
        <template slot-scope="scope">
          <img :src="scope.row.icon" :alt="scope.row.name" style="width: 50px;border-radius: 3px;">
        </template>
      </el-table-column>
      <el-table-column align="center" label="关键字" prop="keywords" />
      <el-table-column align="center" min-width="150" label="描述" prop="description" />
      <el-table-column align="center" label="级别" prop="level">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.level === 0 ? 'primary' : 'info' "
          >{{ scope.row.level === 0 ? '一级' : '二级' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品数" prop="productCount" />
      <el-table-column align="center" label="商品单位" prop="productUnit" />
      <el-table-column align="center" label="导航栏显示">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.navStatus" active-color="#13ce66" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="显示状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.showStatus" active-color="#13ce66" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/category/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/category/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
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
        label-position="left"
        label-width="100px"
        style="margin:0 50px;"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="关键字" prop="keywords">
          <el-input v-model="dataForm.keywords" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="dataForm.level" @change="onLevelChange">
            <el-option label="一级分类" value="0" />
            <el-option label="二级分类" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="导航栏显示：" prop="navStatus">
          <el-select v-model="dataForm.navStatus" class="filter-item" placeholder="请选择">
            <el-option
              v-for="(item, index) in navStatus"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="显示状态：" prop="navStatus">
          <el-select v-model="dataForm.showStatus" class="filter-item" placeholder="请选择">
            <el-option
              v-for="(item, index) in navStatus"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品单位" prop="productUnit">
          <el-input v-model="dataForm.productUnit" placeholder="请输入商品单位" />
        </el-form-item>
        <el-form-item v-if="dataForm.level === 1" label="父类目" prop="pid">
          <el-select v-model="dataForm.pid">
            <el-option
              v-for="item in catL1"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类图标" prop="iconUrl">
          <el-upload
            :http-request="fnUploadRequest"
            :show-file-list="true"
            :file-list="iconUrl"
            :on-remove="handleRemove"
            :on-exceed="beyondFile"
            :limit="1"
            :before-upload="beforeAvatarUpload"
            list-type="picture-card"
            action
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dataForm.description" :rows="2" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import oss from '@/utils/aliOss'
import { listCategory, listCatL1, createCategory, updateCategory, deleteCategory } from '@/api/category'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'Category',
  components: { Pagination },
  data() {
    return {
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined
      },
      iconUrl: [],
      navStatus: ['不显示', '显示'],
      catL1: {},
      dataForm: {
        id: undefined,
        name: '',
        keywords: '',
        level: 'L2',
        pid: undefined,
        desc: '',
        iconUrl: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '类目名不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      listCategory(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
      })
      this.listLoading = false
    },
    getCatL1() {
      listCatL1().then(response => {
        this.catL1 = response.data.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    async fnUploadRequest(option) {
      oss.ossUploadFile(option).then(res => {
        this.iconUrl = [{ url: res.fileUrl }]
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
    // 删除图片
    handleRemove(file, fileList) {
      this.iconUrl = []
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
        name: '',
        keywords: '',
        level: 'L2',
        pid: undefined,
        desc: ''
      }
      this.iconUrl = []
    },
    onLevelChange(value) {
      if (value === 'L1') {
        this.pid = undefined
      }
    },
    handleCreate() {
      this.getCatL1()
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.dataForm.name = this.dataForm.name.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.iconUrl.length > 0) {
            this.dataForm.iconUrl = this.iconUrl[0].url
          }
          if (this.dataForm.level === 'L2') {
            if (this.dataForm.pid === 0 || this.dataForm.pid === undefined) {
              this.$message({
                message: '请选择父类目',
                type: 'warning'
              })
              return
            }
          }
          createCategory(this.dataForm).then(response => {
            this.list.unshift(response.data.data)
            // 更新L1目录
            this.getCatL1()
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '创建成功'
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.getCatL1()
      if (this.dataForm.iconUrl) {
        this.iconUrl = [{
          url: this.dataForm.iconUrl
        }]
      } else {
        this.iconUrl = []
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.dataForm.name = this.dataForm.name.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (this.iconUrl.length > 0) {
            this.dataForm.iconUrl = this.iconUrl[0].url
          } else {
            this.dataForm.iconUrl = ''
          }
          if (this.dataForm.level === 'L2') {
            if (this.dataForm.pid === 0) {
              this.$message({
                message: '请选择父类目',
                type: 'warning'
              })
              return
            }
          }
          updateCategory(this.dataForm).then(() => {
            for (const v of this.list) {
              if (v.id === this.dataForm.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.dataForm)
                break
              }
            }
            // 更新L1目录
            this.getCatL1()
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '更新成功'
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('是否删除类目 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCategory(row).then(response => {
          // 更新L1目录
          this.getCatL1()
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '类目ID',
          '名称',
          '关键字',
          '级别',
          '父类目ID',
          '类目图标',
          '类目图片',
          '简介'
        ]
        const filterVal = [
          'id',
          'name',
          'keywords',
          'level',
          'pid',
          'iconUrl',
          'desc'
        ]
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '商品类目信息'
        )
        this.downloadLoading = false
      })
    }
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>
