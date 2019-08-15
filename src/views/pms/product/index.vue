<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search" />
        <span>筛选搜索</span>
        <el-button style="float: right" type="primary" size="small" @click="handleSearchList()">查询结果</el-button>
        <el-button
          style="float: right;margin-right: 15px"
          size="small"
          @click="handleResetSearch()"
        >重置</el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input v-model="listQuery.keyword" style="width: 203px" placeholder="商品名称" />
          </el-form-item>
          <el-form-item label="商品货号：">
            <el-input v-model="listQuery.productSn" style="width: 203px" placeholder="商品货号" />
          </el-form-item>
          <el-form-item label="商品分类：">
            <el-cascader
              v-model="selectProductCateValue"
              :options="productCateOptions"
              :props="prodCateProps"
              clearable
            />
          </el-form-item>
          <el-form-item label="商品品牌：">
            <el-select v-model="listQuery.brandId" placeholder="请选择品牌" clearable>
              <el-option
                v-for="item in brandOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态：">
            <el-select v-model="listQuery.publishStatus" placeholder="全部" clearable>
              <el-option
                v-for="item in publishStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态：">
            <el-select v-model="listQuery.verifyStatus" placeholder="全部" clearable>
              <el-option
                v-for="item in verifyStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>数据列表</span>
      <el-button class="btn-add" size="mini" @click="handleAddProduct()">添加</el-button>
    </el-card>
    <div class="table-container">
      <el-table
        v-loading="listLoading"
        ref="productTable"
        :data="list"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column align="center" width="75" label="排序" prop="sort" sortable />
        <el-table-column label="商品图片" width="120" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.pic" :alt="scope.row.name" style="height: 80px">
          </template>
        </el-table-column>
        <el-table-column label="名称/品牌" min-width="110" align="center">
          <template slot-scope="scope">
            <p>{{ scope.row.name }}</p>
            <p>品牌：{{ scope.row.brandName }}</p>
          </template>
        </el-table-column>
        <el-table-column label="分类名称" width="100" align="center" prop="productCategoryName" />
        <el-table-column label="价格/货号" width="150" align="center">
          <template slot-scope="scope">
            <p>价格：￥{{ scope.row.price }}</p>
            <p>货号：{{ scope.row.productSn }}</p>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="230" align="center">
          <template slot-scope="scope">
            <p>
              上架：
              <el-switch
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.publishStatus"
                style="margin-right: 15px;"
                @change="handleStatusChange(scope.row, 'publishStatus')"
              />删除：
              <el-switch
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.deleteStatus"
                @change="handleStatusChange(scope.row, 'deleteStatus')"
              />
            </p>
            <p>
              新品：
              <el-switch
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.newStatus"
                style="margin-right: 15px;"
                @change="handleStatusChange(scope.row, 'newStatus')"
              />推荐：
              <el-switch
                :active-value="1"
                :inactive-value="0"
                v-model="scope.row.recommendStatus"
                @change="handleStatusChange(scope.row, 'recommendStatus')"
              />
            </p>
          </template>
        </el-table-column>
        <el-table-column label="SKU库存" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="handleShowSkuEditDialog(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" width="100" label="库存预警值" prop="lowStock" />
        <el-table-column align="center" width="100" label="销量" prop="sale" />
        <el-table-column label="审核状态" width="100" align="center">
          <template slot-scope="scope">
            <!-- <p>{{scope.row.verifyStatus | verifyStatusFilter}}</p>
            <p>
              <el-button type="text" @click="handleShowVerifyDetail(scope.$index, scope.row)">审核详情</el-button>
            </p>-->
            <el-tag
              :type="optionType[scope.row.verifyStatus]"
            >{{ scope.row.verifyStatus | verifyStatusFilter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleUpdateProduct(scope.$index, scope.row)"
            >编辑</el-button>
            <!-- <p>
              <el-button size="mini" @click="handleShowProduct(scope.$index, scope.row)">查看</el-button>
            </p>
            <p>
              <el-button size="mini" @click="handleShowLog(scope.$index, scope.row)">日志</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </p>-->
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="batch-operate-container">
      <el-select v-model="operateType" size="small" clearable placeholder="批量操作">
        <el-option
          v-for="item in operates"
          :key="item.value"
          :label="item.label"
          :value="item.label"
        />
      </el-select>
      <el-button
        style="margin-left: 20px"
        class="search-button"
        type="primary"
        size="small"
        @click="handleBatchOperate()"
      >确定</el-button>
    </div>
    <div class="pagination-container">
      <el-pagination
        :page-size="listQuery.pageSize"
        :page-sizes="[5,10,15]"
        :current-page.sync="listQuery.pageNum"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog :visible.sync="editSkuInfo.dialogVisible" title="编辑货品信息" width="40%">
      <span>商品货号：</span>
      <span>{{ editSkuInfo.productSn }}</span>
      <el-input
        v-model="editSkuInfo.keyword"
        placeholder="按sku编号搜索"
        size="small"
        style="width: 50%;margin-left: 20px"
      >
        <el-button slot="append" icon="el-icon-search" @click="handleSearchEditSku" />
      </el-input>
      <el-table :data="editSkuInfo.stockList" border style="width: 100%;margin-top: 20px">
        <el-table-column label="SKU编号" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.skuCode" />
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item,index) in editSkuInfo.productAttr"
          :label="item.name"
          :key="item.id"
          align="center"
        >
          <template slot-scope="scope">{{ getProductSkuSp(scope.row,index) }}</template>
        </el-table-column>
        <el-table-column label="销售价格" width="80" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.price" />
          </template>
        </el-table-column>
        <el-table-column label="商品库存" width="80" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.stock" />
          </template>
        </el-table-column>
        <el-table-column label="库存预警值" width="100" align="center">
          <template slot-scope="scope">
            <el-input v-model="scope.row.lowStock" />
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editSkuInfo.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditSkuConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  fetchList,
  updateDeleteStatus,
  updateNewStatus,
  updateRecommendStatus,
  updatePublishStatus
} from '@/api/product'
import { fetchList as fetchSkuStockList, update as updateSkuStockList } from '@/api/skuStock'
import { prodAttrList } from '@/api/productAttr'
import { brandList } from '@/api/brand'
import { fetchListWithChildren } from '@/api/productCate'

