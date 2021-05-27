<template>
  <div class="indicator-panel">
    <NaviTitle :navi-title="[{ name: '播报位置合理性看板'}]" />
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnSearch" 
      :loading="loading" 
      :has-cancel="false"
    />
    <div class="tab-wrapper" v-if="tabCardDatas && dynamicComputed">
      <div class="tab" 
        v-for="(value, key) in tabCardDatas" :class="key === activeTitle ? 'active' : ''" 
        v-bind:key="key"
        @click="handleOnClickTab(key, value)">
        <div class="tab-header">
          <div class="header-l">
            {{ key }}  
          </div>
          <div class="header-r">
            {{ dynamicComputed[key].date }}
          </div>
        </div>
        <div class="tab-content">
          <div class="tab-rate">
            <div class="tab-rate_item" v-for="(itm, idx) in value.rate.label" v-bind:key="idx">
              <p class="item-value">{{ dynamicComputed[key].rate[idx] || '--%' }}</p>
              <p class="item-label">{{ itm }}</p>
            </div>
          </div>
          <div class="tab-compared">
            <div class="tab-compared_item">
              <p class="item-value">
                <template v-if="dynamicComputed[key].compared">
                  {{ dynamicComputed[key].compared }}
                  <Icon :type="dynamicComputed[key].compared.includes('-') ? 'md-trending-down' : 'md-trending-up'" />
                </template>
                <template v-else>
                  --%
                </template>
              </p>
              <p class="item-label">{{ value.compared.label }}</p>
            </div>
          </div>
        </div>
        <div class="tab-footer">
          <p class="tab-footer_item">
            {{ value.count.label }}: 
            <span>{{ dynamicComputed[key].count }}</span>
          </p>
          <p class="tab-footer_item">
            {{ value.desc.label }}: 
            <span>{{ value.desc.value }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="tab-block" v-if="chartData">
      <div class="title">
        <div class="title-l">
          {{ chartData && chartData.title }}
        </div>
        <div class="title-r">
          <Poptip trigger="hover" width="200" placement="left-start">
            <div slot="title" style="text-align: left">提示</div>
            <div slot="content" style="text-align: left;white-space: normal;word-break: break-all;">
              点击图表小圆点拉取当天播报详细分类图表
            </div>
            <Icon v-if="chartData.title && chartData.title === '播报位置一致率'" type="md-alert" />
          </Poptip>
        </div>
      </div>
      <div class="indicate-line" :style="lineStyle"></div>
      <VeLine :data="chartData" :events="chart1Events"></VeLine>
    </div>
    <div class="tab-block" v-if="indicatorDetail && indicatorDetail.length === 3">
      <template v-for="(item, index) in indicatorDetail" v-if="item.title" >
        <div class="tab-block-item">
          <div class="item-title">
            <div class="title-l">
              {{ item.title }} ({{ item.date }})
            </div>
            <div class="title-r">
              <Poptip trigger="hover" width="200" placement="left-start">
                <div slot="title" style="text-align: left">计算方法</div>
                <div slot="content" style="text-align: left;white-space: normal;word-break: break-all;">
                  {{ item.desc }}
                </div>
                <Icon type="ios-help-circle" />
              </Poptip>
            </div>
          </div>
          <div class="item-info">
            <div class="info-wrapper">
              <div class="info">
                <p class="info-value">
                  {{ dynamicIndicatorDetail[item.type].rate || item.rate.value }}
                </p>
                <p class="info-label">
                  {{ item.rate.label }}
                </p>
              </div>
              <div class="info">
                <p class="info-value">
                  {{ dynamicIndicatorDetail[item.type].compared || item.compared.value }}
                  <Icon :type="(dynamicIndicatorDetail[item.type].compared || item.compared.value).includes('-') ? 'md-trending-down' : 'md-trending-up'" />
                </p>
                <p class="info-label">
                  {{ item.compared.label }}
                </p>
              </div>
              <div class="info" style="display: flex">
                <div style="margin: auto;width: 50%;padding-left: 10%">
                  <p style="text-align: left;padding: 2px 0;" 
                    v-for="(c, i) in (dynamicIndicatorDetail[item.type].competitions || item.competitions)" 
                    v-bind:key="i">
                      {{ c.label }}: {{ c.value }}
                    </p>
                </div>
              </div>
            </div>
          </div>
          <div class="item-range">
            区间输入({{ index === 2 ? 'm' : 's' }})：
            <InputNumber
              v-model="dynamicIndicatorDetail[item.type].min"
              placeholder="左边界"
              style="width: 120px;text-align: left">
            </InputNumber>
            ~
            <InputNumber
              v-model="dynamicIndicatorDetail[item.type].max"
              placeholder="右边界"
              style="width: 120px;text-align: left">
            </InputNumber>&nbsp;
            <Button @click="handleOnIntervalChange(item.type, item.date)" type="primary">完成</Button>&nbsp;
            <Button @click="handleOnIntervalChange(item.type, item.date, true)">重置</Button>
          </div>
          <div class="item-chart">
            <VeLine 
              :settings="{area: true}" 
              :data="dynamicGraph[item.type]">
            </VeLine>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import VeLine from 'v-charts/lib/line.common'
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import { SelectItem } from '@/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { getAnalysisReport, getIndicateDetail, getDiffRate } from '@/presenter/indicator.pre'
import moment from 'moment'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
interface FormObjI {
  city: number[]
  dateRange: string[]
}

@Component({
  components: {
    NaviTitle,
    NFilter,
    VeLine
  }
})
export default class IndicatorPanel extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    city: {
      type: 'select-multi',
      label: '城市',
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 32, 33, 34, 35, 36, 38, 47, 84, 85, 86, 88, 132, 133, 153],
      options: this.cityList,
      placeholder: '选择城市',
      style: { width: '250px' },
      validate: () => this.filterOptions.city.value.length ? '' : '请选择城市'
    },
    dateRange: {
      type: 'daterange',
      label: '时间',
      value: [
        moment().subtract(17, 'days').format('YYYY-MM-DD'),
        moment().subtract(1, 'days').format('YYYY-MM-DD')
      ],
      placeholder: '选择时间范围',
      style: { width: '200px' },
      validate: () => this.filterOptions.dateRange.value.length ? '' : '请选择时间范围'
    }
  }
  options = {
    disabledDate(date: Date) {
      return date && date.valueOf() >= Date.now() - 86400000
    }
  }
  activeTitle = '播报位置准确率'
  indicatorDetail: any = []
  dynamicComputed: any = null
  dynamicIndicatorDetail: any = {
    start_time_diff:  {
      min: 0,
      max: 0,
      graph: {
        columns: [],
        rows: []
      }
    },
    end_time_diff:  {
      min: 0,
      max: 0,
      graph: {
        columns: [],
        rows: []
      }
    },
    code_diff:  {
      min: 0,
      max: 0,
      graph: {
        columns: [],
        rows: []
      }
    }
  }
  tabCardDatas: any = null
  lineStyle: any = {}
  loading: boolean = false

  @Watch('tabCardDatas', { immediate: false, deep: true })
  handleOnTabCardDataChange(val: any, oldVal: any) {
    if (!val) {
      return
    }
    for (const title in val) {
      if (val.hasOwnProperty(title)) {
        const v = val[title]
        const { graph } = v
        const { rows } = graph
        this.dynamicComputed[title] = {
          date: '',
          rate: [''], // 准确率 x% || 'x%, y%, z%' --- good, same, bad
          compared: '', // 对比上周数据? x% || x% --- good
          count: '', // 样本量
          counts: [], // 时间范围样本集合
          chart: rows, // 图表数据
          ...this.dynamicComputed[title]
        }
      }
    }
  }

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get cityList() {
    return this.baseConfig.city_list
  }
  get distanceInterval() {
    const indicatorDetail = this.indicatorDetail
    const mapRange: any = {}
    indicatorDetail.forEach((item: any) => {
      const { title, distance } = item
      mapRange[title] = this.parseToLabelValue(distance) || []
    })
    return mapRange
  }
  get chartData() {
    if (!this.tabCardDatas) {
      return null
    }
    const activeTitle = this.activeTitle
    return this.tabCardDatas[activeTitle].graph
  }
  get chart1Events() {
    return {
      click: async (e: any) => {
        const { event, data, seriesName, dataIndex } = e
        const { offsetX, offsetY } = event
        this.lineStyle = {
          left: offsetX + 19 + 'px',
          opacity: 1
        }
        const title = this.activeTitle
        const date = data[0]
        let rate = data[1]

        // 计算 compared
        const compared = await this.getComputedRate(date, title, rate)

        // 计算 rate
        const { counts, chart } = this.dynamicComputed[title]
        if (['准确率', '一致率'].includes(seriesName)) {
          rate = [`${rate}%`]
        } else {
          const item = chart.filter((itm: any) => itm['日期'] === date.toString())[0]
          rate = [
            `${item['Good']}%`,
            `${item['Same']}%`,
            `${item['Bad']}%`
          ]
        }
        this.dynamicComputed[title] = {
          ...this.dynamicComputed[title],
          date,
          rate,
          count: counts[dataIndex],
          compared
        }
        // 对象值没有被跟踪？强制UI刷新
        this.$forceUpdate()
        if (title === '播报位置一致率') {
          this.pullIndicateDetail(date)
        }
      }
    }
  }
  get dynamicGraph() {
    return {
      start_time_diff: this.compositeGraph(0, this.dynamicIndicatorDetail['start_time_diff'].graph),
      end_time_diff: this.compositeGraph(1, this.dynamicIndicatorDetail['end_time_diff'].graph),
      code_diff: this.compositeGraph(2, this.dynamicIndicatorDetail['code_diff'].graph)
    }
  }

  compositeGraph(index: number, graph: any) {
    const remoteGraph = this.indicatorDetail[index].graph
    const { columns, rows } = graph
    return {
      columns: [
        ...remoteGraph.columns,
        ...columns
      ],
      rows: remoteGraph.rows.map((r: any, i: number) => {
        const sameAxisItem = rows.filter((_r: any) => _r['距离差'] === r['距离差'])
        if (sameAxisItem[0]) {
          return {
            ...r,
            ...sameAxisItem[0]
          }
        } else {
          return r
        }
      })
    }
  }
  parseToLabelValue(distance: any) {
    return distance && distance.map((d: number) => {
      return {
        label: `${d}m`,
        value: d
      }
    })
  }
  async getComputedRate(date: string, title: string, rate: number) {
    const { city } = this.filterOptions
    const diffRate = await getDiffRate(-7, city.value, title)
    const compared_value = (rate / 100 - (diffRate || 0))
    const compared = compared_value ? (
      compared_value > 0 ? `+${compared_value.toFixed(2)}%` : `${compared_value.toFixed(2)}%`
    ) : `+${compared_value}%`
    return compared
  }
  async handleOnSearch() {
    this.loading = true
    const { city, dateRange } = this.filterOptions
    this.tabCardDatas = null
    this.dynamicComputed = null
    this.lineStyle = {}
    const data = await getAnalysisReport({
      city: city.value,
      start_date: moment(dateRange.value[0]).format('YYYY-MM-DD'),
      end_date: moment(dateRange.value[1]).format('YYYY-MM-DD')
    })
    this.tabCardDatas = data
    this.loading = false
    if (!data) {
      return
    }
    // 初始化当前激活的tab
    await this.initCurrentTab(data['播报位置一致率'], '播报位置一致率')
    await this.initCurrentTab(data['播报位置准确率'], '播报位置准确率')
  }
  async initCurrentTab(data: any, title: string, shouldPullDetail?: boolean) {
    this.activeTitle = title
    if (!this.dynamicComputed) {
      this.dynamicComputed = {}
    }
    if (!data) {
      return
    }
    // 二次点击不再初始化
    if (this.dynamicComputed[title] && this.dynamicComputed[title].date) {
      return
    }
    const { last_date, rate, compared, count, counts, graph } = data
    const { rows } = graph

    const compared_rate = await this.getComputedRate(last_date, title, Number(rate.value[0].replace('%', '')))

    this.dynamicComputed[title] = {
      ...this.dynamicComputed[title],
      rate: rate.value,
      compared: compared_rate,
      count: count.value,
      counts,
      chart: rows,
      date: last_date
    }
    this.$forceUpdate()
    if (shouldPullDetail) {
      this.pullIndicateDetail(last_date)
    }
  }
  async handleOnClickTab(key: string, value: any) {
    // if (key === '播报位置GSB评测') {
    //   return
    // }
    this.lineStyle = {}
    await this.initCurrentTab(value, key, key === '播报位置一致率')
    this.indicatorDetail = []
    this.dynamicIndicatorDetail = {
      start_time_diff:  {
        max: 0,
        min: 0,
        graph: {
          columns: [],
          rows: []
        }
      },
      end_time_diff:  {
        max: 0,
        min: 0,
        graph: {
          columns: [],
          rows: []
        }
      },
      code_diff:  {
        max: 0,
        min: 0,
        graph: {
          columns: [],
          rows: []
        }
      }
    }
  }
  async pullIndicateDetail(date: string) {
    const scopeObj = {
      max_scope: 30,
      min_scope: -30
    }
    const { city } = this.filterOptions
    const indicatorDetail = await getIndicateDetail(date, scopeObj, city.value, '')
    this.indicatorDetail = indicatorDetail
  }
  async handleOnIntervalChange(type: string, date: string, reset?: boolean) {
    if (reset) {
      this.dynamicIndicatorDetail[type] = {
        max: 0,
        min: 0,
        graph: {
          columns: [],
          rows: []
        }
      }
      return
    }
    const { max, min } = this.dynamicIndicatorDetail[type]
    const scopeObj = { min_scope: min, max_scope: max }
    const { city } = this.filterOptions
    const data = await getIndicateDetail(date, scopeObj, city.value, type)
    if (!data) {
      return
    }
    const seriesName = `${min} ~ ${max}`
    // @ts-ignore
    const { chart, early, late, rate, same, compare } = data
    const { distance, num } = chart
    this.dynamicIndicatorDetail[type] = {
      max,
      min,
      graph: {
        columns: [seriesName],
        rows: distance.map((d: number, i: number) => {
          return {
            [seriesName]: num[i],
            '距离差': `${d}${type.includes('time') ? 's' : 'm'}`
          }
        })
      },
      rate: `${(rate * 100).toFixed(2)}%`,
      compared: `${(compare * 100).toFixed(4)}%`,
      competitions: [
        {
          label: '早于竞品',
          value: early
        },
        {
          label: '晚于竞品',
          value: late
        },
        {
          label: '竞品一致',
          value: same
        }
      ]
    }
  }
  async mounted() {
    this.handleOnSearch()
  }
}
</script>

