<template>
  <div :id="id" :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '400px'
    },
    xdata: {
      type: Array,
      default() {
        return []
      }
    },
    marketarray: {
      type: Array,
      default() {
        return []
      }
    },
    numberarray: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        title: {
          text: '最近一个月订单统计',
          x: 'center',
          align: 'right'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['订单数', '销售额']
        },
        // toolbox: {
        //   feature: {
        //     dataView: { show: true, readOnly: false },
        //     magicType: { show: true, type: ['line', 'bar'] },
        //     restore: { show: true },
        //     saveAsImage: { show: true }
        //   }
        // },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: { onZero: false },
            data: this.xdata
          }
        ],
        yAxis: [
          {
            name: '订单数',
            type: 'value'
          },
          {
            name: '销售额(元)',
            type: 'value'
          }
        ],
        series: [
          {
            name: '订单总数',
            type: 'line',
            stack: '总量',
            smooth: true,
            symbolSize: 5,
            areaStyle: {
              color: '#5BBFE3'
            },
            yAxisIndex: 0,
            itemStyle: {
              normal: {
                color: '#5AB4ED'
              }
            },
            data: this.numberarray
          },
          {
            name: '销售总额',
            type: 'line',
            stack: '总量',
            smooth: true,
            symbolSize: 5,
            areaStyle: {
              color: '#5EE1C6'
            },
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: '#22D6B1'
              }
            },
            data: this.marketarray
          }
        ]
      })
    }
  }
}
</script>
