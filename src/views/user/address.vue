<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.userId"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入用户ID"
      />
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入收货人名称"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <!-- <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button> -->
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
      <el-table-column align="center" width="90px" label="地址ID" prop="id" sortable/>
      <el-table-column align="center" width="90px" label="用户ID" prop="userId" sortable/>
      <el-table-column align="center" width="110px" label="收货人名称" prop="name"/>
      <el-table-column align="center" label="收货人性别">
        <template slot-scope="scope">
          <el-tag :type="statusType[scope.row.gender]">{{ genderDic[scope.row.gender] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="100px" label="手机号码" prop="mobile"/>
      <el-table-column align="center" min-width="100px" label="省市区">
        <template slot-scope="scope">{{ scope.row.province + scope.row.city + scope.row.district }}</template>
      </el-table-column>
      <el-table-column align="center" min-width="200px" label="详细地址" prop="addressDetail"/>
      <el-table-column align="center" min-width="200px" label="收货地址" prop="addressName"/>
      <el-table-column align="center" width="110px" label="邮政编码">
        <template slot-scope="scope">{{ scope.row.provinceCode + scope.row.cityCode + scope.row.districtCode }}</template>
      </el-table-column>
      <!-- <el-table-column align="center" width="100px" label="默认地址">
        <template slot-scope="scope">
          <el-tag :type="scope.row.default ? 'success' : 'info'">{{ scope.row.default ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="viewLocation(row.location)">查看位置</el-button>
        </template>
      </el-table-column>-->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listAddress } from '@/api/user'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'UserAddress',
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
        userId: undefined
      },
      genderDic: ['未知', '男', '女'],
      statusType: ['info', '', 'danger'],
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listAddress(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    viewLocation(row) {
      console.log(row.location)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['地址ID', '用户ID', '收获人', '手机号', '省', '市', '区', '地址', '是否默认']
        const filterVal = ['id', 'userId', 'name', 'mobile', 'province', 'city', 'area', 'address', 'isDefault']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '用户地址信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>
