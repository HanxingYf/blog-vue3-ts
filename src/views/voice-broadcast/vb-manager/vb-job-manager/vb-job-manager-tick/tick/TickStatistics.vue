<template>
  <div class="job-statistics-tick">
    任务名称: {{ job_name }}
    <Row class="top-margin">
      <Col span="12">
        <div id="tickPie" ref="tick-pie"></div>
      </Col>
      <Col span="12">
        <div id="lateTickPie" ref="late-tick-pie"></div>
      </Col>
    </Row>
    <div class="top-margin">
      总数量: {{ case_count }}条 分发数量: {{ dispatch_count }} 已标注数量:
      {{ markedNum }} 有效数量: {{ validNum }}
      <Table
        :loading="table_loading"
        :columns="columns"
        ref="table"
        :data="list"
        :span-method="handleSpan"
        border
        size="small"
      >
        <template slot-scope="{ row, index }" slot="contrast">
          <div
            :class="{ 'tick-jump': row.contrast !== '总计' }"
            @click="
              jumpTo(
                `/voice-broadcast/task-manager/tick-task-detail?job_id=${job_id}&job_name=${job_name}&voice_tag=${row.contrastName}`,
                row.contrast
              )
            "
          >
            {{ row.contrast }}
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="type">
          <div
            class="tick-jump"
            @click="
              jumpTo(
                `/voice-broadcast/task-manager/tick-task-detail?job_id=${job_id}&job_name=${job_name}&voice_tag=${row.typeName}`
              )
            "
          >
            {{ row.type }}
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="question">
          <div
            class="tick-jump"
            @click="
              jumpTo(
                `/voice-broadcast/task-manager/tick-task-detail?job_id=${job_id}&job_name=${job_name}&voice_tag=${row.typeName}&issue_type=${row.questionName}`
              )
            "
          >
            {{ row.question }}
          </div>
        </template>
      </Table>
      <Button
        class="tick-button"
        type="primary"
        :disabled="!list.length"
        :loading="exportLoading"
        @click="handleOnExportData"
        >导出CSV</Button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import echarts from 'echarts';
import { SelectItem, Columns, DistributorI } from '@/types'
import { tickStatisticsColunms } from './columns'
import { getTickTaskStatistics } from '@/presenter/manager.pre'
import { getUsersByRole } from '@/presenter/common.pre'

@Component({
  components: {}
})
export default class TickStatistics extends Vue {
  list: any[] = []
  table_loading: boolean = false
  exportLoading: boolean = false
  columns: Columns[] = tickStatisticsColunms
  tickPie: any = null
  lateTickPie: any = null
  markedNum: number = 0
  validNum: number = 0
  hiddenEarlyUnknow: boolean = false // 隐藏类型无为0时 隐藏
  hiddenLateUnknow: boolean = false

  get flags() {
    return this.$store.state.userInfo.flags
  }

  get job_id() {
    const route = this.$route
    const { job_id } = route.query
    return job_id.toString()
  }

  get job_name() {
    const route = this.$route
    const { job_name } = route.query
    return job_name.toString()
  }

  get dispatch_count() {
    const route = this.$route
    const { dispatch_count } = route.query
    return dispatch_count.toString()
  }

  get case_count() {
    const route = this.$route
    const { case_count } = route.query
    return case_count.toString()
  }

