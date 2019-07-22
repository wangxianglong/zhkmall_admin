<template>
  <div class="app-container">
    <el-form
      ref="settingForm"
      :model="settingForm"
      status-icon
      label-position="left"
      label-width="110px"
      style="margin: 0 40px;"
    >
      <el-card class="box-card" shadow="hover" style="margin-bottom: 15px;">
        <el-row>
          <el-col :span="8">
            <el-form-item label="配送类型">
              <el-select
                v-model="settingForm.type"
                style="width: 200px"
                class="filter-item"
                @change="getList"
              >
                <el-option
                  v-for="item in deliveryMap"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="满额免运费(元)">
              <el-input-number v-model="settingForm.settingVo.amount" :min="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否开启">
              <el-switch v-model="settingForm.settingVo.enabled"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="说明">
              <el-input
                v-model="settingForm.settingVo.explain"
                :autosize="{ minRows: 2, maxRows: 4}"
                style="width: 90%;"
                type="textarea"
                placeholder="请输入说明"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="起送价">
              <el-input-number v-model="settingForm.settingVo.sendPrice" :min="0"/>
            </el-form-item>
          </el-col>
        </el-row>

        <div>
          <el-button type="primary" size="small" @click.prevent="addRow()">增加配送信息</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="small"
            @click.prevent="delData()"
          >删除配送信息</el-button>
          <el-button
            v-permission="['POST /admin/distribution/create']"
            type="primary"
            size="small"
            @click="updateData"
          >保存设置</el-button>
        </div>
      </el-card>
      <el-table
        ref="relatedData"
        :data="settingForm.voList"
        tooltip-effect="dark"
        border
        stripe
        style="width: 100%"
        @selection-change="selectRow"
      >
        <el-table-column type="selection" width="45" align="center"/>
        <el-table-column label="配送金额(元)" align="center">
          <template slot-scope="scope">
            <el-input :min="0" v-model="scope.row.price" type="number"/>
          </template>
        </el-table-column>
        <el-table-column label="配送时间(分钟)" align="center">
          <template slot-scope="scope">
            <el-input :min="0" v-model="scope.row.minute" type="number"/>
          </template>
        </el-table-column>
        <el-table-column label="配送距离-开始(m)" align="center">
          <template slot-scope="scope">
            <el-input :min="0" v-model="scope.row.distanceMin" type="number"/>
          </template>
        </el-table-column>
        <el-table-column label="配送距离-结束(m)" align="center">
          <template slot-scope="scope">
            <el-input :min="0" v-model="scope.row.distanceMax" type="number"/>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import { addShip, detShip } from '@/api/platform'
import checkPermission from '@/utils/permission' // 权限判断函数

const TypeMap = {
  1: '商城配送',
  2: '外卖配送'
}

export default {
  name: 'ShippingSet',
  data() {
    return {
      list: null,
      TypeMap,
      listLoading: true,
      relatedNum: 0,
      settingForm: {
        type: 1,
        settingVo: {
          amount: 0
        },
        voList: []
      },
      selectlistRow: [],
      deliveryMap: [{
        value: 1,
        label: '商城配送'
      }, {
        value: 2,
        label: '外卖配送'
      }]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      detShip({ type: this.settingForm.type }).then(res => {
        this.settingForm = res.data.data
        this.settingForm.voList.forEach(item => {
          item.sort = this.relatedNum
          this.relatedNum += 1
        })
        this.listLoading = false
      })
    },
    updateData() {
      addShip(this.settingForm).then(res => {
        this.$notify({
          title: '成功',
          message: '设置成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    // 获取表格选中时的数据
    selectRow(val) {
      this.selectlistRow = val
    },
    // 增加行
    addRow() {
      var list = {
        sort: this.relatedNum,
        price: this.price,
        minute: this.minute,
        distanceMax: this.distanceMax,
        distanceMin: this.distanceMin
      }
      this.settingForm.voList.push(list)
      this.relatedNum += 1
    },
    // 删除选中行
    delData() {
      for (let i = 0; i < this.selectlistRow.length; i++) {
        var val = this.selectlistRow
        // 获取选中行的索引的方法
        // 遍历表格中relatedData数据和选中的val数据，比较它们的sort,相等则输出选中行的索引
        val.forEach((val, index) => {
          this.settingForm.voList.forEach((v, i) => {
            if (val.sort === v.sort) {
              // i 为选中的索引
              this.settingForm.voList.splice(i, 1)
            }
          })
        })
      }
      // // 删除完数据之后清除勾选框
      this.$refs.relatedData.clearSelection()
    }
  }
}
</script>
