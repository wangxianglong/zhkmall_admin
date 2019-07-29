<template>
  <div class="app-container">
    <el-card class="box-card">
      <h3>商品介绍</h3>
      <el-form
        ref="goods"
        :rules="rules"
        :model="goods"
        label-width="150px"
        style="margin-right: 40px;"
      >
        <el-form-item label="品牌编号" prop="brandId">
          <el-input v-model="goods.brandId" placeholder="请输入品牌编号" />
        </el-form-item>
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="goods.brandName" placeholder="请输入品牌名称" />
        </el-form-item>
        <!-- <el-form-item label="专柜价格">
          <el-input v-model="goods.counterPrice" placeholder="请输入专柜价格">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>-->
        <el-form-item label="市场价" prop="originalPrice">
          <el-input v-model="goods.originalPrice" placeholder="请输入市场价">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="是否在售">
          <el-radio-group v-model="goods.isOnSale">
            <el-radio :label="true">在售</el-radio>
            <el-radio :label="false">未售</el-radio>
          </el-radio-group>
        </el-form-item>-->
        <el-form-item label="删除状态">
          <el-select v-model="goods.deleteStatus" placeholder="请选择">
            <el-option
              v-for="(item, index) in delStatusMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="新品状态">
          <el-select v-model="goods.newStatus" placeholder="请选择">
            <el-option
              v-for="(item, index) in newStatusMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-select v-model="goods.publishStatus" placeholder="请选择">
            <el-option
              v-for="(item, index) in publishStatusMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="促销类型">
          <el-select v-model="goods.promotionType" placeholder="请选择">
            <el-option
              v-for="(item, index) in promotionTypeMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态">
          <el-select v-model="goods.recommandStatus" placeholder="请选择">
            <el-option
              v-for="(item, index) in recommandStatusMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="goods.verifyStatus" placeholder="请选择">
            <el-option
              v-for="(item, index) in verifyStatusMap"
              :key="index"
              :label="item"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否为预告商品">
          <el-switch v-model="goods.previewStatus" active-color="#13ce66" />
        </el-form-item>
        <!-- <el-form-item label="商品图片">
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
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>-->

        <el-form-item label="画册图片">
          <el-upload
            :http-request="fnUploadRequest"
            :show-file-list="true"
            :file-list="albumPics"
            :on-remove="handleRemove"
            :on-exceed="beyondFile"
            :limit="5"
            :before-upload="beforeAvatarUpload"
            list-type="picture-card"
            action
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>

        <el-form-item label="商品单位">
          <el-input v-model="goods.unit" placeholder="例: 件 / 个 / 盒" />
        </el-form-item>

        <el-form-item label="关键字">
          <el-tag
            v-for="tag in keywords"
            :key="tag"
            closable
            type="primary"
            @close="handleClose(tag)"
          >{{ tag }}</el-tag>
          <el-input
            v-if="newKeywordVisible"
            ref="newKeywordInput"
            v-model="newKeyword"
            class="input-new-keyword"
            placeholder="鼠标点击移出或回车创建"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            class="button-new-keyword"
            size="small"
            type="primary"
            @click="showInput"
          >+ 增加</el-button>
        </el-form-item>

        <el-form-item label="所属分类">
          <el-cascader
            :options="categoryList"
            v-model="categoryIds"
            change-on-select
            @change="handleCategoryChange"
          />
        </el-form-item>

        <el-form-item label="商品描述">
          <el-input v-model="goods.description" placeholder="请输入商品描述" />
        </el-form-item>

        <el-form-item label="商品详细介绍">
          <Tinymce ref="editor" :height="400" v-model="goods.detail" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <h3>商品规格</h3>
      <el-button
        :plain="true"
        type="primary"
        style="margin-bottom: 10px;"
        @click="handleSpecificationShow"
      >添加</el-button>

      <el-table :data="specifications" border fit highlight-current-row>
        <el-table-column align="center" property="specification" label="规格名" />
        <el-table-column align="center" property="value" label="规格值">
          <template slot-scope="scope">
            <el-tag type="primary">{{ scope.row.value }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" property="picUrl" label="规格图片">
          <template slot-scope="scope">
            <img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="40" >
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="操作"
          width="250"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleSpecificationDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="specVisiable" title="设置规格">
        <el-form
          ref="specForm"
          :rules="specRules"
          :model="specForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="margin:0 50px;"
        >
          <el-form-item label="规格名" prop="specification">
            <el-input v-model="specForm.specification" placeholder="请输入规格名" />
          </el-form-item>
          <el-form-item label="规格值" prop="value">
            <el-input v-model="specForm.value" placeholder="请输入规格值" />
          </el-form-item>
          <el-form-item label="规格图片" prop="picUrl">
            <el-upload
              :http-request="fnUploadspecImg"
              :show-file-list="true"
              :file-list="specImg"
              :on-remove="removeSpecImg"
              :on-exceed="beyondFile"
              :limit="1"
              :before-upload="beforeAvatarUpload"
              list-type="picture-card"
              action
            >
              <i class="el-icon-plus" />
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="specVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleSpecificationAdd">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <el-card class="box-card">
      <h3>商品库存</h3>
      <el-table :data="products" border fit highlight-current-row>
        <el-table-column align="center" property="value" label="货品规格">
          <template slot-scope="scope">
            <el-tag v-for="tag in scope.row.specifications" :key="tag">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" property="price" label="货品售价" />
        <el-table-column align="center" property="number" label="货品数量" />
        <el-table-column align="center" property="url" label="货品图片">
          <template slot-scope="scope">
            <img v-if="scope.row.url" :src="scope.row.url" width="40" >
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleProductShow(scope.row)">设置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="productVisiable" title="设置货品">
        <el-form
          ref="productForm"
          :rules="productRules"
          :model="productForm"
          status-icon
          label-position="left"
          label-width="100px"
          style="margin: 0 50px;"
        >
          <el-form-item label="货品规格列" prop="specifications">
            <el-tag v-for="tag in productForm.specifications" :key="tag">{{ tag }}</el-tag>
          </el-form-item>
          <el-form-item label="货品售价" prop="price">
            <el-input-number v-model="productForm.price" :min="0" />
          </el-form-item>
          <el-form-item label="货品数量" prop="number">
            <el-input-number v-model="productForm.number" :min="0" />
          </el-form-item>
          <el-form-item label="货品图片" prop="url">
            <el-upload
              :http-request="fnUploadproductImg"
              :show-file-list="true"
              :file-list="productImg"
              :on-remove="removeProductImg"
              :on-exceed="beyondFile"
              :limit="1"
              :before-upload="beforeAvatarUpload"
              list-type="picture-card"
              action
            >
              <i class="el-icon-plus" />
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="productVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleProductEdit">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <el-card class="box-card">
      <h3>商品参数</h3>
      <el-button
        :plain="true"
        type="primary"
        style="margin-bottom: 10px;"
        @click="handleAttributeShow"
      >添加</el-button>
      <el-table :data="attributes" border fit highlight-current-row>
        <el-table-column align="center" property="attribute" label="商品参数名称" />
        <el-table-column align="center" property="value" label="商品参数值" />
        <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleAttributeDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="attributeVisiable" title="设置商品参数">
        <el-form
          ref="attributeForm"
          :rules="attributeRules"
          :model="attributeForm"
          status-icon
          label-position="left"
          label-width="110px"
          style="width: 400px; margin-left:50px;"
        >
          <el-form-item label="商品参数名称" prop="attribute">
            <el-input v-model="attributeForm.attribute" placeholder="请输入参数名称" />
          </el-form-item>
          <el-form-item label="商品参数值" prop="value">
            <el-input v-model="attributeForm.value" placeholder="请输入参数值" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="attributeVisiable = false">取消</el-button>
          <el-button type="primary" @click="handleAttributeAdd">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <div class="op-container">
      <el-button @click="$router.back(-1)">取消</el-button>
      <el-button type="primary" @click="handleEdit">更新商品</el-button>
    </div>
  </div>
</template>

<script>
import { detailGoods, editGoods, publishGoods } from '@/api/mall'
import Tinymce from '@/components/Tinymce'
import oss from '@/utils/aliOss'
import { promptMessage } from '@/utils/index'

export default {
  name: 'GoodsEdit',
  components: { Tinymce },
  data() {
    return {
      newKeywordVisible: false,
      newKeyword: '',
      keywords: [],
      albumPicsFileList: [],
      categoryList: [],
      brandList: [],
      categoryIds: [],
      albumPics: [],
      picUrl: [],
      specImg: [],
      productImg: [],
      delStatusMap: ['未删除', '已删除'],
      newStatusMap: ['不是新品', '新品'],
      recommandStatusMap: ['不推荐', '推荐'],
      publishStatusMap: ['下架', '上架'],
      promotionType: ['无促销', '促销价', '会员价', '阶梯价', '满减价', '限时购'],
      verifyStatusMap: ['未审核', '审核通过'],
      goods: { albumPics: [] },
      specVisiable: false,
      specForm: { specification: '', value: '', picUrl: '' },
      specifications: [],
      productVisiable: false,
      productForm: {
        id: 0,
        specifications: [],
        price: 0.0,
        number: 0,
        url: ''
      },
      products: [],
      attributeVisiable: false,
      attributeForm: { attribute: '', value: '' },
      attributes: [],
      rules: {
        brandId: [{ required: true, message: '商品编号不能为空', trigger: 'blur' }],
        brandName: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
        originalPrice: [{ required: true, message: '请填写市场价', trigger: 'blur' }]
      },
      specRules: {
        specification: [{ required: true, message: '规格名不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '规格值不能为空', trigger: 'blur' }]
      },
      productRules: {
        price: [{ required: true, message: '请填写市场价', trigger: 'blur' }],
        number: [{ required: true, message: '请填写数量', trigger: 'blur' }]
      },
      attributeRules: {
        attribute: [{ required: true, message: '参数名不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '参数值不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.init()
    // this.getlistCatAndBrand()
  },
  methods: {
    init() {
      if (this.$route.query.id == null) {
        return
      }
      const goodsId = this.$route.query.id
      detailGoods(goodsId).then(response => {
        var data = response.data.data
        var productsIndex = 0
        this.goods = data.goods
        this.specifications = data.specifications
        data.products.forEach(item => {
          item.id = productsIndex
          productsIndex++
        })
        this.products = data.products
        this.attributes = data.attributes
        this.categoryIds = data.categoryIds
        if (data.goods.albumPics.length > 0) {
          var albumPics = []
          data.goods.albumPics.forEach(item => {
            albumPics.push({ url: item })
          })
          this.albumPics = albumPics
        }
        if (data.goods.picUrl) {
          this.picUrl.push({ url: data.goods.picUrl })
        }

        this.albumPicsFileList = []
        for (var i = 0; i < this.goods.albumPics.length; i++) {
          this.albumPicsFileList.push({
            url: this.goods.albumPics[i]
          })
        }
        const keywords = response.data.data.goods.keywords
        if (keywords !== null) {
          this.keywords = keywords.split(',')
        }
      })
    },
    // getlistCatAndBrand() {
    //   listCatAndBrand().then(response => {
    //     this.categoryList = response.data.data.categoryList
    //     this.brandList = response.data.data.brandList
    //   })
    // },
    handleCategoryChange(value) {
      this.goods.categoryId = value[value.length - 1]
    },
    handleEdit() {
      this.goods.brandId = this.goods.brandId.replace(/(^\s*)|(\s*$)/g, '')
      this.goods.brandName = this.goods.brandName.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['goods'].validate(valid => {
        if (valid) {
          if (promptMessage(Array, this.specifications, '添加商品规格')) {
            if (promptMessage(Array, this.products, '填写商品库存')) {
              if (this.picUrl.length > 0) {
                this.goods.picUrl = this.picUrl[0].url
              } else {
                this.goods.picUrl = ''
              }
              if (this.albumPics.length > 0) {
                var albumPicsArr = []
                this.albumPics.forEach(item => {
                  albumPicsArr.push(item.url)
                })
                this.goods.albumPics = albumPicsArr
              }
              const finalGoods = {
                goods: this.goods,
                specifications: this.specifications,
                products: this.products,
                attributes: this.attributes
              }
              if (this.$route.query.id == null) {
                publishGoods(finalGoods).then(response => {
                  this.$notify.success({
                    title: '成功',
                    message: '创建成功'
                  })
                  this.$router.go(-1)
                })
              } else {
                finalGoods.goods.id = this.$route.query.id
                editGoods(finalGoods).then(response => {
                  this.$notify.success({
                    title: '成功',
                    message: '修改成功'
                  })
                  this.$router.go(-1)
                })
              }
            }
          }
        }
      })
    },
    async fnUploadRequest(option) {
      oss.ossUploadFile(option).then(res => {
        this.albumPics.push({ url: res.fileUrl })
      })
    },
    async fnUploadpicUrl(option) {
      oss.ossUploadFile(option).then(res => {
        this.picUrl = [{ url: res.fileUrl }]
      })
    },
    async fnUploadspecImg(option) {
      oss.ossUploadFile(option).then(res => {
        this.specForm.picUrl = res.fileUrl
      })
    },
    async fnUploadproductImg(option) {
      oss.ossUploadFile(option).then(res => {
        this.productForm.url = res.fileUrl
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
    // 删除图片
    handleRemove(file, fileList) {
      this.albumPics.forEach((item, index) => {
        if (item.name === file.name) {
          this.albumPics.splice(index, 1)
        }
      })
    },
    handleRemovePic(file, fileList) {
      this.picUrl = []
    },
    removeSpecImg(file, fileList) {
      this.specForm.picUrl = ''
    },
    removeProductImg(file, fileList) {
      this.productForm.url = ''
    },
    // 添加多个文件事件
    beyondFile(files, fileList) {
      this.$message({
        message: '最多上传' + fileList.length + '张图片',
        type: 'error'
      })
    },
    handleClose(tag) {
      this.keywords.splice(this.keywords.indexOf(tag), 1)
      this.goods.keywords = this.keywords.toString()
    },
    showInput() {
      this.newKeywordVisible = true
      this.$nextTick(_ => {
        this.$refs.newKeywordInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      const newKeyword = this.newKeyword.replace(/(^\s*)|(\s*$)/g, '')
      if (newKeyword) {
        this.keywords.push(newKeyword)
        this.goods.keywords = this.keywords.toString()
      }
      this.newKeywordVisible = false
      this.newKeyword = ''
    },
    handleSpecificationShow() {
      this.specImg = []
      this.specForm = { specification: '', value: '', picUrl: '' }
      this.specVisiable = true
    },
    handleSpecificationAdd() {
      this.specForm.specification = this.specForm.specification.replace(/(^\s*)|(\s*$)/g, '')
      this.specForm.value = this.specForm.value.replace(/(^\s*)|(\s*$)/g, '')
      this.$refs['specForm'].validate(valid => {
        if (valid) {
          var index = this.specifications.length - 1
          for (var i = 0; i < this.specifications.length; i++) {
            const v = this.specifications[i]
            if (v.specification === this.specForm.specification) {
              index = i
            }
          }
          this.specifications.splice(index + 1, 0, this.specForm)
          this.specVisiable = false
          this.specToProduct()
        }
      })
    },
    handleSpecificationDelete(row) {
      const index = this.specifications.indexOf(row)
      this.specifications.splice(index, 1)
      this.products.forEach((item, index) => {
        if (item.specifications[0] === row.value) {
          this.products.splice(index, 1)
        }
      })
      this.specToProduct()
    },
    specToProduct() {
      if (this.specifications.length === 0) {
        return
      }
      // 根据specifications创建临时规格列表
      var specValues = []
      var spec = this.specifications[0].specification
      var values = []
      values.push(0)

      for (var i = 1; i < this.specifications.length; i++) {
        const aspec = this.specifications[i].specification

        if (aspec === spec) {
          values.push(i)
        } else {
          specValues.push(values)
          spec = aspec
          values = []
          values.push(i)
        }
      }
      specValues.push(values)

      // 根据临时规格列表生产货品规格
      // 算法基于 https://blog.csdn.net/tyhj_sf/article/details/53893125
      var productsIndex = 0
      var products = []
      var combination = []
      var n = specValues.length
      for (var s = 0; s < n; s++) {
        combination[s] = 0
      }
      var index = 0
      var isContinue = false
      do {
        var specifications = []
        for (var x = 0; x < n; x++) {
          var z = specValues[x][combination[x]]
          specifications.push(this.specifications[z].value)
        }
        products[productsIndex] = {
          id: productsIndex,
          specifications: specifications,
          price: 0.0,
          number: 0,
          url: ''
        }
        productsIndex++

        index++
        combination[n - 1] = index
        for (var j = n - 1; j >= 0; j--) {
          if (combination[j] >= specValues[j].length) {
            combination[j] = 0
            index = 0
            if (j - 1 >= 0) {
              combination[j - 1] = combination[j - 1] + 1
            }
          }
        }
        isContinue = false
        for (var p = 0; p < n; p++) {
          if (combination[p] !== 0) {
            isContinue = true
          }
        }
      } while (isContinue)

      this.products = products
    },
    handleProductShow(row) {
      this.productForm = Object.assign({}, row)
      this.productImg = []
      if (row.url) {
        this.productImg.push({ url: row.url })
      }
      this.productVisiable = true
    },
    handleProductEdit() {
      this.$refs['productForm'].validate(valid => {
        if (valid) {
          for (var i = 0; i < this.products.length; i++) {
            const v = this.products[i]
            if (v.id === this.productForm.id) {
              this.products.splice(i, 1, this.productForm)
              break
            }
          }
          this.productVisiable = false
        }
      })
    },
    handleAttributeShow() {
      this.attributeForm = {}
      this.attributeVisiable = true
    },
    handleAttributeAdd() {
      this.$refs['attributeForm'].validate(valid => {
        if (valid) {
          this.attributes.unshift(this.attributeForm)
          this.attributeVisiable = false
        }
      })
    },
    handleAttributeDelete(row) {
      const index = this.attributes.indexOf(row)
      this.attributes.splice(index, 1)
    }
  }
}
</script>

<style>
.el-card {
  margin-bottom: 10px;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
.input-new-keyword {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
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
  width: 145px;
  height: 145px;
  display: block;
}
</style>
