<template>
  <div class="dashboard-editor-container">
    <panel-group :statistics="statistics"/>
    <el-row>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>商城待处理事务</span>
        </div>
        <div v-for="(value, key, index) in dataInfo.mallPending" :key="index">
          <el-col v-if="value !== 0" :span="8" class="text item">
            <div class="text_cont">
              <div>{{ pendingMap[key] }}</div>
              <div class="red_text">({{ value }})</div>
            </div>
          </el-col>
        </div>
      </el-card>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>外卖待处理事务</span>
        </div>
        <div v-for="(value, key, index) in dataInfo.takeoutPending" :key="index">
          <el-col v-if="value !== 0" :span="8" class="text item">
            <div class="text_cont">
              <div>{{ pendingMap[key] }}</div>
              <div class="red_text">({{ value }})</div>
            </div>
          </el-col>
        </div>
      </el-card>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>餐券待处理事务</span>
        </div>
        <div v-for="(value, key, index) in dataInfo.couponPending" :key="index">
          <el-col v-if="value !== 0" :span="8" class="text item">
            <div class="text_cont">
              <div>{{ pendingMap[key] }}</div>
              <div class="red_text">({{ value }})</div>
            </div>
          </el-col>
        </div>
      </el-card>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-col :span="12" style="padding-right: 10px;">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>商城商品总览</span>
          </div>
          <div class="displayf">
            <div v-for="(value, key, index) in dataInfo.goods" :key="index">
              <div class="red_text">{{ value }}</div>
              <div>{{ previewMap[key] }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" style="padding-left: 10px;">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>外卖菜品总览</span>
          </div>
          <div class="displayf">
            <div v-for="(value, key, index) in dataInfo.supper" :key="index">
              <div class="red_text">{{ value }}</div>
              <div>{{ previewMap[key] }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" style="padding: 10px 10px 0 0;">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>用户总览</span>
          </div>
          <div class="displayf">
            <div v-for="(value, key, index) in dataInfo.user" :key="index">
              <div class="red_text">{{ value }}</div>
              <div>{{ userMap[key] }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>商城订单统计</span>
        </div>
        <el-col :span="4" class="order_total">
          <div v-for="(item, index) in mallOrder" :key="index">
            <div class="order_text">
              <div>{{ item.desc }}</div>
              <div class="big_text">{{ item.num.toFixed(2) }}</div>
              <div>
                <span v-if="item.increase >= 0" class="positive">+{{ item.increase.toFixed(2) }}%</span>
                <span v-else class="negative">{{ item.increase.toFixed(2) }}%</span>
                <span class="gary">{{ item.compare }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <!-- <el-col :span="20">
          <chart
            :xdata="mallChart.dateArray"
            :marketarray="mallChart.marketArray"
            :numberarray="mallChart.numberArray"
            :id="'mallOrder'"
            height="400px"
            width="100%"
          />
        </el-col> -->
      </el-card>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>外卖订单统计</span>
        </div>
        <el-col :span="4" class="order_total">
          <div v-for="(item, index) in takeoutOrder" :key="index">
            <div class="order_text">
              <div>{{ item.desc }}</div>
              <div class="big_text">{{ item.num.toFixed(2) }}</div>
              <div>
                <span v-if="item.increase >= 0" class="positive">+{{ item.increase.toFixed(2) }}%</span>
                <span v-else class="negative">{{ item.increase.toFixed(2) }}%</span>
                <span class="gary">{{ item.compare }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <!-- <el-col :span="20">
          <chart
            :xdata="takeoutChart.dateArray"
            :marketarray="takeoutChart.marketArray"
            :numberarray="takeoutChart.numberArray"
            :id="'takeoutOrder'"
            height="400px"
            width="100%"
          />
        </el-col> -->
      </el-card>
    </el-row>

    <el-row style="margin-top: 20px;">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>餐券订单统计</span>
        </div>
        <el-col :span="4" class="order_total">
          <div v-for="(item, index) in couponOrder" :key="index">
            <div class="order_text">
              <div>{{ item.desc }}</div>
              <div class="big_text">{{ item.num.toFixed(2) }}</div>
              <div>
                <span v-if="item.increase >= 0" class="positive">+{{ item.increase.toFixed(2) }}%</span>
                <span v-else class="negative">{{ item.increase.toFixed(2) }}%</span>
                <span class="gary">{{ item.compare }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <!-- <el-col :span="20">
          <chart
            :xdata="couponChart.dateArray"
            :marketarray="couponChart.marketArray"
            :numberarray="couponChart.numberArray"
            :id="'couponOrder'"
            height="400px"
            width="100%"
          />
        </el-col> -->
      </el-card>
    </el-row>
  </div>
</template>

<script>
import { dashboard } from '@/api/dashboard'
import PanelGroup from '@/components/PanelGroup'
import Chart from '@/components/Charts/LineMarker'
import { Loading } from 'element-ui'

export default {
  components: {
    PanelGroup,
    Chart
  },
  data() {
    return {
      statistics: [],
      leftMallOrder: {},
      dataInfo: {
        couponOrderStatistics: undefined,
        couponPending: undefined,
        goods: undefined,
        mallOrderStatistics: undefined,
        mallPending: undefined,
        supper: undefined,
        takeoutOrderStatistics: undefined,
        takeoutPending: undefined,
        total: undefined,
        user: undefined
      },
      pendingMap: {
        completed: '已完成订单',
        obligation: '待付款订单',
        waitConsignment: '待发货订单',
        waitReceiving: '待收货订单',
        waitRefund: '待退款订单',
        consignmented: '已发货订单'
      },
      previewMap: {
        all: '全部商品',
        downed: '已下架',
        shortStock: '库存紧张',
        uped: '已上架'
      },
      userMap: {
        amount: '会员总数',
        newMonth: '本月新增',
        newToday: '今日新增',
        newYesterday: '昨日新增'
      },
      orderMap: {
        marketMonth: '本月销售总额',
        marketMonthContrast: '同比上月',
        marketWeek: '本周销售总额',
        marketWeekContrast: '同比上周',
        orderMonth: '本月订单总数',
        orderMonthContrast: '同比上月',
        orderWeek: '本周订单总数',
        orderWeekContrast: '同比上周'
      },
      mallChart: undefined,
      takeoutChart: undefined,
      couponChart: undefined,
      mallOrder: [],
      takeoutOrder: [],
      couponOrder: []
    }
  },
  created() {
    this.$nextTick(() => {
      this.getData()
    })
  },
  methods: {
    getData() {
      var loadingInstance = Loading.service({
        target: '.dashboard-editor-container',
        lock: true,
        fullscreen: false,
        text: 'Loading',
        spinner: 'el-icon-loading'
      })
      dashboard().then(res => {
        this.dataInfo = Object.assign({}, res.data)
        var total = this.dataInfo.total
        // this.mallChart = (({ dateArray, marketArray, numberArray }) => ({
        //   dateArray,
        //   marketArray,
        //   numberArray
        // }))(this.dataInfo.mallOrderStatistics)
        // this.takeoutChart = (({ dateArray, marketArray, numberArray }) => ({
        //   dateArray,
        //   marketArray,
        //   numberArray
        // }))(this.dataInfo.takeoutOrderStatistics)
        // this.couponChart = (({ dateArray, marketArray, numberArray }) => ({
        //   dateArray,
        //   marketArray,
        //   numberArray
        // }))(this.dataInfo.couponOrderStatistics)
        // this.mallOrder = this.formatStatistics(
        //   this.dataInfo.mallOrderStatistics
        // )
        // this.takeoutOrder = this.formatStatistics(
        //   this.dataInfo.takeoutOrderStatistics
        // )
        // this.couponOrder = this.formatStatistics(
        //   this.dataInfo.couponOrderStatistics
        // )
        var statistics = []
        statistics.push({
          colorClass: 'blue',
          iconClass: 'documentation',
          desc: '今日订单总数',
          endVal: total.orderToday
        })
        statistics.push({
          colorClass: 'yellowish',
          iconClass: 'documentation',
          desc: '昨日订单总数',
          endVal: total.orderYesterday
        })
        statistics.push({
          colorClass: 'blue',
          iconClass: 'shopping',
          desc: '今日销售总额',
          endVal: total.marketToday
        })
        statistics.push({
          colorClass: 'yellowish',
          iconClass: 'shopping',
          desc: '昨日销售总额',
          endVal: total.marketYesterday
        })
        statistics.push({
          colorClass: 'green',
          iconClass: 'money',
          desc: '近7天销售总额',
          endVal: total.marketSeven
        })
        statistics.push({
          colorClass: 'green',
          iconClass: 'money',
          desc: '近7天订单总数',
          endVal: total.orderSeven
        })
        this.statistics = statistics
        this.$nextTick(() => {
          // 以服务的方式调用的 Loading 需要异步关闭
          loadingInstance.close()
        })
      })
    },
    formatStatistics(data) {
      return [
        {
          desc: '本月销售总额',
          num: data.marketMonth,
          increase: data.marketMonthContrast,
          compare: '同比上月'
        },
        {
          desc: '本周销售总额',
          num: data.marketWeek,
          increase: data.marketWeekContrast,
          compare: '同比上周'
        },
        {
          desc: '本月订单总数',
          num: data.orderMonth,
          increase: data.orderMonthContrast,
          compare: '同比上月'
        },
        {
          desc: '本周订单总数',
          num: data.orderWeek,
          increase: data.orderWeekContrast,
          compare: '同比上周'
        }
      ]
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .box-card {
    padding-bottom: 20px;
    .clearfix {
      font-weight: bold;
    }
    .text {
      padding: 5px 10px;
    }
    .text_cont {
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #edf0f6;
      .red_text {
        color: #ff6161;
      }
    }
    .displayf {
      text-align: center;
      display: flex;
      justify-content: space-around;
      align-items: center;
      .red_text {
        color: #ff6161;
        font-size: 20px;
        padding-bottom: 10px;
      }
    }
    .order_total {
      border-right: 1px solid #edf0f6;
      .order_text > div {
        margin: 10px 0;
      }
      .big_text {
        font-size: 20px;
      }
      .positive {
        color: #82c248;
      }
      .negative {
        color: #f66e85;
      }
      .gary {
        color: #d2c8cf;
      }
    }
  }
}
</style>
