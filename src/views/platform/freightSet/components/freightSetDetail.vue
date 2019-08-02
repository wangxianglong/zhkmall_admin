<template>
  <el-card class="form-container" shadow="never">
    <el-form :model="productCate" :rules="rules" ref="productCateFrom" label-width="150px">
      <el-form-item label="配送名称：" prop="name">
        <el-input v-model="productCate.name"></el-input>
      </el-form-item>
      <el-form-item label="配送区域：">
        <el-select v-model="productCate.parentId" placeholder="请选择">
          <el-option
            v-for="item in selectProductCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="配送物流：">
        <el-select v-model="productCate.parentId" placeholder="请选择">
          <el-option
            v-for="item in selectProductCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="计算公式：">
        <el-select v-model="productCate.formulaId" placeholder="请选择" @change="showComputational">
          <el-option
            v-for="item in computational"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="countData">
        <span>{{ countData.desc }}</span>
        <el-button @click="showResult">默认按钮</el-button>
        <template v-for="itemData in countData.modules">
          <div v-if="itemData.type === 'table'">
            <edit-table ref="bxzTable" :data="weightTable" :columns="itemData.data"></edit-table>
          </div>
        </template>
      </el-form-item>
      <el-form-item label="折扣：">
        <el-input v-model="productCate.name"></el-input>
      </el-form-item>
      <el-form-item label="排序：">
        <el-input v-model="productCate.name"></el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-radio-group v-model="productCate.navStatus">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述：">
        <el-input type="textarea" :rows="4" v-model="productCate.description"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button v-if="!isEdit" @click="resetForm('productCateFrom')">重置</el-button>
        <el-button type="primary" @click="onSubmit('productCateFrom')">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { fetchList, createProductCate, updateProductCate, getProductCate } from '@/api/productCate';
import editTable from './editTable'
import { fetchListWithAttr } from '@/api/productAttrCate';
import { getProductAttrInfo } from '@/api/productAttr';
import SingleUpload from '@/components/Upload/singleUpload';

