<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入店铺名称"
      />
      <el-button
        v-permission="['GET /admin/store/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/store/create']"
        class="filter-item"
        style="margin-left: 10px;"
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
      <el-table-column align="center" width="90px" label="ID" prop="id" sortable/>
      <el-table-column align="center" label="门店名称" prop="name"/>
      <el-table-column align="center" min-width="120" label="门店地址" prop="addressName"/>
      <el-table-column align="center" min-width="150" label="详细地址" prop="addressDetail"/>
      <el-table-column align="center" label="联系电话" prop="mobile"/>
      <el-table-column align="center" label="区域">
        <template slot-scope="{row}">
          <span>{{ row.province }}{{ row.city }}{{ row.district }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="餐厅配送">
        <template slot-scope="{row}">
          <el-switch
            v-permission="['POST /admin/store/isdining']"
            v-model="row.isDiningDelivery"
            active-color="#13ce66"
            @change="changeDining(row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="商城配送">
        <template slot-scope="{row}">
          <el-switch
            v-permission="['POST /admin/store/ismall']"
            v-model="row.isMallDelivery"
            active-color="#13ce66"
            @change="changeMall(row)"
          />
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" width="110" label="区域编码" prop="isOnSale">
        <template slot-scope="{row}">
          <span>{{ row.provinceCode }}{{ row.cityCode }}{{ row.districtCode }}</span>
        </template>
      </el-table-column>-->
      <el-table-column
        align="center"
        label="操作"
        min-width="180"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/store/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/store/delete']"
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="margin: 0 50px;"
      >
        <el-form-item label="门店名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入门店名称"/>
        </el-form-item>
        <el-form-item label="所在城市">
          <el-cascader
            ref="netAddr"
            v-model="netCityOption"
            :options="cityData"
            :props="optionProps"
            expand-trigger="hover"
            clearable
            filterable
            style="width: 50%;"
          />
        </el-form-item>
        <el-form-item label="快捷地址搜索">
          <el-col :span="8">
            <el-input v-model="adCity" placeholder="指定城市中文、全拼" style="width: 90%;"/>
          </el-col>
          <el-col :span="16">
            <el-select
              v-model="adSearch"
              :remote-method="remoteMethod"
              :loading="loading"
              filterable
              remote
              reserve-keyword
              style="width: 100%;"
              placeholder="请输入关键词搜索"
              @change="addressChange"
            >
              <el-option
                v-for="(item, index) in addressList"
                :key="index"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="门店地址" prop="addressName">
          <el-input v-model="temp.addressName" placeholder="请输入门店地址"/>
        </el-form-item>
        <el-form-item label="详细地址" prop="addressDetail">
          <el-input v-model="temp.addressDetail" placeholder="请输入详细地址"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="mobile">
          <el-input v-model="temp.mobile" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="经纬度" prop="location">
          <span>{{ temp.location }}</span>
        </el-form-item>
        <el-form-item label="餐厅配送">
          <el-switch v-model="temp.isDiningDelivery" active-color="#13ce66"/>
        </el-form-item>
        <el-form-item label="商城配送">
          <el-switch v-model="temp.isMallDelivery" active-color="#13ce66"/>
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
import { listStore, delStore, addStore, editStore, mapSearch, storeToDining, storeToMall } from '@/api/platform'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { promptMessage } from '@/utils/index'
import * as city from '@/utils/city-data'
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'StoreManage',
  components: { Pagination },
  data() {
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
      optionProps: {
        value: 'label',
        label: 'label',
        children: 'children'
      },
      cityData: city.cityInfo,
      netCityOption: [],
      adCity: '',
      temp: {
        id: undefined,
        addressDetail: '',
        addressName: '',
        city: '',
        district: '',
        location: '',
        mobile: undefined,
        name: '',
        province: '',
        isDiningDelivery: false,
        isMallDelivery: false
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      addressList: [],
      adSearch: [],
      loading: false,
      rules: {
        addressDetail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入门店名称', trigger: 'blur' }
        ],
        addressName: [
          { required: true, message: '请输入门店地址', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请搜索地址获取', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
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
      listStore(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        mapSearch({ keywords: query, city: this.adCity }).then(res => {
          this.loading = false
          this.addressList = res.data.data
        })
      } else {
        this.addressList = []
      }
    },
    addressChange(val) {
      this.addressList.forEach(item => {
        if (val === item.name) {
          this.temp.addressName = item.name
          this.temp.addressDetail = item.address
          this.temp.location = item.location
          var option = []
          option.push(item.province)
          option.push(item.city)
          option.push(item.district)
          this.netCityOption = option
        }
      })
    },
    changeDining(row) {
      var desc = '关闭'
      if (row.isDiningDelivery) {
        desc = '开启'
      }
      this.$confirm(`${row.name}是否${desc}餐厅配送?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        storeToDining({ id: row.id, isDiningDelivery: row.isDiningDelivery }).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        })
      }).catch(() => {
        row.isDiningDelivery = !row.isDiningDelivery
      })
    },
    changeMall(row) {
      var desc = '关闭'
      if (row.isMallDelivery) {
        desc = '开启'
      }
      this.$confirm(`${row.name}是否${desc}商城配送?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        storeToMall({ id: row.id, isMallDelivery: row.isMallDelivery }).then(res => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        })
      }).catch(() => {
        row.isMallDelivery = !row.isMallDelivery
      })
    },
    handleCreate() {
      this.temp = {
        addressDetail: '',
        addressName: '',
        city: '',
        district: '',
        location: '',
        mobile: undefined,
        name: '',
        province: '',
        isDiningDelivery: false,
        isMallDelivery: false
      }
      this.netCityOption = []
      this.adCity = ''
      this.adSearch = []
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.temp.name = this.temp.name.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.addressName = this.temp.addressName.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.addressDetail = this.temp.addressDetail.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.location = this.temp.location.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.mobile = this.temp.mobile.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (promptMessage(Array, this.netCityOption, '选择所在城市')) {
            this.temp.province = this.netCityOption[0]
            this.temp.city = this.netCityOption[1]
            this.temp.district = this.netCityOption[2]
            addStore(this.temp).then((res) => {
              this.getList()
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
      var option = []
      option.push(row.province)
      option.push(row.city)
      option.push(row.district)
      this.netCityOption = option
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.temp.name = this.temp.name.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.addressName = this.temp.addressName.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.addressDetail = this.temp.addressDetail.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.location = this.temp.location.replace(/(^\s*)|(\s*$)/g, '')
      this.temp.mobile = this.temp.mobile.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (promptMessage(Array, this.netCityOption, '选择所在城市')) {
            this.temp.province = this.netCityOption[0]
            this.temp.city = this.netCityOption[1]
            this.temp.district = this.netCityOption[2]
            editStore(this.temp).then((res) => {
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
        delStore({ id: row.id }).then(response => {
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
