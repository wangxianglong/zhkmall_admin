<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入广告标题"
      />
      <el-button
        v-permission="['GET /admin/ad/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/ad/create']"
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      size="small"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" width="100px" label="ID" prop="id" sortable/>
      <el-table-column align="center" label="广告标题" prop="name"/>
      <el-table-column align="center" min-width="120" label="内容" prop="content"/>
      <el-table-column align="center" label="宣传图片">
        <template slot-scope="scope">
          <img :src="scope.row.url" style="width: 50px;border-radius: 3px;">
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="120" label="链接地址" prop="link"/>
      <el-table-column align="center" label="广告位置">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.position | formatPosition }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="开始时间" prop="startTime"/>
      <el-table-column align="center" label="结束时间" prop="endTime"/>
      <el-table-column align="center" width="100" label="是否启用">
        <template slot-scope="{row}">
          <el-switch
            v-permission="['POST /admin/ad/status']"
            v-model="row.enabled"
            active-color="#13ce66"
            @change="changeStart(row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/ad/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/ad/delete']"
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
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    /> -->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="margin: 0 50px;"
      >
        <el-form-item label="广告标题" prop="name">
          <el-input v-model="temp.name" placeholder="请输入广告标题"/>
        </el-form-item>
        <el-form-item label="链接地址" prop="link">
          <el-input v-model="temp.link" placeholder="请输入链接地址"/>
        </el-form-item>
        <el-form-item label="宣传图片">
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
        <el-form-item label="内容">
          <el-input
            v-model="temp.content"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="广告位置">
          <el-select v-model="temp.position" placeholder="请选择">
            <el-option
              v-for="item in positionAd"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="temp.enabled"/>
        </el-form-item>
        <el-form-item label="广告期限">
          <el-date-picker
            v-model="validTime"
            :picker-options="pickerOptions"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            value-format="yyyy-MM-dd hh:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="selectValidTime"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createData('dataForm'):updateData('dataForm')"
        >确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSlide, delSlide, addSlide, editSlide, statusSlide } from '@/api/platform'
import oss from '@/utils/aliOss'
import { pickerOptions, promptMessage } from '@/utils/index'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'User',
  filters: {
    formatPosition(position) {
      if (position === 1) {
        return '商城'
      } else if (position === 2) {
        return '餐厅'
      }
    }
  },
  data() {
    var linkToVerify = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('链接地址不能为空'))
      } else {
        var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
        if (!reg.test(value)) {
          return callback(new Error('请输入正确链接地址！'))
        }
        callback()
      }
    }
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      positionAd: [{ label: '商城', value: 1 }, { label: '餐厅', value: 2 }],
      picUrl: [],
      pickerOptions,
      validTime: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      temp: {
        id: undefined,
        content: '',
        enabled: false,
        endTime: '',
        link: '',
        name: '',
        position: 1,
        startTime: '',
        url: ''
      },
      rules: {
        link: [
          { validator: linkToVerify, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入门店名称', trigger: 'blur' }
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
      listSlide(this.listQuery).then(response => {
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
    selectValidTime(val) {
      this.temp.startTime = val[0]
      this.temp.endTime = val[1]
    },
    changeStart(row) {
      var desc = '关闭'
      if (row.enabled) {
        desc = '开启'
      }
      this.$confirm(`是否${desc}${row.name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        statusSlide({ id: row.id, enabled: row.enabled }).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        })
      }).catch(() => {
        row.enabled = !row.enabled
      })
    },
    handleCreate() {
      this.temp = {
        content: '',
        enabled: false,
        endTime: '',
        link: '',
        name: '',
        position: 1,
        startTime: '',
        url: ''
      }
      this.picUrl = []
      this.validTime = []
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData(formName) {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          if (promptMessage(Array, this.picUrl, '上传菜品图片')) {
            this.temp.url = this.picUrl[0].url
            addSlide(this.temp).then((res) => {
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
      this.temp = Object.assign({}, row)
      if (row.url) {
        var picUrl = []
        picUrl.push({ url: row.url })
        this.picUrl = picUrl
      } else {
        this.picUrl = []
      }
      var time = []
      time.push(row.startTime)
      time.push(row.endTime)
      this.validTime = time
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (promptMessage(Array, this.picUrl, '上传菜品图片')) {
            this.temp.url = this.picUrl[0].url
            editSlide(this.temp).then((res) => {
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
    handleDelete(index, row) {
      this.$confirm('是否删除门店 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delSlide({ id: row.id }).then(response => {
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
