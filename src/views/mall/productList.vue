<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.goodsSn"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入商品编号"
      />
      <el-input
        v-model="listQuery.name"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入商品名称"
      />
      <el-button
        v-permission="['GET /admin/goods/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /admin/goods/create']"
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
      <el-table-column align="center" width="100" label="ID" prop="id"/>
      <el-table-column align="center" width="100" label="商品编号" prop="goodsSn"/>
      <el-table-column align="center" label="商品名称" prop="name"/>
      <el-table-column align="center" min-width="150" label="商品简介" prop="brief"/>
      <el-table-column align="center" min-width="100" label="关键字" prop="keywords"/>
      <el-table-column align="center" property="iconUrl" label="图片">
        <template slot-scope="scope">
          <img :src="scope.row.picUrl" style="width: 50px;border-radius: 3px;">
        </template>
      </el-table-column>
      <el-table-column align="center" label="专柜价格" prop="counterPrice"/>
      <el-table-column align="center" label="零售价格" prop="retailPrice"/>
      <el-table-column align="center" label="商品单位" prop="unit"/>
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
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/goods/standUpAndDown']"
            v-if="scope.row.isOnSale"
            size="mini"
            type="info"
            @click="upProduct(scope.$index, scope.row)"
          >下架</el-button>
          <el-button
            v-permission="['POST /admin/goods/standUpAndDown']"
            v-else
            size="mini"
            type="primary"
            @click="upProduct(scope.$index, scope.row)"
          >上架</el-button>
          <el-button
            v-permission="['POST /admin/goods/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/goods/delete']"
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

    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="100"/>
    </el-tooltip>
  </div>
</template>

<script>
import { listGoods, deleteGoods, upDownGoods } from '@/api/mall'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import checkPermission from '@/utils/permission' // 权限判断函数

export default {
  name: 'GoodsList',
  components: { BackToTop, Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsSn: undefined,
        name: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      goodsDetail: '',
      detailDialogVisible: false,
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
      listGoods(this.listQuery).then(response => {
        this.list = response.data.data.items
        this.total = response.data.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push({ path: 'addProduct' })
    },
    handleUpdate(row) {
      this.$router.push({
        path: 'addProduct',
        query: { id: row.id }
      })
    },
    showDetail(detail) {
      this.goodsDetail = detail
      this.detailDialogVisible = true
    },
    handleDelete(index, row) {
      this.$confirm('是否删除 ' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGoods({ id: row.id }).then(response => {
          this.list.splice(index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    // 商品上下架
    upProduct(index, row) {
      let str = ''
      if (row.isOnSale) {
        str = '下架'
      } else {
        str = '上架'
      }
      this.$confirm('是否' + str + '商品' + row.name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        upDownGoods({ id: row.id, isOnSale: !row.isOnSale }).then(response => {
          row.isOnSale = !row.isOnSale
          this.$message({
            type: 'success',
            message: '修改成功!'
          })
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品ID', '商品编号', '名称', '专柜价格', '当前价格', '是否新品', '是否热品', '是否在售', '首页主图', '宣传图片列表', '商品介绍', '详细介绍', '商品图片', '商品单位', '关键字', '类目ID', '品牌商ID']
        const filterVal = ['id', 'goodsSn', 'name', 'counterPrice', 'retailPrice', 'isNew', 'isHot', 'isOnSale', 'listPicUrl', 'gallery', 'brief', 'detail', 'picUrl', 'goodsUnit', 'keywords', 'categoryId', 'brandId']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
        this.downloadLoading = false
      })
    }
  }
}
</script>

<style>
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 100px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
}
.gallery {
  width: 80px;
  margin-right: 10px;
}
</style>
