<template>
  <div class="upload-container">
    <el-button
      :style="{background:color,borderColor:color}"
      icon="el-icon-upload"
      size="mini"
      type="primary"
      @click=" dialogVisible=true"
    >上传图片</el-button>
    <el-dialog :visible.sync="dialogVisible" append-to-body>
      <el-upload
        :http-request="fnUploadRequest"
        :show-file-list="true"
        :file-list="fileList"
        :limit="5"
        :on-remove="handleRemove"
        :on-exceed="beyondFile"
        action
        list-type="picture-card"
      >
        <i class="el-icon-plus"/>
      </el-upload>
      <el-row style="margin-top: 20px;">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import oss from '@/utils/aliOss'

export default {
  name: 'SlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    }
  },
  data() {
    return {
      dialogVisible: false,
      fileList: []
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('successCBK', this.fileList)
      this.fileList = []
      this.dialogVisible = false
    },
    // 上传
    async fnUploadRequest(option) {
      oss.ossUploadFile(option).then(res => {
        this.fileList.push({ url: res.fileUrl })
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
    // 删除图片
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 添加多个文件事件
    beyondFile(files, fileList) {
      this.$message({
        message: '最多上传' + fileList.length + '张图片',
        type: 'error'
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>
