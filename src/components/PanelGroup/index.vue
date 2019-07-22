<template>
  <el-row :gutter="40" class="panel-group">
    <el-col
      v-for="(item, index) in statistics"
      :key="index"
      :xs="12"
      :sm="8"
      :md="8"
      :lg="8"
      :xl="4"
      class="card-panel-col"
    >
      <div class="card-panel">
        <div :class="'card-panel-icon-wrapper ' + item.colorClass">
          <svg-icon :icon-class="item.iconClass" class-name="card-panel-icon"/>
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">{{ item.desc }}</div>
          <count-to :start-val="0" :end-val="item.endVal" :decimals="2" :duration="2600" class="card-panel-num"/>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  props: {
    statistics: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {}
  },
  created() { },
  methods: {}
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.panel-group {
  .card-panel-col {
    margin-bottom: 20px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .purple {
        background: #621295;
      }
      .blue {
        background: #36a3f7;
      }
      .red {
        background: #f4516c;
      }
      .green {
        background: #34bfa3;
      }
      .yellowish {
        background: #f7e0a3;
      }
    }
    .purple {
      color: #621295;
    }
    .blue {
      color: #36a3f7;
    }
    .red {
      color: #f4516c;
    }
    .green {
      color: #34bfa3;
    }
    .yellowish {
      color: #f7e0a3;
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
