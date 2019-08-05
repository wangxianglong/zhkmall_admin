<template>
  <div class="table-bg">
    <el-table
      ref="relatedData"
      :data="data"
      :show-header="showHeader"
      tooltip-effect="dark"
      border
      style="width: 100%"
      @selection-change="selectRow"
    >
      <div v-if="tableType === 'table'">
        <el-table-column type="selection" width="45" align="center"></el-table-column>
        <template v-for="(col, index) in columns">
          <el-table-column :prop="col.value" :label="col.headName" :key="index" align="center">
            <template slot-scope="{row}">
              <el-input v-model="row[col.value]"></el-input>
            </template>
          </el-table-column>
        </template>
      </div>
      <div v-else-if="tableType === 'astrict'">
        <div v-if="data[0].desc">
          <el-table-column align="center" label prop="desc" />
          <el-table-column align="center" label prop="condition" />
          <el-table-column label align="center">
            <template slot-scope="{row}">
              <el-input v-model="row.reference"></el-input>
            </template>
          </el-table-column>
        </div>
        <div v-else>
          <el-table-column label align="center">
            <template slot-scope="{row}">
              <el-input v-model="row.reference"></el-input>
            </template>
          </el-table-column>
          <el-table-column align="center" label prop="condition" />
        </div>
      </div>
      <div v-if="tableType === 'section'">
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column align="center" label prop="totalPrice" />
        <el-table-column align="center" label="价格" prop="price">
          <template slot-scope="{row}">
            <el-input v-model="row.price"></el-input>
          </template>
        </el-table-column>
        <el-table-column align="center" label="收取" prop="gather" />
        <el-table-column align="center" label="固定费" prop="fixedCharge">
          <template slot-scope="{row}">
            <el-input v-model="row.fixedCharge"></el-input>
          </template>
        </el-table-column>
        <el-table-column align="center" label="或" prop="or" />
        <el-table-column align="center" label="总价(x%)" prop="percentage">
          <template slot-scope="{row}">
            <el-input v-model="row.percentage"></el-input>
          </template>
        </el-table-column>
      </div>
    </el-table>
  </div>
</template>

<script>
/**
 * table组件：
 * 传入data，columns
 * columns可传入模板函数，
 * 可定义单元格点击事件，
 * 可编辑，
 * 可选择，
 * 前台分页，
 * 前台排序，
 * 配置需要格式化的金额
 */
export default {
  name: 'xmtz',
  data() {
    return {
      selectlistRow: [],
      relatedNum: 1,
    }
  },
  props: {
    data: {
      type: [Array, Object],
      required: true
    },
    tableType: String,
    showHeader: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array,
      default: () => []
    },
  },
  methods: {
    // 获取表格选中时的数据
    selectRow(val) {
      this.$emit("selectlistRow", val)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
