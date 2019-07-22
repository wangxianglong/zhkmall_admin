<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入菜品名称"
      />
      <el-input
        v-model="listQuery.sn"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入菜品编号"
      />
      <el-button
        v-permission="['GET /admin/supper/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/supper/create']"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
      <!-- <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>-->
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
      <el-table-column align="center" width="90px" label="ID" prop="id" sortable/>
      <el-table-column align="center" label="菜品名称" prop="name"/>
      <el-table-column align="center" label="菜品编号" prop="supperSn"/>
      <el-table-column align="center" label="菜品图片">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" style="width: 50px;border-radius: 3px;">
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="120" label="关键字" prop="keywords"/>
      <el-table-column align="center" min-width="150" label="菜品简介" prop="brief"/>
      <el-table-column align="center" width="100px" label="零售价格" prop="retailPrice"/>
      <!-- <el-table-column align="center" width="100px" label="专柜价格" prop="counterPrice"/> -->
      <el-table-column align="center" width="100px" label="菜品库存" prop="number"/>
      <el-table-column align="center" width="110" label="是否上架" prop="isOnSale">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.isOnSale ? 'success' : 'error' "
          >{{ scope.row.isOnSale ? '在售' : '未售' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="操作"
        min-width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
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
          >上架</el-button>
          <el-button
            v-permission="['POST /admin/supper/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/supper/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(row)"
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="margin: 0 50px;"
      >
        <el-form-item label="菜品编号" prop="supperSn">
          <el-input v-model="temp.supperSn" placeholder="请输入菜品编号"/>
        </el-form-item>
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入菜品名称"/>
        </el-form-item>
        <el-form-item label="所属类目" prop="categoryId">
          <el-select v-model="temp.categoryId" class="filter-item" placeholder="请选择">
            <el-option
              v-for="(item, index) in categoryOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="零售价格" prop="retailPrice">
          <el-input-number v-model="temp.retailPrice" :min="0" size="mini">
            <template slot="append">元</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="菜品库存" prop="number">
          <el-input-number v-model="temp.number" :min="0" size="mini"/>
        </el-form-item>
        <el-form-item label="是否在售">
          <el-radio-group v-model="temp.isOnSale">
            <el-radio :label="true">在售</el-radio>
            <el-radio :label="false">未售</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜品图片">
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
        <el-form-item label="关键字">
          <el-tag
            v-for="tag in keywords"
            :key="tag"
            closable
            type="primary"
            style="margin-right: 10px;"
            @close="handleClose(tag)"
          >{{ tag }}</el-tag>
          <el-input
            v-if="newKeywordVisible"
            ref="newKeywordInput"
            v-model="newKeyword"
            class="input-new-keyword"
            placeholder="鼠标点击移出或回车创建"
            style="width: 200px;"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="button-new-keyword"
            size="small"
            type="primary"
            @click="showInput"
          >+ 增加</el-button>
        </el-form-item>
        <el-form-item label="菜品简介">
          <el-input
            v-model="temp.brief"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入菜品简介"
          />
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
import { getCategory, listSupper, upDownSupper, detSupper, delSupper, addSupper, editSupper } from '@/api/restaurant'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import oss from '@/utils/aliOss'
import { promptMessage } from '@/utils/index'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      newKeywordVisible: false,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        sn: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      categoryOptions: [],
      picUrl: [],
      keywords: [],
      temp: {
        id: undefined,
        categoryId: undefined,
        isOnSale: false,
        name: '',
        number: 0,
        retailPrice: 0,
        brief: '',
        keywords: '',
        supperSn: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      newKeyword: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      downloadLoading: false,
      rules: {
        supperSn: [
          { required: true, message: '请输入菜品编号', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入菜品名称', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择所属类目', trigger: 'change' }
        ],
        retailPrice: [
          { required: true, message: '请填写零售价格', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '请填写菜品库存', trigger: 'blur' }
        ]
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
      listSupper(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    getCategory() {
      getCategory().then(response => {
        this.categoryOptions = response.data.data
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
    showInput() {
      this.newKeywordVisible = true
      this.$nextTick(_ => {
        this.$refs.newKeywordInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const newKeyword = this.newKeyword.replace(/(^\s*)|(\s*$)/g, '')
      if (newKeyword) {
        this.keywords.push(newKeyword)
        this.temp.keywords = this.keywords.toString()
      }
      this.newKeywordVisible = false
      this.newKeyword = ''
    },
    handleClose(tag) {
      this.keywords.splice(this.keywords.indexOf(tag), 1)
      this.temp.keywords = this.keywords.toString()
    },
    handleSetStatus(row) {
      let str = ''
      if (row.isOnSale) {
        str = '下架'
      } else {
        str = '上架'
      }
      this.$confirm('是否' + str + '菜品' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        upDownSupper({ id: row.id, isOnSale: !row.isOnSale }).then(response => {
          row.isOnSale = !row.isOnSale
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
        })
      })
    },
    getDetail(id) {
      detSupper(id).then(res => {
        var data = res.data.data
        this.temp = data
        var picUrl = []
        picUrl.push({ url: data.picUrl })
        this.picUrl = picUrl
        if (data.keywords) {
          this.keywords = data.keywords.split(',')
        } else {
          this.keywords = []
        }
      })
    },
    handleCreate() {
      this.temp = {
        id: undefined,
        categoryId: undefined,
        isOnSale: false,
        name: '',
        number: 0,
        retailPrice: 0,
        brief: '',
        keywords: '',
        supperSn: ''
      }
      this.picUrl = []
      this.keywords = []
      this.getCategory()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.temp.name = this.temp.name.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.supperSn = this.temp.supperSn.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (promptMessage(Array, this.picUrl, '上传菜品图片')) {
            this.temp.picUrl = this.picUrl[0].url
            addSupper(this.temp).then((res) => {
              this.list.unshift(res.data.data)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    handleUpdate(row) {
      this.getCategory()
      this.getDetail(row.id)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.temp.name = this.temp.name.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.supperSn = this.temp.supperSn.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (promptMessage(Array, this.picUrl, '上传菜品图片')) {
            this.temp.picUrl = this.picUrl[0].url
            editSupper(this.temp).then((res) => {
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
        }
      })
    },
    handleDelete(row) {
      this.$confirm('是否删除菜品 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delSupper({ id: row.id }).then(response => {
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['用户ID', '用户名', '昵称', '头像', '性别', '生日', '状态', '注册时间', '最后登录时间']
        const filterVal = ['id', 'username', 'nickname', 'avatar', 'gender', 'birthday', 'status', 'addTime', 'lastLoginTime']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