  handleSpan(option: any) {
    let unsuitableGroup = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    let questionGroup = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12]
    let rowTotal = 12
    let earlyTotal = 6
    let lateTotal = 6
    // 根据隐藏unknown数据改变合并表格样式
    if (this.hiddenEarlyUnknow && !this.hiddenLateUnknow) {
      unsuitableGroup = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      questionGroup = [2, 3, 4, 5, 7, 8, 9, 10, 11]
      rowTotal = 11
      earlyTotal = 5
    }
    if (!this.hiddenEarlyUnknow && this.hiddenLateUnknow) {
      unsuitableGroup = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      questionGroup = [2, 3, 4, 5, 6, 8, 9, 10, 11]
      rowTotal = 11
      lateTotal = 5
    }
    if (this.hiddenEarlyUnknow && this.hiddenLateUnknow) {
      unsuitableGroup = [2, 3, 4, 5, 6, 7, 8, 9, 10]
      questionGroup = [2, 3, 4, 5, 7, 8, 9, 10]
      rowTotal = 10
      earlyTotal = 5
      lateTotal = 5
    }
    if (option.rowIndex === 1 && (option.columnIndex === 0 || option.columnIndex === 1 || option.columnIndex === 2)) {
      return {
        rowspan: rowTotal,
        colspan: 1
      };
    } else if (unsuitableGroup.includes(option.rowIndex) && (option.columnIndex === 0 || option.columnIndex === 1 || option.columnIndex === 2)) {
      return {
        rowspan: 0,
        colspan: 0
      };
    }
    if ((option.rowIndex === 1 || option.rowIndex === (earlyTotal + 1)) && (option.columnIndex === 3 || option.columnIndex === 4 || option.columnIndex === 5)) {
      if (option.rowIndex === 1) {
        return {
          rowspan: earlyTotal,
          colspan: 1
        };
      }
      if (option.rowIndex === (earlyTotal + 1)) {
        return {
          rowspan: lateTotal,
          colspan: 1
        };
      }
    } else if (questionGroup.includes(option.rowIndex) && (option.columnIndex === 3 || option.columnIndex === 4 || option.columnIndex === 5)) {
      return {
        rowspan: 0,
        colspan: 0
      };
    }
  }

  async init() {
    const data = await getTickTaskStatistics(+ this.job_id)
    if (!data) {
      return
    }
    const mapIssueType: { [propName: string]: number } = {
      'issue_road_net': 1,
      'issue_strategy': 2,
      'issue_tool': 3,
      'issue_gps': 4,
      'issue_crossing': 5,
      'issuse_unknown': -1
    }
    this.hiddenEarlyUnknow = data.early_issue.issuse_unknown === 0
    this.hiddenLateUnknow = data.late_issue.issuse_unknown === 0
    this.markedNum = data.marked
    this.validNum = data.valid
    const total = data.suitable + data.unsuitable
    let earlyTotal = 0
    const earlyObject = []
    // 计算总量
    for (const i of Object.keys(data.early_issue)) {
      earlyTotal += data.early_issue[i]
    }
    for (const i of Object.keys(data.early_issue)) {
      let name = ''
      switch (i) {
        case 'issue_road_net': name = '路网'; break;
        case 'issue_strategy': name = '策略'; break;
        case 'issue_tool': name = '工具'; break;
        case 'issue_gps': name = 'GPS'; break;
        case 'issue_crossing': name = '路口模型'; break;
        case 'issuse_unknown': name = '无'; break;
        default: break;
      }
      if (i === 'issuse_unknown' && this.hiddenEarlyUnknow) {
        continue;
      }
      earlyObject.push({
        contrast: '不合适',
        contrastName: '2,3',
        num: data.unsuitable,
        ratio: total === 0 ? '0%' : `${((data.unsuitable / total) * 100).toFixed(1)}%`,
        type: '过早',
        typeName: '2',
        typeNum: earlyTotal,
        typeRatio: data.unsuitable === 0 ? '0%' : `${((earlyTotal / data.unsuitable) * 100).toFixed(1)}%`,
        question: name,
        questionName: mapIssueType[i],
        questionNum: data.early_issue[i],
        questionRatio: earlyTotal === 0 ? '0%' : `${((data.early_issue[i] / earlyTotal) * 100).toFixed(1)}%`,
      })
    }
    let lateTotal = 0
    const lateObject = []
    for (const i of Object.keys(data.late_issue)) {
      lateTotal += data.late_issue[i]
    }
    for (const i of Object.keys(data.late_issue)) {
      let name = ''
      switch (i) {
        case 'issue_road_net': name = '路网'; break;
        case 'issue_strategy': name = '策略'; break;
        case 'issue_tool': name = '工具'; break;
        case 'issue_gps': name = 'GPS'; break;
        case 'issue_crossing': name = '路口模型'; break;
        case 'issuse_unknown': name = '无'; break;
        default: break;
      }
      if (i === 'issuse_unknown' && this.hiddenLateUnknow) {
        continue;
      }
      lateObject.push({
        contrast: '不合适',
        contrastName: '2,3',
        num: data.unsuitable,
        ratio: total === 0 ? '0%' : `${((data.unsuitable / total) * 100).toFixed(1)}%`,
        type: '过晚',
        typeName: '3',
        typeNum: lateTotal,
        typeRatio: data.unsuitable === 0 ? '0%' : `${((lateTotal / data.unsuitable) * 100).toFixed(1)}%`,
        question: name,
        questionName: mapIssueType[i],
        questionNum: data.late_issue[i],
        questionRatio: lateTotal === 0 ? '0%' : `${((data.late_issue[i] / lateTotal) * 100).toFixed(1)}%`,
      })
    }
    this.list = [
      {
        contrast: '合适',
        contrastName: '1',
        num: data.suitable,
        ratio: total === 0 ? '0%' : `${((data.suitable / total) * 100).toFixed(1)}%`
      },
      ...earlyObject,
      ...lateObject,
      {
        contrast: '总计',
        num: total,
        ratio: '100%'
      },
    ]
    // 加载饼图
    if (!this.tickPie) {
      this.tickPie = echarts.init(this.$refs['tick-pie']);
      const tickOptions = this.initOption(
        '播报时机占比图',
        [
          { value: data.suitable, name: '合适' },
          { value: earlyTotal, name: '早' },
          { value: lateTotal, name: '晚' },
        ],
        ['合适', '早', '晚']
      )
      this.tickPie.setOption(tickOptions, true);
    }
    if (!this.lateTickPie) {
      this.lateTickPie = echarts.init(this.$refs['late-tick-pie']);
      const valueList = [
        { value: data.late_issue.issue_road_net, name: '路网' },
        { value: data.late_issue.issue_strategy, name: '策略' },
        { value: data.late_issue.issue_tool, name: '工具' },
        { value: data.late_issue.issue_gps, name: 'GPS' },
        { value: data.late_issue.issue_crossing, name: '路口模型' }
      ]
      const nameList = ['路网', '策略', '工具', 'GPS', '路口模型']
      if (!this.hiddenLateUnknow) {
        valueList.push({ value: data.late_issue.issuse_unknown, name: '无' })
        nameList.push('无')
      }
      const lateTickOptions = this.initOption('播报晚问题占比图', valueList, nameList)
      this.lateTickPie.setOption(lateTickOptions, true);
    }
  }

  handleOnExportData() {
    const table: any = this.$refs.table
    const columns = tickStatisticsColunms
    this.exportLoading = true
    table.exportCsv({
      filename: `${this.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: this.list
    })
    this.exportLoading = false
  }

  initOption(name: string, seriesData: any, legendData: any) {
    const option = {
      title: {
        text: name,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: legendData
      },
      series: [
        {
          name: '占比',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: seriesData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
            // formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
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
                fontSize: 16,
                lineHeight: 33
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
      ]
    };
    return option
  }

  jumpTo(path: string, tag: string) {
    if (tag === '总计') {
      return;
    }
    this.$router.push(path);
  }

  mounted() {
    this.init()
  }
}
</script>

<style lang="less" scoped>
.top-margin {
  margin-top: 20px;
}
.tick-button {
  margin-top: 10px;
}
.tick-jump {
  font-size: 12px;
  color: rgb(0, 0, 204);
  cursor: pointer;
}
#tickPie,
#lateTickPie {
  width: 100%;
  min-height: 300px;
  height: auto;
}
</style>

