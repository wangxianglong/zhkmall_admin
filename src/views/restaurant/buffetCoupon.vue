<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入自助餐券名称"
      />
      <el-select
        v-model="listQuery.status"
        clearable
        style="width: 200px"
        class="filter-item"
        placeholder="请选择优惠券状态"
      >
        <el-option
          v-for="type in statusOptions"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      <el-button
        v-permission="['GET /admin/buffetcoupon/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/buffetcoupon/create']"
        class="filter-item"
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
      <el-table-column align="center" width="110" label="优惠券名称" prop="name"/>
      <el-table-column align="center" min-width="120" label="门店地址" prop="address"/>
      <el-table-column align="center" width="110" label="联系电话" prop="mobile"/>
      <!-- <el-table-column align="center" min-width="120" label="商家介绍" prop="desc"/> -->
      <el-table-column align="center" width="110" label="优惠券类型" prop="type">
        <template slot-scope="scope">{{ scope.row.type | formatType }}</template>
      </el-table-column>
      <el-table-column align="center" width="100" label="售价" prop="price"/>
      <el-table-column align="center" width="110" label="优惠券数量" prop="total">
        <template slot-scope="scope">{{ scope.row.total != 0 ? scope.row.total : "不限" }}</template>
      </el-table-column>
      <el-table-column align="center" label="每人限领" prop="limit">
        <template slot-scope="scope">{{ scope.row.limit != 0 ? scope.row.limit : "不限" }}</template>
      </el-table-column>
      <!-- <el-table-column align="center" label="温馨提示" prop="hint"/>
      <el-table-column align="center" label="使用规则" prop="rule"/>-->
      <el-table-column align="center" min-width="140" label="有效时间">
        <template slot-scope="{row}">
          <span v-if="row.timeType === 0">无限期</span>
          <span v-else-if="row.timeType === 1">{{ row.days }} 天</span>
          <span v-else>{{ row.startTime }} - {{ row.endTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | formatStatusType">{{ scope.row.status | formatStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="操作"
        min-width="300"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
            v-permission="['POST /admin/buffetcoupon/standUpAndDown']"
            v-if="row.status!== 1"
            size="mini"
            type="success"
            @click="handleModifyStatus(row, 1)"
          >上架</el-button>
          <el-button
            v-permission="['POST /admin/buffetcoupon/standUpAndDown']"
            v-if="row.status!== 0"
            size="mini"
            type="warning"
            @click="handleModifyStatus(row, 0)"
          >下架</el-button>
          <el-button
            v-permission="['POST /admin/buffetcoupon/standUpAndDown']"
            v-if="row.status!== 2"
            size="mini"
            type="info"
            @click="handleModifyStatus(row, 2)"
          >过期</el-button>
          <el-button
            v-permission="['POST /admin/buffetcoupon/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/buffetcoupon/delete']"
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

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="margin: 0 50px;"
      >
        <el-form-item label="餐券名称" prop="name">
          <el-input v-model="dataForm.name" placeholder="请输入餐券名称"/>
        </el-form-item>
        <el-form-item label="门店地址" prop="address">
          <el-input v-model="dataForm.address" placeholder="请输入门店地址"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="mobile">
          <el-input v-model="dataForm.mobile" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="商家介绍" prop="desc">
          <el-input
            v-model="dataForm.desc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入商家介绍"
          />
        </el-form-item>
        <!-- <el-form-item label="餐券状态" prop="type">
          <el-select v-model="dataForm.status" placeholder="请选择">
            <el-option
              v-for="type in statusOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>-->
        <el-form-item label="餐券类型" prop="type">
          <el-select v-model="dataForm.type" placeholder="请选择">
            <el-option
              v-for="type in typeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="dataForm.type === 0" label="售价">
          <el-input-number v-model="dataForm.price" :min="0"/>
        </el-form-item>
        <el-form-item label="餐券数量" prop="total">
          <el-input v-model="dataForm.total" type="number" placeholder="0为无限量">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="每人限领" prop="limit">
          <el-input v-model="dataForm.limit" type="number" placeholder="0为不限制">
            <template slot="append">张</template>
          </el-input>
        </el-form-item>
        <el-form-item label="温馨提示">
          <el-tag
            v-for="tag in hintArr"
            :key="tag"
            closable
            type="primary"
            style="margin-right: 10px;height: auto; white-space: normal;"
            @close="handleClose(tag, 'hint')"
          >{{ tag }}</el-tag>
          <el-input
            v-if="newKeywordVisible"
            ref="newKeywordInput"
            v-model="newKeyword"
            class="input-new-keyword"
            placeholder="鼠标点击移出或回车创建"
            style="width: 200px;"
            size="small"
            @keyup.enter.native="handleInputConfirm('hint')"
            @blur="handleInputConfirm('hint')"
          />
          <el-button
            v-else
            class="button-new-keyword"
            size="small"
            type="primary"
            @click="showInput('hint')"
          >+ 增加</el-button>
        </el-form-item>
        <el-form-item label="使用规则">
          <el-tag
            v-for="tag in ruleArr"
            :key="tag"
            closable
            type="primary"
            style="margin-right: 10px;height: auto; white-space: normal;"
            @close="handleClose(tag, 'rule')"
          >{{ tag }}</el-tag>
          <el-input
            v-if="newRuleVisible"
            ref="newRuleInput"
            v-model="newRule"
            class="input-new-keyword"
            placeholder="鼠标点击移出或回车创建"
            style="width: 200px;"
            size="small"
            @keyup.enter.native="handleInputConfirm('rule')"
            @blur="handleInputConfirm('rule')"
          />
          <el-button
            v-else
            class="button-new-keyword"
            size="small"
            type="primary"
            @click="showInput('rule')"
          >+ 增加</el-button>
        </el-form-item>
        <el-form-item label="有效时间类型">
          <el-select v-model="dataForm.timeType" placeholder="请选择">
            <el-option
              v-for="item in timeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-show="dataForm.timeType === 1" label="有效天数">
          <el-input v-model="dataForm.days" placeholder="请输入有效天数">
            <template slot="append">天</template>
          </el-input>
        </el-form-item>
        <el-form-item v-show="dataForm.timeType === 2">
          <el-date-picker
            v-model="validTime"
            :picker-options="pickerOptions"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="selectValidTime"
          />
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
import { listCoupon, addCoupon, editCoupon, delCoupon, upDownCoupon } from '@/api/restaurant'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { pickerOptions, promptMessage } from '@/utils/index'
import checkPermission from '@/utils/permission' // 权限判断函数

const defaultTypeOptions = [
  {
    label: '自助餐券',
    value: 0
  },
  {
    label: '敬老券',
    value: 1
  }
]

const defaultStatusOptions = [
  {
    label: '下架',
    value: 0
  },
  {
    label: '上架',
    value: 1
  },
  {
    label: '已过期',
    value: 2
  }
]

export default {
  name: 'Coupon',
  components: { Pagination },
  filters: {
    formatType(type) {
      for (let i = 0; i < defaultTypeOptions.length; i++) {
        if (type === defaultTypeOptions[i].value) {
          return defaultTypeOptions[i].label
        }
      }
      return ''
    },
    formatStatus(status) {
      if (status === 0) {
        return '下架'
      } else if (status === 1) {
        return '上架'
      } else {
        return '已过期'
      }
    },
    formatStatusType(status) {
      if (status === 0) {
        return 'warning'
      } else if (status === 1) {
        return ''
      } else {
        return 'info'
      }
    }
  },
  data() {
    return {
      pickerOptions: pickerOptions,
      typeOptions: Object.assign({}, defaultTypeOptions),
      statusOptions: Object.assign({}, defaultStatusOptions),
      list: undefined,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        type: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      timeOptions: [{
        value: 0,
        label: '永久有效'
      }, {
        value: 1,
        label: '基于领取时间的有效天数'
      }, {
        value: 2,
        label: '有效期'
      }],
      dataForm: {
        id: undefined,
        name: undefined,
        desc: undefined,
        address: '',
        hint: '',
        limit: undefined,
        mobile: '',
        price: 0,
        rule: '',
        status: 0,
        timeType: 0,
        total: undefined,
        type: 0,
        days: 0,
        startTime: null,
        endTime: null
      },
      hintArr: [],
      newKeywordVisible: false,
      newKeyword: '',
      newRule: '',
      ruleArr: [],
      newRuleVisible: false,
      validTime: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [
          { required: true, message: '请填写餐券标题', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请填写门店地址', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '请填写商家介绍', trigger: 'blur' }
        ],
        limit: [
          { required: true, message: '请填写领券限制数量', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ],
        total: [
          { required: true, message: '请填写餐券数量', trigger: 'blur' }
        ]
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
      listCoupon(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      var params = {
        id: row.id,
        status: status
      }
      upDownCoupon(params).then(res => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.getList()
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        name: undefined,
        desc: undefined,
        address: '',
        hint: '',
        limit: undefined,
        mobile: '',
        price: 0,
        rule: '',
        status: 0,
        timeType: 0,
        total: undefined,
        type: 0,
        days: 0,
        startTime: null,
        endTime: null
      }
      this.ruleArr = []
      this.hintArr = []
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
      this.dataForm.name = this.dataForm.name.replace(/(^\s*)|(\s*$)/g, '')
      this.dataForm.address = this.dataForm.address.replace(/(^\s*)|(\s*$)/g, '')
      this.dataForm.desc = this.dataForm.desc.replace(/(^\s*)|(\s*$)/g, '')
      this.dataForm.mobile = this.dataForm.mobile.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          if (promptMessage(String, this.dataForm.hint, '添加温馨提示')) {
            if (promptMessage(String, this.dataForm.rule, '添加使用规则')) {
              addCoupon(this.dataForm).then(response => {
                this.getList()
                this.dialogFormVisible = false
                this.$notify.success({
                  title: '成功',
                  message: '创建优惠券成功'
                })
              })
            }
          }
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      var time = []
      if (row.startTime) {
        time.push(row.startTime)
        time.push(row.endTime)
      }
      this.validTime = time
      this.hintArr = row.hint.split('|')
      this.ruleArr = row.rule.split('|')
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.dataForm.name = this.dataForm.name.replace(/(^\s*)|(\s*$)/g, '')
      this.dataForm.address = this.dataForm.address.replace(/(^\s*)|(\s*$)/g, '')
      this.dataForm.desc = this.dataForm.desc.replace(/(^\s*)|(\s*$)/g, '')
      this.dataForm.mobile = this.dataForm.mobile.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          editCoupon(this.dataForm).then((res) => {
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
              message: '更新优惠券成功'
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('是否删除优惠券 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delCoupon({ id: row.id }).then(response => {
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
          this.$notify.success({
            title: '成功',
            message: '删除优惠券成功'
          })
        })
      })
    },
    handleInputConfirm(type) {
      if (type === 'rule') {
        const newRule = this.newRule.replace(/(^\s*)|(\s*$)/g, '')
        if (newRule) {
          this.ruleArr.push(newRule)
          this.dataForm.rule = this.ruleArr.join('|')
        }
        this.newRuleVisible = false
        this.newRule = ''
      } else {
        const newKeyword = this.newKeyword.replace(/(^\s*)|(\s*$)/g, '')
        if (newKeyword) {
          this.hintArr.push(newKeyword)
          this.dataForm.hint = this.hintArr.join('|')
        }
        this.newKeywordVisible = false
        this.newKeyword = ''
      }
    },
    handleClose(tag, type) {
      if (type === 'rule') {
        this.ruleArr.splice(this.ruleArr.indexOf(tag), 1)
        this.dataForm.rule = this.ruleArr.toString()
      } else {
        this.hintArr.splice(this.hintArr.indexOf(tag), 1)
        this.dataForm.hint = this.hintArr.toString()
      }
    },
    showInput(type) {
      if (type === 'rule') {
        this.newRuleVisible = true
        this.$nextTick(_ => {
          this.$refs.newRuleInput.$refs.input.focus()
        })
      } else {
        this.newKeywordVisible = true
        this.$nextTick(_ => {
          this.$refs.newKeywordInput.$refs.input.focus()
        })
      }
    },
    selectValidTime() {
      this.dataForm.startTime = this.validTime[0]
      this.dataForm.endTime = this.validTime[1]
    },
    handleDetail(row) {
      this.$router.push({
        path: '/promotion/couponDetail',
        query: { id: row.id }
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '优惠券ID',
          '名称',
          '内容',
          '标签',
          '最低消费',
          '减免金额',
          '每人限领',
          '优惠券数量'
        ]
        const filterVal = [
          'id',
          'name',
          'desc',
          'tag',
          'min',
          'discount',
          'limit',
          'total'
        ]
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '优惠券信息')
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
  width: 120px;
  height: 120px;
  display: block;
}
</style>
