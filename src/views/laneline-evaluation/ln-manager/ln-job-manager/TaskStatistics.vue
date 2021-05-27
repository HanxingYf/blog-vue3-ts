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
      <Table :columns="contentColumns" :span-method="handleSpan" ref="content" :data="contentDataSource" border size="small">
        <template slot-scope="{ row, index }" slot="jumpto">
          <template v-if="row.category_to ">
            <router-link :to="row.category_to">{{ row.category }}</router-link>
          </template>
          <template v-else>{{ row.category }}</template>
        </template>
        <template slot-scope="{ row, index }" slot="q_jumpto">
          <template v-if="row.q_to">
            <router-link :to="row.q_to">{{ row.q_reason }}</router-link>
          </template>
          <template v-else>
            {{ row.q_reason }}
          </template>
        </template>
      </Table>
      <Button style="margin: 10px 0" type="primary" @click="handleOnExportData('content')">导出CSV</Button>
      <Table style="margin-top: 10px" :columns="tickColumns" ref="tick" :data="tickDataSource" border size="small">
        <template slot-scope="{ row, index }" slot="jumpto">
          <template v-if="row.category_to">
            <router-link :to="row.category_to">{{ row.category }}</router-link>
          </template>
          <template v-else>{{ row.category }}</template>
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
import * as lanelineManager from '@/models/manager/laneline'
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
    const data = await lanelineManager.getStatistic(this.query.job_id )
    if (!data) {
      return
    }
    const {
      bad, // 竞品好
      dis_unknow, // 显示无法确定
      end_early, // 结束过早
      end_late, // 结束过晚
      start_early, // 开始过早
      start_late, // 开始过晚
      good, // 滴滴好
      issue_arrow_num, // 车道线诱导信息有误(箭头)
      issue_back_num, // 车道线数量有误
      issue_front_num, // 车道线诱导高亮显示有误
      issue_other_num, // 其他问题
      marked, // 标注数量
      no_didi_record, // 滴滴无
      dis_no_didi_record, // 显示滴滴无
      same_bad, // 两方都不好
      same_good, // 两方都好
      suitable, // 合适
      unknown, // 无法确定
      valid // 有效数
    } = data
    const tagTotal = good + bad + same_good + same_bad + unknown
    this.pieDatas = [
      {
        title: '车道线显示内容评价结论占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '滴滴好', '数量': good },
            { '类别': '竞品好', '数量': bad },
            { '类别': '两方都好', '数量': same_good },
            { '类别': '两方都不好', '数量': same_bad },
            { '类别': '无法确定', '数量': unknown }
          ]
        }
      },
      {
        title: '显示内容BAD占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '车道线数量有误', '数量': issue_back_num },
            { '类别': '车道线诱导信息有误(箭头)', '数量': issue_arrow_num },
            { '类别': '车道线诱导高亮显示有误', '数量': issue_front_num },
            { '类别': '其他问题', '数量': issue_other_num },
            { '类别': '滴滴无', '数量': no_didi_record },
          ]
        }
      },
      {
        title: '车道线显示时机占比图',
        chartData: {
          columns: ['类别', '数量'],
          rows: [
            { '类别': '开始过早', '数量': start_early },
            { '类别': '开始过晚', '数量': start_late },
            { '类别': '结束过早', '数量': end_early },
            { '类别': '结束过晚', '数量': end_late },
            { '类别': '合适', '数量': suitable },
            { '类别': '滴滴无', '数量': dis_no_didi_record },
            { '类别': '无法确定', '数量': dis_unknow }
          ]
        }
      }
    ]
    const { case_count, dispatch_count } = this.query
    this.statistics = `总数量: ${case_count}; 分发数量: ${dispatch_count}; 已标注数量: ${marked}; 有效数量: ${valid}`
    const contentTotal = good + bad + same_good + same_bad + unknown
    const { job_id, job_name } = this.query
    const prefixTo = `/laneline-evaluation/task-manager/task-detail?job_id=${job_id}&job_name=${job_name}`
    this.contentDataSource = [
      {
        category: '滴滴好',
        category_to: `${prefixTo}&tag=1`,
        num: good,
        ratio: this.parseToRatioStr(good, contentTotal),
        q_reason: '',
        q_num: '',
        q_ratio: ''
      },
      {
        category: '两方都好',
        category_to: `${prefixTo}&tag=3`,
        num: same_good,
        ratio: this.parseToRatioStr(same_good, contentTotal),
        q_reason: '',
        q_num: '',
        q_ratio: ''
      },
      {
        category: '两方都不好、竞品好',
        category_to: `${prefixTo}&tag=2,4`,
        num: same_bad + bad,
        ratio: this.parseToRatioStr(same_bad + bad, contentTotal),
        q_reason: '车道线数量有误',
        q_to: `${prefixTo}&tag=2,4&lane_issue_type=1`,
        q_num: issue_back_num,
        q_ratio: this.parseToRatioStr(issue_back_num, same_bad + bad + no_didi_record)
      },
      {
        category: '两方都不好、竞品好',
        num: '',
        ratio: '',
        q_reason: '车道线诱导信息有误(箭头)',
        q_to: `${prefixTo}&tag=2,4&lane_issue_type=2`,
        q_num: issue_arrow_num,
        q_ratio: this.parseToRatioStr(issue_arrow_num, same_bad + bad + no_didi_record)
      },
      {
        category: '两方都不好、竞品好',
        num: '',
        ratio: '',
        q_reason: '车道线诱导高亮显示有误',
        q_to: `${prefixTo}&tag=2,4&lane_issue_type=3`,
        q_num: issue_front_num,
        q_ratio: this.parseToRatioStr(issue_front_num, same_bad + bad + no_didi_record)
      },
      {
        category: '两方都不好、竞品好',
        num: '',
        ratio: '',
        q_reason: '滴滴无',
        q_to: `${prefixTo}&tag=2,4&lane_issue_type=4`,
        q_num: no_didi_record,
        q_ratio: this.parseToRatioStr(no_didi_record, same_bad + bad)
      },
      {
        category: '两方都不好、竞品好',
        num: '',
        ratio: '',
        q_reason: '其他问题',
        q_to: `${prefixTo}&tag=2,4&lane_issue_type=5`,
        q_num: issue_other_num,
        q_ratio: this.parseToRatioStr(issue_other_num, same_bad + bad)
      },
      {
        category: '无法确定',
        category_to: `${prefixTo}&tag=5`,
        num: unknown,
        ratio: this.parseToRatioStr(unknown, contentTotal),
        q_reason: '',
        q_num: '',
        q_ratio: ''
      },
      {
        category: '总计',
        num: contentTotal,
        ratio: this.parseToRatioStr(contentTotal, contentTotal),
        q_reason: '',
        q_num: '',
        q_ratio: ''
      }
    ]
    const tickTotal = start_early + start_late + end_early + end_late + suitable + dis_unknow + dis_no_didi_record
    this.tickDataSource = [
      {
        category: '合适',
        category_to: `${prefixTo}&display_tag=1`,
        num: suitable,
        ratio: this.parseToRatioStr(suitable, tickTotal)
      },
      {
        category: '开始过早',
        category_to: `${prefixTo}&display_tag=2`,
        num: start_early,
        ratio: this.parseToRatioStr(start_early, tickTotal)
      },
      {
        category: '开始过晚',
        category_to: `${prefixTo}&display_tag=3`,
        num: start_late,
        ratio: this.parseToRatioStr(start_late, tickTotal)
      },
      {
        category: '结束过早',
        category_to: `${prefixTo}&display_tag=4`,
        num: end_early,
        ratio: this.parseToRatioStr(end_early, tickTotal)
      },
      {
        category: '结束过晚',
        category_to: `${prefixTo}&display_tag=5`,
        num: end_late,
        ratio: this.parseToRatioStr(end_late, tickTotal)
      },
      {
        category: '滴滴无',
        category_to: `${prefixTo}&display_tag=6`,
        num: dis_no_didi_record,
        ratio: this.parseToRatioStr(dis_no_didi_record, tickTotal)
      },
      {
        category: '无法确定',
        category_to: `${prefixTo}&display_tag=7`,
        num: dis_unknow,
        ratio: this.parseToRatioStr(dis_unknow, tickTotal)
      },
      {
        category: '总计',
        num: tickTotal,
        ratio: this.parseToRatioStr(tickTotal, tickTotal)
      }
    ]
  }
  handleSpan(params: { row: any, column: any, rowIndex: number, columnIndex: number }) {
    // row: 当前行
    // column: 当前列
    // rowIndex: 当前行索引
    // columnIndex: 当前列索引
    const { columnIndex, rowIndex } = params
    // 第3行的 第1，2，3列 占5行1列
    if (rowIndex === 2 && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 5, // 占x行数
        colspan: 1  // 占x列数
      }
      // 第3，4，5，6行的第1，2，3列均占0行0列
    } else if ([3, 4, 5, 6].includes(rowIndex) && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 0, // 占x行数
        colspan: 0  // 占x列数
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

