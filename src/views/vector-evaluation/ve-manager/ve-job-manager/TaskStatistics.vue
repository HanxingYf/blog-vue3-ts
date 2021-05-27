<template>
  <div class="task-statistics">
    <div class="task-name">任务名称: {{ query.job_name }}</div>
    <div class="pie-container">
      <div class="pie" v-for="(pie, index) in pieDatas" :key="index">
        <div class="title">{{ pie.title }}</div>
        <VePie :data="pie.chartData" :settings="setting" />
      </div>
    </div>
    <div class="statistics">{{ statistics }}</div>
    <div class="table-container">
      <Table :columns="contentColumns" :span-method="handleSpan1" ref="content" :data="contentDataSource" border size="small">
        <template slot-scope="{ row, index }" slot="jumpto">
          <template v-if="row.category_to ">
            <router-link :to="row.category_to">{{ row.category }}</router-link>
          </template>
          <template v-else>{{ row.category }}</template>
        </template>
        <template slot-scope="{ row, index }" slot="q_1_jumpto">
          <router-link :to="row.q_1_to">{{ row.q_1_reason }}</router-link>
        </template>
        <template slot-scope="{ row, index }" slot="q_2_jumpto">
          <router-link :to="row.q_2_to">{{ row.q_2_reason }}</router-link>
        </template>
      </Table>
      <Button style="margin: 10px 0" type="primary" @click="handleOnExportData('content')">导出CSV</Button>
      <Table style="margin-top: 10px" :span-method="handleSpan2" :columns="tickColumns" ref="tick" :data="tickDataSource" border size="small">
        <template slot-scope="{ row, index }" slot="jumpto">
          <template v-if="row.category_to ">
            <router-link :to="row.category_to">{{ row.category }}</router-link>
          </template>
          <template v-else>{{ row.category }}</template>
        </template>
        <template slot-scope="{ row, index }" slot="q_1_jumpto">
          <router-link :to="row.q_1_to">{{ row.q_1_reason }}</router-link>
        </template>
        <template slot-scope="{ row, index }" slot="q_2_jumpto">
          <router-link :to="row.q_2_to">{{ row.q_2_reason }}</router-link>
        </template>
      </Table>
      <Button style="margin: 10px 0" type="primary" @click="handleOnExportData('tick')">导出CSV</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import echarts from 'echarts';
import { SelectItem, Columns, DistributorI } from '@/types'
import { contentColumns, tickColumns } from './columns'
import { getUsersByRole } from '@/presenter/common.pre'
import * as vectorManager from '@/models/manager/vector'
import VePie from 'v-charts/lib/pie.common'
import { BaseConfigI } from '@/models/distribute_config';

@Component({
  components: { VePie }
})
export default class TaskStatistics extends Vue {
  contentDataSource: any[] = []
  tickDataSource: any[] = []
  contentColumns = contentColumns
  tickColumns = tickColumns
  exportContentLoading: boolean = false
  exportTickLoading: boolean = false
  pieDatas: Array<{
    title: string
    chartData: {
      columns: string[],
      rows: Array<{ [propName: string]: any }>
    }
  }> = []
  statistics: string = ''
  setting = {
    label: {
      formatter: '{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
      backgroundColor: '#eee',
      borderColor: '#aaa',
      borderWidth: 1,
      borderRadius: 4,
      rich: {
        a: {
          color: '#999',
          lineHeight: 22,
          align: 'center'
        },
        hr: {
          borderColor: '#aaa',
          width: '100%',
          borderWidth: 0.5,
          height: 0
        },
        b: {
          fontSize: 12,
          lineHeight: 20
        },
        per: {
          color: '#eee',
          backgroundColor: '#334455',
          padding: [2, 4],
          borderRadius: 2
        }
      }
    }
  }

  get flags() {
    return this.$store.state.userInfo.flags
  }
  get query() {
    const route = this.$route
    const { job_id, job_name, dispatch_count, case_count } = route.query
    return {
      job_id: +job_id,
      job_name: `${job_name}`,
      dispatch_count: +dispatch_count,
      case_count: +case_count
    }
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }

