<template>
  <el-card class="form-container" shadow="never">
    <el-form ref="productCateFrom" :model="productCate" :rules="rules" label-width="100px">
      <el-form-item label="配送名称：" prop="name">
        <el-input v-model="productCate.name" />
      </el-form-item>
      <el-form-item label="配送区域：">
        <el-select v-model="productCate.parentId" placeholder="请选择">
          <el-option
            v-for="item in selectProductCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配送物流：">
        <el-select v-model="productCate.parentId" placeholder="请选择">
          <el-option
            v-for="item in selectProductCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计算公式：">
        <el-select v-model="productCate.formulaId" placeholder="请选择" @change="showComputational">
          <el-option
            v-for="item in computational"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="countData">
        <div v-for="item in countData.descArr" :key="item">{{ item }}</div>
        <template v-for="(itemData, index) in countData.modules">
          <div :key="index">
            <div class="table_tit">{{ itemData.desc }}</div>
            <div v-if="itemData.type === 'table' || itemData.type === 'section'">
              <el-button
                type="primary"
                icon="el-icon-circle-plus-outline"
                size="small"
                @click.prevent="addRow(itemData.refs)"
              >添加行</el-button>
              <el-button
                type="danger"
                icon="el-icon-remove-outline"
                size="small"
                @click.prevent="delData(itemData.refs)"
              >删除行</el-button>
            </div>
            <div v-if="itemData.type === 'identify'">
              <el-input-number
                v-model="identifyVal"
                :precision="0"
                :min="0"
                :max="50"
                size="small"
              />
              <el-button type="primary" size="small" @click.prevent="generateform(itemData)">生成表单</el-button>
            </div>
            <div v-if="!itemData.showGenerate" class="table_tit">{{ itemData.generateDesc }}</div>
            <edit-table
              v-if="!itemData.showGenerate"
              :ref="itemData.refs"
              :table-type="itemData.type"
              :data="itemData.data"
              :columns="itemData.columns"
              :show-header="itemData.showHead"
              @selectlistRow="selectRow"
            />
          </div>
        </template>
      </el-form-item>
      <el-form-item label="折扣：">
        <el-input v-model="productCate.name" />
      </el-form-item>
      <el-form-item label="排序：">
        <el-input v-model="productCate.name" />
      </el-form-item>
      <el-form-item label="状态：">
        <el-radio-group v-model="productCate.navStatus">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述：">
        <el-input v-model="productCate.description" :rows="4" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button v-if="!isEdit" @click="resetForm('productCateFrom')">重置</el-button>
        <el-button type="primary" @click="onSubmit('productCateFrom')">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { categoryList, createProductCate, updateProductCate, getProductCate } from '@/api/productCate'
import editTable from './editTable'
import { fetchListWithAttr } from '@/api/productAttrCate'
import { getProductAttrInfo } from '@/api/productAttr'
// import SingleUpload from '@/components/Upload/singleUpload'