const defaultListQuery = {
  keyword: null,
  pageNum: 1,
  pageSize: 10,
  publishStatus: null,
  verifyStatus: null,
  productSn: null,
  productCategoryId: null,
  brandId: null
}
export default {
  name: 'ProductList',
  filters: {
    verifyStatusFilter(value) {
      if (value === 1) {
        return '审核通过'
      } else {
        return '未审核'
      }
    }
  },
  data() {
    return {
      editSkuInfo: {
        dialogVisible: false,
        productId: null,
        productSn: '',
        productAttributeCategoryId: null,
        stockList: [],
        productAttr: [],
        keyword: null
      },
      statusTypeMap: { publishStatus: '上架状态', recommendStatus: '推荐状态', newStatus: '新品状态', deleteStatus: '删除状态' },
      prodCateProps: { value: 'id', label: 'name' },
      operates: [
        {
          label: '商品上架',
          statusType: 'publishStatus',
          status: 1
        },
        {
          label: '商品下架',
          statusType: 'publishStatus',
          status: 0
        },
        {
          label: '设为推荐',
          statusType: 'recommendStatus',
          status: 1
        },
        {
          label: '取消推荐',
          statusType: 'recommendStatus',
          status: 0
        },
        {
          label: '设为新品',
          statusType: 'newStatus',
          status: 1
        },
        {
          label: '取消新品',
          statusType: 'newStatus',
          status: 0
        },
        {
          label: '设为删除',
          statusType: 'deleteStatus',
          status: 1
        },
        {
          label: '取消删除',
          statusType: 'deleteStatus',
          status: 0
        }
      ],
      operateType: null,
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: true,
      selectProductCateValue: null,
      multipleSelection: [],
      productCateOptions: [],
      optionType: ['info', 'success'],
      brandOptions: [],
      publishStatusOptions: [{
        value: 1,
        label: '上架'
      }, {
        value: 0,
        label: '下架'
      }],
      verifyStatusOptions: [{
        value: 1,
        label: '审核通过'
      }, {
        value: 0,
        label: '未审核'
      }]
    }
  },
  watch: {
    selectProductCateValue: function(newValue) {
      if (newValue !== null && newValue.length === 2) {
        this.listQuery.productCategoryId = newValue[1]
      } else {
        this.listQuery.productCategoryId = null
      }
    }
  },
  created() {
    this.getList()
    this.getBrandList()
    this.getProductCateList()
  },
  methods: {
    getProductSkuSp(row, index) {
      if (index === 0) {
        return row.sp1
      } else if (index === 1) {
        return row.sp2
      } else {
        return row.sp3
      }
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.listLoading = false
        this.list = response.data.list
        this.total = response.data.total
      })
    },
    getBrandList() {
      brandList({ pageNum: 1, pageSize: 100 }).then(response => {
        this.brandOptions = []
        const brandList = response.data.list
        for (let i = 0; i < brandList.length; i++) {
          this.brandOptions.push({ label: brandList[i].name, value: brandList[i].id })
        }
      })
    },
    getProductCateList() {
      fetchListWithChildren().then(response => {
        this.productCateOptions = response.data
      })
    },
    handleShowSkuEditDialog(index, row) {
      this.editSkuInfo.dialogVisible = true
      this.editSkuInfo.productId = row.id
      this.editSkuInfo.productSn = row.productSn
      this.editSkuInfo.productAttributeCategoryId = row.productAttributeCategoryId
      this.editSkuInfo.keyword = null
      fetchSkuStockList(row.id, { keyword: this.editSkuInfo.keyword }).then(response => {
        this.editSkuInfo.stockList = response.data
      })
      prodAttrList(row.productAttributeCategoryId, { type: 0 }).then(response => {
        this.editSkuInfo.productAttr = response.data.list
      })
    },
    handleSearchEditSku() {
      fetchSkuStockList(this.editSkuInfo.productId, { keyword: this.editSkuInfo.keyword }).then(response => {
        this.editSkuInfo.stockList = response.data
      })
    },
    handleEditSkuConfirm() {
      if (this.editSkuInfo.stockList == null || this.editSkuInfo.stockList.length <= 0) {
        this.$message({
          message: '暂无sku信息',
          type: 'warning',
          duration: 1000
        })
        return
      }
      this.$confirm('是否要进行修改', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateSkuStockList(this.editSkuInfo.productId, this.editSkuInfo.stockList).then(response => {
          this.$message({
            message: '修改成功',
            type: 'success',
            duration: 1500
          })
          this.editSkuInfo.dialogVisible = false
        })
      })
    },
    handleSearchList() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    handleAddProduct() {
      this.$router.push({ path: '/pms/addProduct' })
    },
    operateCallBack(ids, statusType, status) {
      this.list.forEach(item => {
        ids.forEach(val => {
          if (item.id === val) {
            item[statusType] = status
            // 修改完数据之后清除勾选框
            this.$refs.productTable.clearSelection()
          }
        })
      })
      this.$message({
        message: '修改成功',
        type: 'success',
        duration: 1500
      })
    },
    handleBatchOperate() {
      if (!this.operateType || this.operateType === null) {
        this.$message({
          message: '请选择批量操作类型',
          type: 'warning',
          duration: 1500
        })
        return
      }
      if (this.multipleSelection == null || this.multipleSelection.length < 1) {
        this.$message({
          message: '请至少选择一条记录',
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm('是否要进行该批量操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        let statusType = ''
        let status = 0
        for (let i = 0; i < this.multipleSelection.length; i++) {
          ids.push(this.multipleSelection[i].id)
        }
        this.operates.forEach(item => {
          if (item.label === this.operateType) {
            statusType = item.statusType
            status = item.status
          }
        })
        this.handleEditStatus(ids, statusType, status)
      })
    },
    handleEditStatus(ids, statusType, status) {
      const params = new URLSearchParams()
      params.append('ids', ids)
      params.append(statusType, status)

      switch (statusType) {
        case 'publishStatus':
          updatePublishStatus(params).then(response => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        case 'recommendStatus':
          updateRecommendStatus(params).then(response => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        case 'newStatus':
          updateNewStatus(params).then(response => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        case 'deleteStatus':
          updateDeleteStatus(params).then(response => {
            this.operateCallBack(ids, statusType, status)
          })
          break
        default:
          this.$message({
            message: '请选择批量操作类型',
            type: 'warning',
            duration: 1500
          })
          break
      }
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val
      this.getList()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleStatusChange(row, statusType) {
      this.$confirm(`是否要修改${this.statusTypeMap[statusType]}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        ids.push(row.id)
        this.handleEditStatus(ids, statusType, row[statusType])
      }).catch(() => {
        row[statusType] = ~row[statusType] + 2
      })
    },
    handleUpdateProduct(index, row) {
      this.$router.push({
        path: '/pms/updateProduct',
        query: { id: row.id }
      })
    }
    // handleShowProduct(index, row) {
    //   console.log("handleShowProduct", row)
    // },
    // handleShowVerifyDetail(index, row) {
    //   console.log("handleShowVerifyDetail", row)
    // },
    // handleShowLog(index, row) {
    //   console.log("handleShowLog", row)
    // }
  }
}
</script>
<style></style>