<style lang="less" scoped>
  .tab-wrapper {
    margin: 20px 0;
    display: flex;
    align-items: top;
    justify-content: space-between;
    .tab {
      width: 32%;
      padding: 20px;
      background-color: #ffffff;
      position: relative;
      cursor: pointer;
      transition: all .3s ease-in-out;
      .tab-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        border-left: 6px solid #FF7D41;
        background-color: #fff7f3;
        color: #19293f;
        font-size: 14px;
        .header-r {
          color: #ff7d41;
          text-align: right;
        }
      }
      .tab-content {
        display: flex;
        align-items: center;
        padding: 20px 0;
        justify-content: space-between;
        .tab-rate {
          display: flex;
          width: 50%;
          justify-content: space-between;
          align-items: center;
          .tab-rate_item {
            width: 100%;
            .item-value {
              text-align: center;
              color: #ff7d41;
              font-size: 24px;
            }
            .item-label {
              padding: 5px 0;
              text-align: center;
              font-size: 12px;
              color: #19293f;
            }
          }
        }
        .tab-compared {
          width: 50%;
          border-left: 1px solid #dddee1;
          .tab-compared_item {
            .item-value {
              text-align: center;
              color: #878787;
              font-size: 24px;
            }
            .item-label {
              padding: 5px 0;
              text-align: center;
              font-size: 12px;
              color: #19293f;
            }
          }
        }
      }
      .tab-footer {
        .tab-footer_item {
          padding: 5px 0;
          font-size: 12px;
          color: #878787;
          span {
            color: #0d0000;
          }
        }
      }
      &:last-child {
        .tab-rate {
          flex: 1;
          .tab-rate_item {
            width: 33.333%;
          }
        }
        .tab-compared {
          width: auto;
          padding: 0 20px;
        }
      }
      &:hover {
        box-shadow: 0 0 13px rgba(0, 0, 0, 0.1);
      }
      &.active {
        box-shadow: 0 0 13px rgba(0, 0, 0, 0.1);
        &::after {
          content: ' ';
          position: absolute;
          top: 100%;
          bottom: 0;
          left: 50%;
          width: 20px;
          height: 20px;
          transform: translateX(-50%);
          border-top: solid 20px #fff;
          border-left: solid 20px transparent;
          border-right: solid 20px transparent;
        }
      }
    }
  }
  .tab-block {
    position: relative;
    width: 100%;
    padding: 20px;
    background-color: #ffffff;
    margin-bottom: 20px;
    .title {
      display: flex;
      align-items: center;
      padding-left: 8px;
      border-left: 6px solid #FF7D41;
      color: #19293f;
      font-size: 14px;
      margin-bottom: 10px;
      .title-l {
        flex: 1;
      }
      .title-r {
        font-size: 18px;
        text-align: right;
        font-weight: 500;
        color: #ff6600;
      }
    }
    .indicate-line {
      position: absolute;
      opacity: 0;
      height: 261px;
      width: 1px;
      left: 0;
      top: 117px;
      border-left: 1px solid #f60;
      transition: left 0.2s ease-in-out;
    }
    .tab-block-item {
      margin-bottom: 20px;
      border: 1px solid #0d00001a;
      .item-title {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px;
        border-bottom: 1px solid #0d00001a;
        .title-l {
          flex: 1;
          padding-left: 8px;
          border-left: 6px solid #FF7D41;
          color: #19293f;
          font-size: 14px;
        }
        .title-r {
          text-align: right;
          font-size: 18px;
          color: #ff6600;
          font-weight: 500;
        }
      }
      .item-info {
        display: flex;
        .info-wrapper {
          display: flex;
          width: 80%;
          align-items: center;
          padding: 20px 0;
          margin: auto;
          justify-content: space-between;
          .info {
            width: 50%;
            text-align: center;
            .info-value {
              color: #ff7d41;
              font-size: 24px;
            }
            .info-label {
              padding: 5px 0;
              font-size: 12px;
              color: #19293f;
            }
          }
        }
      }
      .item-range {
        text-align: center;
        padding: 30px 200px;
      }
    }
  }
</style>
