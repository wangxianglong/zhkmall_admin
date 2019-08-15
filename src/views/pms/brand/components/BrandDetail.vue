<template>
  <el-card class="form-container" shadow="never">
    <el-form ref="brandFrom" :model="brand" :rules="rules" label-width="150px">
      <el-form-item label="品牌名称：" prop="name">
        <el-input v-model="brand.name" />
      </el-form-item>
      <el-form-item label="品牌首字母：">
        <el-input v-model="brand.firstLetter" />
      </el-form-item>
      <el-form-item label="排序：" prop="sort">
        <el-input v-model.number="brand.sort" />
      </el-form-item>
      <el-form-item label="品牌LOGO：" prop="logo">
        <el-upload
          :http-request="fnUploadLogoUrl"
          :show-file-list="true"
          :file-list="logoUrl"
          :on-remove="handleRemoveLogo"
          :on-exceed="beyondFile"
          :limit="1"
          :before-upload="beforeAvatarUpload"
          list-type="picture-card"
          action
        >
          <i class="el-icon-plus" />
        </el-upload>
      </el-form-item>
      <el-form-item label="品牌专区大图：">
        <el-upload
          :http-request="fnUploadBigPicUrl"
          :show-file-list="true"
          :file-list="bigPicUrl"
          :on-remove="handleRemoveBigPic"
          :on-exceed="beyondFile"
          :limit="1"
          :before-upload="beforeAvatarUpload"
          list-type="picture-card"
          action
        >
          <i class="el-icon-plus" />
        </el-upload>
      </el-form-item>
      <el-form-item label="品牌故事：">
        <el-input v-model="brand.brandStory" :rows="2" placeholder="请输入内容" type="textarea" />
      </el-form-item>
      <el-form-item label="是否显示：">
        <el-radio-group v-model="brand.showStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="品牌制造商：">
        <el-radio-group v-model="brand.factoryStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button v-if="!isEdit" @click="resetForm('brandFrom')">重置</el-button>
        <el-button type="primary" @click="onSubmit('brandFrom')">提交</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script>
import { createBrand, getBrand, updateBrand } from '@/api/brand'
import oss from '@/utils/aliOss'

const defaultBrand = {
  bigPic: '',
  brandStory: '',
  factoryStatus: 0,
  firstLetter: '',
  logo: '',
  name: '',
  showStatus: 0,
  sort: 0
}
export default {
  name: 'BrandDetail',
  // components: { SingleUpload },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      brand: Object.assign({}, defaultBrand),
      logoUrl: [],
      bigPicUrl: [],
      rules: {
        name: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' }
        ],
        sort: [
          { type: 'number', message: '排序必须为数字' }
        ]
      }
    }
  },
  created() {
    if (this.isEdit) {
      getBrand(this.$route.query.id).then(response => {
        const data = response.data
        this.logoUrl.push({ url: data.logo })
        if (data.bigPic) {
          this.bigPicUrl.push({ url: data.bigPic })
        }
        this.brand = response.data
      })
    } else {
      this.brand = Object.assign({}, defaultBrand)
    }
  },
  methods: {
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$confirm('是否提交数据', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            if (this.logoUrl.length === 0) {
              this.$message({
                message: '请上传品牌Logo',
                type: 'warning',
                duration: 1500
              })
              return
            }
            this.brand.logo = this.logoUrl[0].url
            if (this.bigPicUrl.length > 0) {
              this.brand.bigPic = this.bigPicUrl[0].url
            }
            if (this.isEdit) {
              updateBrand(this.$route.query.id, this.brand).then(response => {
                this.$refs[formName].resetFields()
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration: 1000
                })
                this.$router.back()
              })
            } else {
              createBrand(this.brand).then(response => {
                this.$refs[formName].resetFields()
                this.$message({
                  message: '提交成功',
                  type: 'success',
                  duration: 1000
                })
                this.$router.back()
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
    async fnUploadLogoUrl(option) {
      oss.ossUploadFile(option).then(res => {
        this.logoUrl = [{ url: res.fileUrl }]
      })
    },
    async fnUploadBigPicUrl(option) {
      oss.ossUploadFile(option).then(res => {
        this.bigPicUrl = [{ url: res.fileUrl }]
      })
    },
    beforeAvatarUpload(file) {
      let isIMAGE = false
      if (
        file.type === 'image/jpeg' ||
        file.type === 'image/gif' ||
        file.type === 'image/png'
      ) {
        isIMAGE = true
      }
      if (!isIMAGE) {
        this.$message.error('上传文件只能是图片格式!')
      }
      return isIMAGE
    },
    handleRemoveLogo(file, fileList) {
      this.logoUrl = []
    },
    handleRemoveBigPic(file, fileList) {
      this.bigPicUrl = []
    },
    // 添加多个文件事件
    beyondFile(files, fileList) {
      this.$message({
        message: '最多上传' + fileList.length + '张图片',
        type: 'error'
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
      this.brand = Object.assign({}, defaultBrand)
    }
  }
}
</script>
<style>
</style>