  async init() {
    const data = await vectorManager.getStatistic(this.query.job_id )
    if (!data) {
      return
    }
    const {
      marked, // 标注总数
      valid, // 验证总数
      version_a, // 新版本好
      version_b, // 旧版本好
      version_all_good, // 两方都好
      version_all_bad, // 两方都不好
      recall, // 召回
      un_recall, // 不召回
      accurate, // 准确
      inaccurate, // 不准确
      beautiful, // 美观
      ugly, // 不美观
      show_range_small, // 展示范围小
      show_range_big, // 展示范围大
      road_missing, // 道路缺失
      road_break, // 道路断裂
      road_redundancy, // 道路冗余
      road_error, // 道路错误
      road_overlapping, // 道路重叠
      road_angle, // 道路角度
      road_crossing, // 道路交叉
      arrow_angle, // 角度不垂直
      arrow_direction, // 方向错误
      arrow_position, // 位置错误
      arrow_turning_point, // 转折点错误
      arrow_bending, // 严重弯折
      arrow_over_range, // 超出范围
      other_traffic_flow, // 车流方向
      other_barrier, // 隔离带比例失调
      beauty_scale, // 比例失调
      beauty_redundancy, // 冗余
      beauty_sign_err, // 标识异常
      beauty_cross_link_err, // 交叉点link异常
      beauty_arrow_short, // 箭头过短
      beauty_arrow_rough, // 箭头不平滑
      beauty_arrow_crossing, // 箭头交叉
      beauty_issue_num // 美观问题个数占比序列（按顺序第一个元素值代表1个的数量，第二个元素值2个的数量）
    } = data
    this.pieDatas = [
      {
        title: '新旧版本评价占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '新版本', '数量': version_a },
            { '类别': '旧版本', '数量': version_b },
            { '类别': '两方都好', '数量': version_all_good },
            { '类别': '两方都不好', '数量': version_all_bad }
          ]
        }
      },
      {
        title: '策略是否召回占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '是', '数量': recall },
            { '类别': '否', '数量': un_recall }
          ]
        }
      },
      {
        title: '效果准确度占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '准确', '数量': accurate },
            { '类别': '不准确', '数量': inaccurate }
          ]
        }
      },
      {
        title: '展示内容问题分类占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '展示范围', '数量': show_range_small + show_range_big },
            { '类别': '道路问题', '数量': road_missing + road_break + road_redundancy + road_error + road_overlapping + road_angle + road_crossing },
            { '类别': '诱导箭头', '数量': arrow_angle + arrow_direction + arrow_position + arrow_turning_point + arrow_bending + arrow_over_range },
            { '类别': '其他页面元素', '数量': other_traffic_flow + other_barrier }
          ]
        }
      },
      {
        title: '效果美观度占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': 'G', '数量': beautiful },
            { '类别': 'B', '数量': ugly }
          ]
        }
      },
      {
        title: '美观度问题个数占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: beauty_issue_num.map((item, index) => ({
            '类别': index + 1,
            '数量': item
          }))
        }
      }
    ]
    const { case_count, dispatch_count } = this.query
    this.statistics = `总数量: ${case_count}; 分发数量: ${dispatch_count}; 已标注数量: ${marked}; 有效数量: ${valid}`
    const contentTotal = accurate + inaccurate
    const { job_id, job_name } = this.query
    const prefixTo = `/vector-evaluation/task-manager/task-detail?job_id=${job_id}&job_name=${job_name}`
    const showRangeAll = this.baseConfig.enlarge_map_show_range.map((it) => it.value).join(',')
    const roadIssueAll = this.baseConfig.enlarge_map_issue_road.map((it) => it.value).join(',')
    const arrowIssueAll = this.baseConfig.enlarge_map_issue_arrow.map((it) => it.value).join(',')
    const otherIssueAll = this.baseConfig.enlarge_map_issue_other.map((it) => it.value).join(',')
    const beautyRoadIssueAll = this.baseConfig.enlarge_map_beauty_road.map((it) => it.value).join(',')
    const beautyArrowIssueAll = this.baseConfig.enlarge_map_beauty_arrow.map((it) => it.value).join(',')
    const roadIssueTotal = road_missing +
      road_break +
      road_redundancy +
      road_error +
      road_overlapping +
      road_angle +
      road_crossing
    const arrowIssueTotal = arrow_angle +
      arrow_direction +
      arrow_position +
      arrow_turning_point +
      arrow_bending +
      arrow_over_range
    const otherIssueTotal = other_traffic_flow + other_barrier
    this.contentDataSource = [
      {
        category: '准确',
        category_to: `${prefixTo}&tag=1`,
        num: accurate,
        ratio: this.parseToRatioStr(accurate, contentTotal),
        q_1_reason: '',
        q_1_to: ``,
        q_2_reason: '',
        q_2_to: ``,
        q_2_num: '',
        q_2_ratio: ''
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '展示范围',
        q_1_to: `${prefixTo}&tag=2&show_range=${showRangeAll}`,
        q_2_reason: '偏大',
        q_2_to: `${prefixTo}&tag=2&show_range=1`,
        q_2_num: show_range_big,
        q_2_ratio: this.parseToRatioStr(show_range_big, show_range_big + show_range_small)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '展示范围',
        q_1_to: `${prefixTo}&tag=2&show_range=${showRangeAll}`,
        q_2_reason: '偏小',
        q_2_to: `${prefixTo}&tag=2&show_range=2`,
        q_2_num: show_range_small,
        q_2_ratio: this.parseToRatioStr(show_range_small, show_range_big + show_range_small)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '缺失',
        q_2_to: `${prefixTo}&tag=2&road_issue=1`,
        q_2_num: road_missing,
        q_2_ratio: this.parseToRatioStr(road_missing, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '断裂',
        q_2_to: `${prefixTo}&tag=2&road_issue=2`,
        q_2_num: road_break,
        q_2_ratio: this.parseToRatioStr(road_break, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '冗余',
        q_2_to: `${prefixTo}&tag=2&road_issue=4`,
        q_2_num: road_redundancy,
        q_2_ratio: this.parseToRatioStr(road_redundancy, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '错误',
        q_2_to: `${prefixTo}&tag=2&road_issue=8`,
        q_2_num: road_error,
        q_2_ratio: this.parseToRatioStr(road_error, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '重叠',
        q_2_to: `${prefixTo}&tag=2&road_issue=16`,
        q_2_num: road_overlapping,
        q_2_ratio: this.parseToRatioStr(road_overlapping, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '角度',
        q_2_to: `${prefixTo}&tag=2&road_issue=32`,
        q_2_num: road_angle,
        q_2_ratio: this.parseToRatioStr(road_angle, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&tag=2&road_issue=${roadIssueAll}`,
        q_2_reason: '交叉',
        q_2_to: `${prefixTo}&tag=2&road_issue=64`,
        q_2_num: road_crossing,
        q_2_ratio: this.parseToRatioStr(road_crossing, roadIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&tag=2&arrow_issue=${arrowIssueAll}`,
        q_2_reason: '角度不垂直',
        q_2_to: `${prefixTo}&tag=2&arrow_issue=1`,
        q_2_num: arrow_angle,
        q_2_ratio: this.parseToRatioStr(arrow_angle, arrowIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&tag=2&arrow_issue=${arrowIssueAll}`,
        q_2_reason: '方向错误',
        q_2_to: `${prefixTo}&tag=2&arrow_issue=2`,
        q_2_num: arrow_direction,
        q_2_ratio: this.parseToRatioStr(arrow_direction, arrowIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&tag=2&arrow_issue=${arrowIssueAll}`,
        q_2_reason: '位置错误',
        q_2_to: `${prefixTo}&tag=2&arrow_issue=4`,
        q_2_num: arrow_position,
        q_2_ratio: this.parseToRatioStr(arrow_position, arrowIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&tag=2&arrow_issue=${arrowIssueAll}`,
        q_2_reason: '转折点错误',
        q_2_to: `${prefixTo}&tag=2&arrow_issue=8`,
        q_2_num: arrow_turning_point,
        q_2_ratio: this.parseToRatioStr(arrow_turning_point, arrowIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&tag=2&arrow_issue=${arrowIssueAll}`,
        q_2_reason: '严重弯曲',
        q_2_to: `${prefixTo}&tag=2&arrow_issue=16`,
        q_2_num: arrow_bending,
        q_2_ratio: this.parseToRatioStr(arrow_bending, arrowIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&tag=2&arrow_issue=${arrowIssueAll}`,
        q_2_reason: '超出范围',
        q_2_to: `${prefixTo}&tag=2&arrow_issue=32`,
        q_2_num: arrow_over_range,
        q_2_ratio: this.parseToRatioStr(arrow_over_range, arrowIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: inaccurate,
        ratio: this.parseToRatioStr(inaccurate, contentTotal),
        q_1_reason: '其他页面元素',
        q_1_to: `${prefixTo}&tag=2&other_issue=${otherIssueAll}`,
        q_2_reason: '车流方向',
        q_2_to: `${prefixTo}&tag=2&other_issue=1`,
        q_2_num: other_traffic_flow,
        q_2_ratio: this.parseToRatioStr(other_traffic_flow, otherIssueTotal)
      },
      {
        category: '不准确',
        category_to: `${prefixTo}&tag=2`,
        num: other_barrier,
        ratio: this.parseToRatioStr(other_barrier, contentTotal),
        q_1_reason: '其他页面元素',
        q_1_to: `${prefixTo}&tag=2&other_issue=${otherIssueAll}`,
        q_2_reason: '隔离带比例失调',
        q_2_to: `${prefixTo}&tag=2&other_issue=2`,
        q_2_num: other_barrier,
        q_2_ratio: this.parseToRatioStr(other_barrier, otherIssueTotal)
      },
      {
        category: '总计',
        num: contentTotal,
        ratio: '100%',
        q_1_reason: '',
        q_1_to: ``,
        q_2_reason: '',
        q_2_to: ``,
        q_2_num: '',
        q_2_ratio: ''
      }
    ]
    const tickTotal = beautiful + ugly
    const beautyRoadIssueTotal = beauty_scale +
      beauty_redundancy +
      beauty_sign_err +
      beauty_cross_link_err
    const beautyArrowIssueTotal = beauty_arrow_short +
      beauty_arrow_rough +
      beauty_arrow_crossing
    this.tickDataSource = [
      {
        category: 'G',
        category_to: `${prefixTo}&beauty=1`,
        num: beautiful,
        ratio: this.parseToRatioStr(beautiful, tickTotal),
        q_1_reason: '',
        q_1_to: ``,
        q_2_reason: '',
        q_2_to: ``,
        q_2_num: '',
        q_2_ratio: ''
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: ugly,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyRoadIssueAll}`,
        q_2_reason: '比例失调',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=1`,
        q_2_num: beauty_scale,
        q_2_ratio: this.parseToRatioStr(beauty_scale, beautyRoadIssueTotal),
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: 0,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyRoadIssueAll}`,
        q_2_reason: '冗余',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=2`,
        q_2_num: beauty_redundancy,
        q_2_ratio: this.parseToRatioStr(beauty_redundancy, beautyRoadIssueTotal)
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: ugly,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyRoadIssueAll}`,
        q_2_reason: '标识异常',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=4`,
        q_2_num: beauty_sign_err,
        q_2_ratio: this.parseToRatioStr(beauty_sign_err, beautyRoadIssueTotal)
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: ugly,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '道路问题',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyRoadIssueAll}`,
        q_2_reason: '交叉点link异常',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=8`,
        q_2_num: beauty_cross_link_err,
        q_2_ratio: this.parseToRatioStr(beauty_cross_link_err, beautyRoadIssueTotal)
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: ugly,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyArrowIssueAll}`,
        q_2_reason: '箭头过短',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=1`,
        q_2_num: beauty_arrow_short,
        q_2_ratio: this.parseToRatioStr(beauty_arrow_short, beautyArrowIssueTotal)
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: ugly,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyArrowIssueAll}`,
        q_2_reason: '箭头不平滑',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=2`,
        q_2_num: beauty_arrow_rough,
        q_2_ratio: this.parseToRatioStr(beauty_arrow_rough, beautyArrowIssueTotal)
      },
      {
        category: 'B',
        category_to: `${prefixTo}&beauty=2`,
        num: ugly,
        ratio: this.parseToRatioStr(ugly, tickTotal),
        q_1_reason: '诱导箭头',
        q_1_to: `${prefixTo}&beauty=2&beauty_road_issue=${beautyArrowIssueAll}`,
        q_2_reason: '交叉',
        q_2_to: `${prefixTo}&beauty=2&beauty_road_issue=4`,
        q_2_num: beauty_arrow_crossing,
        q_2_ratio: this.parseToRatioStr(beauty_arrow_crossing, beautyArrowIssueTotal)
      },
      {
        category: '总计',
        category_to: ``,
        num: tickTotal,
        ratio: this.parseToRatioStr(tickTotal, tickTotal),
        q_1_reason: '',
        q_1_to: ``,
        q_2_reason: '',
        q_2_to: ``,
        q_2_num: '',
        q_2_ratio: ''
      }
    ]
  }
  handleSpan1(params: { row: any, column: any, rowIndex: number, columnIndex: number }) {
    // row: 当前行
    // column: 当前列
    // rowIndex: 当前行索引
    // columnIndex: 当前列索引
    const { columnIndex, rowIndex } = params
    const getNindexArray = (n: number, idx: number) => Array(n).fill('').map((it, index) => index + idx)
    // 以下两个if判断用来确定【第2行，第1、2、3列】占17行；【第2-20行，第1，2，3列】占0行
    if (rowIndex === 1 && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 17, // 占x行数
        colspan: 1  // 占x列数
      }
    }
    if (getNindexArray(17, 1).includes(rowIndex) && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
    // 锁定第三列
    if (columnIndex === 3) {
      // 第1，16行，占2行
      if ([1, 16].includes(rowIndex)) {
        return {
          rowspan: 2,
          colspan: 1
        }
      }
      // 第3行，占7行
      if (rowIndex === 3) {
        return {
          rowspan: 7,
          colspan: 1
        }
      }
      // 第10行，占6行
      if (rowIndex === 10) {
        return {
          rowspan: 6,
          colspan: 1
        }
      }
      // 剩余未占行的，占0行，基本是上面的else部分
      if ([2, ...getNindexArray(6, 4), ...getNindexArray(5, 11), 17].includes(rowIndex)) {
        return {
          rowspan: 0,
          colspan: 0
        }
      }
    }
  }
  handleSpan2(params: { row: any, column: any, rowIndex: number, columnIndex: number }) {
    // row: 当前行
    // column: 当前列
    // rowIndex: 当前行索引
    // columnIndex: 当前列索引
    const { columnIndex, rowIndex } = params
    const getNindexArray = (n: number, idx: number) => Array(n).fill('').map((it, index) => index + idx)
    // 以下两个if判断用来确定【第2行，第1、2、3列】占6行；【第1-6行，第1，2，3列】占0行
    if (rowIndex === 1 && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 7, // 占x行数
        colspan: 1  // 占x列数
      }
    }
    if (getNindexArray(7, 1).includes(rowIndex) && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
    // 锁定第三列
    if (columnIndex === 3) {
      // 第5行，占3行
      if ([5].includes(rowIndex)) {
        return {
          rowspan: 3,
          colspan: 1
        }
      }
      // 第2行，占4行
      if (rowIndex === 1) {
        return {
          rowspan: 4,
          colspan: 1
        }
      }
      // 剩余未占行的，占0行，基本是上面的else部分
      if ([2, 3, 4, 6, 7].includes(rowIndex)) {
        return {
          rowspan: 0,
          colspan: 0
        }
      }
    }
  }

  parseToRatioStr(num: number, total: number) {
    return total ? `${((num / total) * 100).toFixed(2)}%` : '0%'
  }
  handleOnExportData(ref: string) {
    const table: any = this.$refs[ref]
    const isContent = ref === 'content'
    const columns = isContent ? this.contentColumns : this.tickColumns
    this[isContent ? 'exportContentLoading' : 'exportTickLoading'] = true
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: isContent ? this.contentDataSource : this.tickDataSource
    })
    this[isContent ? 'exportContentLoading' : 'exportTickLoading'] = true
  }

  jumpTo(path: string) {
    this.$router.push(path);
  }

  mounted() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.task-statistics {
  a {
    text-decoration: underline;
    color: #f60;
  }
  .task-name {
    border-left: 4px solid #f60;
    padding-left: 10px;
  }
  .pie-container {
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    .pie {
      width: 50%;
      text-align: center;
      .title {
        color: #f60;
        padding: 10px 0;
        display: inline-block;
      }
    }
  }
  .statistics {
    padding: 10px 0;
  }
}
</style>

