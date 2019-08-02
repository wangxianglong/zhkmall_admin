<template>
  <div class="table-bg">
    <el-table ref="multipleTable" :data="data" border style="width: 100%">
      <template v-for="(col, index) in columns">
        <el-table-column :prop="col.value" :label="col.headName" :key="index" align="center">
          <template slot-scope="{row}">
            <el-input v-model="row[col.value]"></el-input>
          </template>
        </el-table-column>
      </template>
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
      multipleSelection: [],//已选中的行
      isUpdateSelection: true,//是否更新已选中
    }
  },
  props: {
    data: {
      type: [Array, Object],
      required: true
    },
    columns: {
      type: Array,
      default: () => []
    },
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.table-bg {
  height: 100%;
}
.btn-mxsh {
  background: #3492ff;
  text-indent: 18px;
  padding: 7px 10px 8px 10px;
}
.btable-tooltip {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
