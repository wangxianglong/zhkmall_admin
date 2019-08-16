<template>
  <div style="margin-top: 50px">
    <el-form
      ref="productInfoForm"
      :model="value"
      :rules="rules"
      label-width="120px"
      style="width: 600px"
      size="small"
    >
      <el-form-item label="商品分类：" prop="productCategoryId">
        <el-cascader v-model="selectProductCateValue" :options="productCateOptions" clearable />
      </el-form-item>
      <el-form-item label="商品名称：" prop="name">
        <el-input v-model="value.name" />
      </el-form-item>
      <el-form-item label="副标题：" prop="subTitle">
        <el-input v-model="value.subTitle" />
      </el-form-item>
      <el-form-item label="商品品牌：" prop="brandId">
        <el-select v-model="value.brandId" placeholder="请选择品牌" @change="handleBrandChange">
          <el-option
            v-for="item in brandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品介绍：">
        <el-input
          :auto-size="true"
          v-model="value.description"
          type="textarea"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item label="商品货号：">
        <el-input v-model="value.productSn" />
      </el-form-item>
      <el-form-item label="商品售价：">
        <el-input-number v-model="value.price" :min="0" />
      </el-form-item>
      <el-form-item label="市场价：">
        <el-input-number v-model="value.originalPrice" :min="0" />
      </el-form-item>
      <el-form-item label="商品库存：">
        <el-input-number v-model="value.stock" :min="0" />
      </el-form-item>
      <el-form-item label="计量单位：">
        <el-input v-model="value.unit" />
      </el-form-item>
      <el-form-item label="商品重量：">
        <el-input-number v-model="value.weight" :min="0" />
        <span style="margin-left: 5px">克</span>
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="value.sort" />
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary" size="medium" @click="handleNext('productInfoForm')">下一步，填写商品促销</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { fetchListWithChildren } from '@/api/productCate'
import { brandList } from '@/api/brand'
// import { getProduct } from '@/api/product'

export default {
  name: 'ProductInfoDetail',
  props: {
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hasEditCreated: false,
      // 选中商品分类的值
      selectProductCateValue: [],
      productCateOptions: [],
      brandOptions: [],
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' }
        ],
        subTitle: [{ required: true, message: '请输入商品副标题', trigger: 'blur' }],
        productCategoryId: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
        brandId: [{ required: true, message: '请选择商品品牌', trigger: 'blur' }],
        description: [{ required: true, message: '请输入商品介绍', trigger: 'blur' }],
        requiredProp: [{ required: true, message: '该项为必填项', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // 商品的编号
    productId() {
      return this.value.id
    }
  },
  watch: {
    productId: function(newValue) {
      if (!this.isEdit) return
      if (this.hasEditCreated) return
      if (newValue === undefined || newValue == null || newValue === 0) return
      this.handleEditCreated()
    },
    selectProductCateValue: function(newValue) {
      if (this.value) {
        if (newValue != null && newValue.length === 2) {
          this.value.productCategoryId = newValue[1]
          this.value.productCategoryName = this.getCateNameById(this.value.productCategoryId)
        } else {
          this.value.productCategoryId = null
          this.value.productCategoryName = null
        }
      }
    }
  },
  created() {
    this.getProductCateList()
    this.getBrandList()
  },
  methods: {
    // 处理编辑逻辑
    handleEditCreated() {
      if (this.value.productCategoryId != null) {
        this.selectProductCateValue = []
        this.selectProductCateValue.push(this.value.cateParentId)
        this.selectProductCateValue.push(this.value.productCategoryId)
      }
      this.hasEditCreated = true
    },
    getProductCateList() {
      fetchListWithChildren().then(response => {
        const list = response.data
        this.productCateOptions = []
        for (let i = 0; i < list.length; i++) {
          const children = []
          if (list[i].children != null && list[i].children.length > 0) {
            for (let j = 0; j < list[i].children.length; j++) {
              children.push({ label: list[i].children[j].name, value: list[i].children[j].id })
            }
          }
          this.productCateOptions.push({ label: list[i].name, value: list[i].id, children: children })
        }
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
    getCateNameById(id) {
      let name = null
      for (let i = 0; i < this.productCateOptions.length; i++) {
        for (let j = 0; i < this.productCateOptions[i].children.length; j++) {
          if (this.productCateOptions[i].children[j].value === id) {
            name = this.productCateOptions[i].children[j].label
            return name
          }
        }
      }
      return name
    },
    handleNext(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit('nextStep')
        } else {
          this.$message({
            message: '验证失败',
            type: 'error',
            duration: 1000
          })
          return false
        }
      })
    },
    handleBrandChange(val) {
      let brandName = ''
      for (let i = 0; i < this.brandOptions.length; i++) {
        if (this.brandOptions[i].value === val) {
          brandName = this.brandOptions[i].label
          break
        }
      }
      this.value.brandName = brandName
    }
  }
}
</script>

<style scoped>
</style>