const defaultProductCate = {
  description: '',
  icon: '',
  keywords: '',
  name: '',
  navStatus: 0,
  parentId: 0,
  productUnit: '',
  showStatus: 0,
  sort: 0,
  productAttributeIdList: []
}
export default {
  name: 'ProductCateDetail',
  components: { editTable },
  filters: {
    filterLabelFilter(index) {
      if (index === 0) {
        return '筛选属性：'
      } else {
        return ''
      }
    }
  },
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
      rules: {
        name: [
          { required: true, message: '请输入配送名称', trigger: 'blur' },
          { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' }
        ]
      },
      startNum: 0.5,
      endNum: 51,
      interval: 6,
      identifyVal: undefined,
      selectlistRow: [],
      relatedNum: 1,
      countData: {},
      computational: [
        {
          id: 1,
          title: '按重量(首重+续重)',
          descArr: [
            '运费 = 处理费 + (价格 * 重量)',
            '请按照重量从小到大依次填写',
            '(重量单位: KG, 货币单位: US$1)'
          ],
          modules: [
            {
              type: 'table',
              refs: 'threeTable',
              data: [],
              showHead: true,
              columns: [
                {
                  headName: '<=重量KG',
                  value: 'weight'
                },
                {
                  headName: '处理费',
                  value: 'charges'
                },
                {
                  headName: '价格',
                  value: 'price'
                }
              ]
            },
            {
              type: 'astrict',
              showHead: false,
              desc: '屏蔽设置',
              data: [
                {
                  condition: '价格<',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '价格>',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '重量<',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '重量>',
                  reference: '',
                  desc: '屏蔽不显示'
                }
              ]
            },
            {
              type: 'table',
              refs: 'twoTable',
              desc: '附加费',
              data: [],
              columns: [
                {
                  headName: '重量>=',
                  value: 'weight'
                },
                {
                  headName: '附加费',
                  value: 'charges'
                }
              ]
            }
          ]
        },
        {
          id: 2,
          title: '统一固定收费',
          modules: [
            {
              type: 'astrict',
              showHead: false,
              desc: '基本参数设置(重量单位: KG, 货币单位: US$1)',
              data: [
                {
                  condition: '首重重量',
                  reference: ''
                },
                {
                  condition: '首重价格',
                  reference: ''
                },
                {
                  condition: '续重重量',
                  reference: ''
                },
                {
                  condition: '续重价格',
                  reference: ''
                }
              ]
            },
            {
              type: 'table',
              desc: '加箱子重量(总重量=商品重量+箱重)',
              refs: 'threeTable',
              data: [],
              columns: [
                {
                  headName: '左区间>=',
                  value: 'left'
                },
                {
                  headName: '右区间<',
                  value: 'right'
                },
                {
                  headName: '箱重',
                  value: 'weight'
                }
              ]
            },
            {
              type: 'astrict',
              showHead: false,
              desc: '免运费设置',
              data: [
                {
                  condition: '价格>=',
                  reference: '',
                  desc: '免运费'
                },
                {
                  condition: '重量>=',
                  reference: '',
                  desc: '免运费'
                },
                {
                  condition: '件数>=',
                  reference: '',
                  desc: '免运费'
                }
              ]
            },
            {
              type: 'astrict',
              showHead: false,
              desc: '屏蔽设置',
              data: [
                {
                  condition: '价格<',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '价格>',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '重量<',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '重量>',
                  reference: '',
                  desc: '屏蔽不显示'
                }
              ]
            }
          ]
        },
        {
          id: 3,
          title: '按重量(自定义)',
          descArr: [],
          modules: [
            {
              type: 'weightPrice',
              showHead: true,
              desc: '小包裹運費(重量单位: KG, 货币单位: US$1)',
              data: []
            },
            {
              type: 'table',
              desc: '续件规则设置',
              refs: 'threeTable',
              data: [],
              columns: [
                {
                  headName: '<=区间件数的部分',
                  value: 'bodys'
                },
                {
                  headName: '续件数量',
                  value: 'count'
                },
                {
                  headName: '续件价格',
                  value: 'price'
                }
              ]
            },
            {
              type: 'astrict',
              showHead: false,
              desc: '屏蔽设置',
              data: [
                {
                  condition: '价格<',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '价格>',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '重量<',
                  reference: '',
                  desc: '屏蔽不显示'
                },
                {
                  condition: '重量>',
                  reference: '',
                  desc: '屏蔽不显示'
                }
              ]
            },
            {
              type: 'table',
              refs: 'twoTable',
              desc: '附加费',
              data: [],
              columns: [
                {
                  headName: '重量>=',
                  value: 'weight'
                },
                {
                  headName: '附加费',
                  value: 'charges'
                }
              ]
            }
          ]
        },
        {
          id: 4,
          title: '按重量(首续重+大包裹)',
          descArr: ['1.本公式的计算是基于价格, 免邮的商品也需要参与运费计算'],
          modules: [
            {
              type: 'section',
              refs: 'priceTable',
              showHead: true,
              desc: '价格区间设置(货币单位: US$1)',
              data: []
            },
            {
              type: 'identify',
              showHead: false,
              desc: '重量鑒定檔 KG(步长1)',
              step: 1,
              showGenerate: true,
              generateDesc: '小包裹運費設置',
              data: []
            }
          ]
        },
        {
          id: 5,
          title: '按重量(不同区间+不同续重)',
          descArr: ['1.本公式的计算是基于价格, 免邮的商品也需要参与运费计算'],
          modules: [
            {
              type: 'section',
              refs: 'priceTable',
              showHead: true,
              desc: '价格区间设置(货币单位: US$1)',
              data: []
            },
            {
              type: 'identify',
              showHead: false,
              desc: '重量鑒定檔 KG(步长0.5)',
              step: 0.5,
              showGenerate: true,
              generateDesc: '小包裹運費設置',
              data: []
            }
          ]
        },
        {
          id: 6,
          title: '按重量(补偿0.5kg)(小包裹+大包裹)'
        },
        {
          id: 7,
          title: '按价格(不同区间)'
        },
        {
          id: 8,
          title: '按件数(不同区间+不同续件)'
        },
        {
          id: 9,
          title: 'E邮宝(首件+没g重量)'
        },
        {
          id: 10,
          title: '按件数(首件+续件)'
        },
        {
          id: 11,
          title: '物流小包通用'
        },
        {
          id: 12,
          title: '按重量(补偿1KG)(小包裹+大包裹)'
        }
      ],
      filterAttrs: [],
      filterProductAttrList: [
        {
          value: []
        }
      ]
    }
  },
  created() {
    if (this.isEdit) {
      getProductCate(this.$route.query.id).then(response => {
        this.productCate = response.data
      })
      getProductAttrInfo(this.$route.query.id).then(response => {
        if (response.data != null && response.data.length > 0) {
          this.filterProductAttrList = []
          for (let i = 0; i < response.data.length; i++) {
            this.filterProductAttrList.push({
              key: Date.now() + i,
              value: [
                response.data[i].attributeCategoryId,
                response.data[i].attributeId
              ]
            })
          }
        }
      })
    } else {
      this.productCate = Object.assign({}, defaultProductCate)
    }
    this.getSelectProductCateList()
    this.getProductAttrCateList()
    this.computational.forEach(item => {
      if (item.modules) {
        item.modules.forEach(modItem => {
          if (modItem.type === 'weightPrice') {
            modItem.data = this.generatedData(this.startNum, this.endNum, 0.5)
          }
        })
      }
    })
  },
  methods: {
    showComputational(val) {
      this.computational.forEach(compItem => {
        if (val === compItem.id) {
          this.identifyVal = undefined
          compItem.modules.forEach(modItem => {
            if (!modItem.showGenerate) {
              modItem.showGenerate = true
            }
          })
          this.countData = compItem
        }
      })
    },
    generatedData(startNum, endNum, interval) {
      const result = []
      const mockData = []
      for (let i = startNum; i <= endNum; i += interval) {
        result.push([i.toFixed(1), ''])
      }
      for (let i = 0; i < result.length; i++) {
        var newResult = result.slice(i, (i += this.interval))
        if (newResult.length === this.interval) {
          mockData.push(newResult)
        } else {
          const num = this.interval - newResult.length
          for (let y = 0; y < num; y++) {
            newResult.push(['', ''])
          }
          mockData.push(newResult)
        }
      }

      return mockData
    },
    generateform(data) {
      data.data = this.generatedData(data.step, this.identifyVal, data.step)
      // console.log(this.countData)
      data.showGenerate = false
    },
    showResult() {
      console.log(this.countData.modules)
    },
    selectRow(selectlistRow) {
      this.selectlistRow = selectlistRow
    },
    // 增加行
    addRow(refs) {
      this.countData.modules.forEach(item => {
        if (item.refs === refs) {
          if (refs === 'priceTable') {
            item.data.push({
              sort: this.relatedNum,
              totalPrice: '总价>',
              price: '',
              gather: '收取',
              fixedCharge: '',
              or: '或',
              percentage: ''
            })
            this.relatedNum += 1
          } else {
            var list = {
              sort: this.relatedNum
            }
            item.columns.forEach(item => {
              list[item.value] = ''
            })
            item.data.push(list)
            this.relatedNum += 1
          }
        }
      })
    },
    // 删除选中行
    delData(refs) {
      this.countData.modules.forEach(item => {
        if (item.refs === refs) {
          for (let i = 0; i < this.selectlistRow.length; i++) {
            var val = this.selectlistRow
            // 获取选中行的索引的方法
            // 遍历表格中data数据和选中的val数据，比较它们的sort,相等则输出选中行的索引
            val.forEach((val, index) => {
              item.data.forEach((v, i) => {
                if (val.sort === v.sort) {
                  // i 为选中的索引
                  item.data.splice(i, 1)
                }
              })
            })
          }
          // // 删除完数据之后清除勾选框
          this.$refs[refs][0].$refs.relatedData.clearSelection()
        }
      })
    },
    getSelectProductCateList() {
      categoryList(0, { pageSize: 100, pageNum: 1 }).then(response => {
        this.selectProductCateList = response.data.list
        this.selectProductCateList.unshift({ id: 0, name: '无上级分类' })
      })
    },
    getProductAttrCateList() {
      fetchListWithAttr().then(response => {
        const list = response.data
        for (let i = 0; i < list.length; i++) {
          const productAttrCate = list[i]
          const children = []
          if (
            productAttrCate.productAttributeList != null &&
            productAttrCate.productAttributeList.length > 0
          ) {
            for (let j = 0; j < productAttrCate.productAttributeList.length; j++) {
              children.push({
                label: productAttrCate.productAttributeList[j].name,
                value: productAttrCate.productAttributeList[j].id
              })
            }
          }
          this.filterAttrs.push({
            label: productAttrCate.name,
            value: productAttrCate.id,
            children: children
          })
        }
      })
    },
    getProductAttributeIdList() {
      // 获取选中的筛选商品属性
      const productAttributeIdList = []
      for (let i = 0; i < this.filterProductAttrList.length; i++) {
        const item = this.filterProductAttrList[i]
        if (item.value !== null && item.value.length === 2) {
          productAttributeIdList.push(item.value[1])
        }
      }
      return productAttributeIdList
    },
    onSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$confirm('是否提交数据', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.isEdit) {
              this.productCate.productAttributeIdList = this.getProductAttributeIdList()
              updateProductCate(this.$route.query.id, this.productCate).then(
                response => {
                  this.$message({
                    message: '修改成功',
                    type: 'success',
                    duration: 1000
                  })
                  this.$router.back()
                }
              )
            } else {
              this.productCate.productAttributeIdList = this.getProductAttributeIdList()
              createProductCate(this.productCate).then(response => {
                this.$refs[formName].resetFields()
                this.resetForm(formName)
                this.$message({
                  message: '提交成功',
                  type: 'success',
                  duration: 1000
                })
              })
            }
          })
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
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.productCate = Object.assign({}, defaultProductCate)
      this.getSelectProductCateList()
      this.filterProductAttrList = [
        {
          value: []
        }
      ]
    },
    removeFilterAttr(productAttributeId) {
      if (this.filterProductAttrList.length === 1) {
        this.$message({
          message: '至少要留一个',
          type: 'warning',
          duration: 1000
        })
        return
      }
      var index = this.filterProductAttrList.indexOf(productAttributeId)
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
        })
        return
      }
      this.filterProductAttrList.push({
        value: null,
        key: Date.now()
      })
    }
  }
}
</script>

<style scoped>
.table_tit {
  font-weight: 600;
}
</style>