const defaultProductCate = {
  description: '',
  icon: '',
  keywords: '',
  name: '',
  navStatus: 0,
  parentId: 0,
  formulaId: undefined,
  productUnit: '',
  showStatus: 0,
  sort: 0,
  productAttributeIdList: []
};
export default {
  name: "ProductCateDetail",
  components: { SingleUpload, editTable },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      productCate: Object.assign({}, defaultProductCate),
      selectProductCateList: [],
      weightTable: [],
      rules: {
        name: [
          { required: true, message: '请输入配送名称', trigger: 'blur' },
          { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' }
        ]
      },
      countData: {},
      computational: [{
        id: 1,
        title: '按重量(首重+续重)',
        desc: '运费 = 处理费 + (价格 * 重量)  请按照重量从小到大依次填写 /n  (重量单位: KG, 货币单位: US$1',
        modules: [{
          type: 'table',
          data: [{
            headName: '<=重量KG',
            value: 'weight'
          }, {
            headName: '处理费',
            value: 'charges'
          }, {
            headName: '价格',
            value: 'price'
          }]
        }]
      }, {
        id: 2,
        title: '统一固定收费'
      }, {
        id: 3,
        title: '按重量(自定义)'
      }, {
        id: 4,
        title: '按重量(首续重+大包裹)'
      }, {
        id: 5,
        title: '按重量(不同区间+不同续重)'
      }, {
        id: 6,
        title: '按重量(补偿0.5kg)(小包裹+大包裹)'
      }, {
        id: 7,
        title: '按价格(不同区间)'
      }, {
        id: 8,
        title: '按件数(不同区间+不同续件)'
      }, {
        id: 9,
        title: 'E邮宝(首件+没g重量)'
      }, {
        id: 10,
        title: '按件数(首件+续件)'
      }, {
        id: 11,
        title: '物流小包通用'
      }, {
        id: 12,
        title: '按重量(补偿1KG)(小包裹+大包裹)'
      }],
      filterAttrs: [],
      filterProductAttrList: [{
        value: []
      }]
    }
  },
  created() {
    if (this.isEdit) {
      getProductCate(this.$route.query.id).then(response => {
        this.productCate = response.data;
      });
      getProductAttrInfo(this.$route.query.id).then(response => {
        if (response.data != null && response.data.length > 0) {
          this.filterProductAttrList = [];
          for (let i = 0; i < response.data.length; i++) {
            this.filterProductAttrList.push({
              key: Date.now() + i,
              value: [response.data[i].attributeCategoryId, response.data[i].attributeId]
            })
          }
        }
      });
    } else {
      this.productCate = Object.assign({}, defaultProductCate);
    }
    this.getSelectProductCateList();
    this.getProductAttrCateList();
  },
  methods: {
    showComputational(val) {
      this.computational.forEach(compItem => {
        if (val === compItem.id) {
          this.countData = compItem
          var obj = {}
          let tableData = []
          this.weightTable = []
          compItem.modules.forEach(modItem => {
            if (modItem.type === 'table') {
              tableData = modItem.data
            }
          })
          tableData.forEach((tabItem, index) => {
            obj[tabItem.value] = ''
          })
          for (let i = 0; i < 9; i++) {
            this.weightTable.push(obj)
          }
        }
      })
    },
    showResult() {
      console.log(this.weightTable)
    },
    getSelectProductCateList() {
      fetchList(0, { pageSize: 100, pageNum: 1 }).then(response => {
        this.selectProductCateList = response.data.list;
        this.selectProductCateList.unshift({ id: 0, name: '无上级分类' });
      });
    },
    getProductAttrCateList() {
      fetchListWithAttr().then(response => {
        let list = response.data;
        for (let i = 0; i < list.length; i++) {
          let productAttrCate = list[i];
          let children = [];
          if (productAttrCate.productAttributeList != null && productAttrCate.productAttributeList.length > 0) {
            for (let j = 0; j < productAttrCate.productAttributeList.length; j++) {
              children.push({
                label: productAttrCate.productAttributeList[j].name,
                value: productAttrCate.productAttributeList[j].id
              })
            }
          }
          this.filterAttrs.push({ label: productAttrCate.name, value: productAttrCate.id, children: children });
        }
      });
    },
    getProductAttributeIdList() {
      //获取选中的筛选商品属性
      let productAttributeIdList = [];
      for (let i = 0; i < this.filterProductAttrList.length; i++) {
        let item = this.filterProductAttrList[i];
        if (item.value !== null && item.value.length === 2) {
          productAttributeIdList.push(item.value[1]);
        }
      }
      return productAttributeIdList;
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm('是否提交数据', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.isEdit) {
              this.productCate.productAttributeIdList = this.getProductAttributeIdList();
              updateProductCate(this.$route.query.id, this.productCate).then(response => {
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration: 1000
                });
                this.$router.back();
              });
            } else {
              this.productCate.productAttributeIdList = this.getProductAttributeIdList();
              createProductCate(this.productCate).then(response => {
                this.$refs[formName].resetFields();
                this.resetForm(formName);
                this.$message({
                  message: '提交成功',
                  type: 'success',
                  duration: 1000
                });
              });
            }
          });

        } else {
          this.$message({
            message: '验证失败',
            type: 'error',
            duration: 1000
          });
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.productCate = Object.assign({}, defaultProductCate);
      this.getSelectProductCateList();
      this.filterProductAttrList = [{
        value: []
      }];
    },
    removeFilterAttr(productAttributeId) {
      if (this.filterProductAttrList.length === 1) {
        this.$message({
          message: '至少要留一个',
          type: 'warning',
          duration: 1000
        });
        return;
      }
      var index = this.filterProductAttrList.indexOf(productAttributeId);
      if (index !== -1) {
        this.filterProductAttrList.splice(index, 1)
      }
    },
    handleAddFilterAttr() {
      if (this.filterProductAttrList.length === 3) {
        this.$message({
          message: '最多添加三个',
          type: 'warning',
          duration: 1000
        });
        return;
      }
      this.filterProductAttrList.push({
        value: null,
        key: Date.now()
      });
    }
  },
  filters: {
    filterLabelFilter(index) {
      if (index === 0) {
        return '筛选属性：';
      } else {
        return '';
      }
    }
  }
}
</script>

<style scoped>
</style>
