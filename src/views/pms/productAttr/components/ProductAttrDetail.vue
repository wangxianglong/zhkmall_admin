<template>
  <el-card class="form-container" shadow="never">
    <el-form ref="productAttrFrom" :model="productAttr" :rules="rules" label-width="150px">
      <el-form-item label="属性名称：" prop="name">
        <el-input v-model="productAttr.name" />
      </el-form-item>
      <el-form-item label="商品类型：">
        <el-select v-model="productAttr.productAttributeCategoryId" placeholder="请选择">
          <el-option
            v-for="item in productAttrCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分类筛选样式:">
        <el-radio-group v-model="productAttr.filterType">
          <el-radio :label="0">普通</el-radio>
          <el-radio :label="1">颜色</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="能否进行检索:">
        <el-radio-group v-model="productAttr.searchType">
          <el-radio :label="0">不需要检索</el-radio>
          <el-radio :label="1">关键字检索</el-radio>
          <el-radio :label="2">范围检索</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="商品属性关联:">
        <el-radio-group v-model="productAttr.relatedStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="属性是否可选:">
        <el-radio-group v-model="productAttr.selectType">
          <el-radio :label="0">唯一</el-radio>
          <el-radio :label="1">单选</el-radio>
          <el-radio :label="2">复选</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="属性值的录入方式:">
        <el-radio-group v-model="productAttr.inputType">
          <el-radio :label="0">手工录入</el-radio>
          <el-radio :label="1">从下面列表中选择</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="属性值可选值列表:">
        <el-tag
          v-for="tag in dynamicTags"
          :key="tag"
          :disable-transitions="false"
          closable
          @close="handleClose(tag)"
        >{{ tag }}</el-tag>
        <el-input
          v-if="inputVisible"
          ref="saveTagInput"
          v-model="inputValue"
          class="input-new-tag"
          size="small"
          @keyup.enter.native="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag" size="small" @click="showInput">添加属性</el-button>
      </el-form-item>
      <el-form-item label="是否支持手动新增:">
        <el-radio-group v-model="productAttr.handAddStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序属性：">
        <el-input v-model="productAttr.sort" />
      </el-form-item>
      <el-form-item>
        <el-button @click="$router.back(-1)">返回</el-button>
        <el-button v-if="!isEdit" @click="resetForm('productAttrFrom')">重置</el-button>
        <el-button type="primary" @click="onSubmit('productAttrFrom')">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { attrCategoryList } from '@/api/productAttrCate'
import { createProductAttr, getProductAttr, updateProductAttr } from '@/api/productAttr'

const defaultProductAttr = {
  filterType: 0,
  handAddStatus: 0,
  inputList: '',
  inputType: 0,
  name: '',
  productAttributeCategoryId: 0,
  relatedStatus: 0,
  searchType: 0,
  selectType: 0,
  sort: 0,
  type: 0
}
export default {
  name: 'ProductAttrDetail',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      productAttr: Object.assign({}, defaultProductAttr),
      rules: {
        name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' },
          { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' }
        ]
      },
      productAttrCateList: null,
      dynamicTags: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    if (this.isEdit) {
      this.getProductAttrDetail()
    } else {
      this.resetProductAttr()
    }
    this.getCateList()
  },
  methods: {
    getCateList() {
      const listQuery = { pageNum: 1, pageSize: 100 }
      attrCategoryList(listQuery).then(response => {
        this.productAttrCateList = response.data.list
      })
    },
    getProductAttrDetail() {
      getProductAttr(this.$route.query.id).then(response => {
        const data = response.data
        this.dynamicTags = data.inputList.split(',')
        this.productAttr = data
      })
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    resetProductAttr() {
      this.productAttr = Object.assign({}, defaultProductAttr)
      this.productAttr.productAttributeCategoryId = Number(this.$route.query.cid)
      this.dynamicTags = []
      this.productAttr.type = Number(this.$route.query.type)
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm('是否提交数据', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.productAttr.inputList = this.dynamicTags.join(',')
            if (this.isEdit) {
              updateProductAttr(this.$route.query.id, this.productAttr).then(response => {
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration: 1500
                })
                this.$router.back()
              })
            } else {
              createProductAttr(this.productAttr).then(response => {
                this.$message({
                  message: '提交成功',
                  type: 'success',
                  duration: 1500
                })
                this.resetForm('productAttrFrom')
              })
            }
          })
        } else {
          this.$message({
            message: '验证失败',
            type: 'error',
            duration: 1500
          })
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.resetProductAttr()
    }
  }
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
