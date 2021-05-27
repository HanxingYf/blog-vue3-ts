<template>
  <div class="job-statistics-task">
    任务名称: {{ job_name }}
    <Row class="top-margin">
      <Col span="12">
        <div id='taskPie' ref='task-pie'></div>
      </Col>
      <Col span="12">
        <div id='badTaskPie' ref='bad-task-pie'></div>
      </Col>
    </Row>
    <div class="top-margin">
      总数量: {{ case_count }}条  分发数量: {{ dispatch_count }} 已标注数量: {{markedNum}} 有效数量: {{validNum}}
    </div>
    <div class="top-margin">
      <Table :loading="table_loading" :columns="columns" ref="table" :data="list" :span-method="handleSpan" border size="small">
        <template slot-scope="{ row, index }" slot="contrast">
          <div :class="{'task-jump':row.contrast !== '总计'}" @click="jumpTo(`/voice-broadcast/task-manager/content-task-detail?job_id=${job_id}&job_name=${job_name}&tag=${row.type}`)">{{row.contrast}}</div>
        </template>
        <template slot-scope="{ row, index }" slot="questionType">
          <div class='task-jump' @click="jumpTo(`/voice-broadcast/task-manager/content-task-detail?job_id=${job_id}&job_name=${job_name}&tag=${row.sType || row.type}&issue_type=${row.questionType || ''}`)">{{row.questionTypeName}}</div>
        </template>
      </Table>
      <Button class="task-button" type="primary" :disabled="!list.length" :loading="exportLoading" @click="handleOnExportData">导出CSV</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import echarts from 'echarts';
import { SelectItem, Columns, DistributorI } from '@/types'
import { taskStatisticsColunms } from './columns'
import { getContentTaskStatistics } from '@/presenter/manager.pre'
import { getUsersByRole } from '@/presenter/common.pre'

@Component({
  components: {  }
})
export default class BasemapStatistics extends Vue {
  list: any[] = []
  table_loading: boolean = false
  exportLoading: boolean = false
  columns: Columns[] = taskStatisticsColunms
  taskPie: any = null
  badTaskPie: any = null
  markedNum: number = 0
  validNum: number = 0
  hiddenUnknow: boolean = false

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
    const rowList = [4]
    let rowTotal = 2
    const GSBlist = [0, 1, 2]
    if (!this.hiddenUnknow) {
      rowList.push(5)
      rowTotal = 3
    }
    if (option.rowIndex === 1  && GSBlist.includes(option.columnIndex)) {
        return {
            rowspan: 2,
            colspan: 1
        };
    } else if (option.rowIndex === 2 && GSBlist.includes(option.columnIndex)) {
      return {
          rowspan: 0,
          colspan: 0
      };
    }
    if (option.rowIndex === 3  && GSBlist.includes(option.columnIndex)) {
        return {
            rowspan: rowTotal,
            colspan: 1
        };
    } else if (rowList.includes(option.rowIndex) && GSBlist.includes(option.columnIndex)) {
      return {
          rowspan: 0,
          colspan: 0
      };
    }
  }

  async init() {
    const data = await getContentTaskStatistics(+this.job_id )
    if (!data) {
      return
    }
    this.hiddenUnknow = data.bad_unknown === 0
    this.markedNum = data.marked
    this.validNum = data.valid
    const total = data.good + data.same + data.bad
    const sameTotal = data.same_good + data.same_bad
    const badTotal = data.bad_road_net + data.bad_strategy + data.bad_unknown
    this.list = [
      {
        contrast: 'G',
        type: '3',
        num: data.good,
        ratio: total === 0 ? '0%' : `${((data.good / total) * 100).toFixed(1)}%`
      },
      {
        contrast: 'S',
        type: '1,4',
        sType: 1,
        num: data.same,
        ratio: total === 0 ? '0%' : `${((data.same / total) * 100).toFixed(1)}%`,
        questionTypeName: '两方都好',
        questionNum: data.same_good,
        questionRatio: badTotal === 0 ? '0%' : `${((data.same_good / sameTotal) * 100).toFixed(1)}%`,
      },
      {
        contrast: 'S',
        type: '1,4',
        sType: 4,
        num: data.same,
        ratio: total === 0 ? '0%' : `${((data.same / total) * 100).toFixed(1)}%`,
        questionTypeName: '两方都不好',
        questionNum: data.same_bad,
        questionRatio: badTotal === 0 ? '0%' : `${((data.same_bad / sameTotal) * 100).toFixed(1)}%`,
      },
      {
        contrast: 'B',
        type: '2,6,7,8',
        num: data.bad,
        ratio: total === 0 ? '0%' : `${((data.bad / total) * 100).toFixed(1)}%`,
        questionType: 1,
        questionTypeName: '路网问题',
        questionNum: data.bad_road_net,
        questionRatio: badTotal === 0 ? '0%' : `${((data.bad_road_net / badTotal) * 100).toFixed(1)}%`,
      },
      {
        contrast: 'B',
        type: '2,6,7,8',
        num: data.bad,
        ratio: total === 0 ? '0%' : `${((data.bad / total) * 100).toFixed(1)}%`,
        questionType: 2,
        questionTypeName: '策略问题',
        questionNum: data.bad_strategy,
        questionRatio: badTotal === 0 ? '0%' : `${((data.bad_strategy / badTotal) * 100).toFixed(1)}%`,
      }
    ]
    if (this.hiddenUnknow) {
      this.list.push({
        contrast: '总计',
        num: total,
        ratio: '100%',
      })
    } else {
      this.list.push({
        contrast: 'B',
        type: '10',
        num: data.bad,
        ratio: total === 0 ? '0%' : `${((data.bad / total) * 100).toFixed(1)}%`,
        questionType: -1,
        questionTypeName: '未知',
        questionNum: data.bad_unknown,
        questionRatio: badTotal === 0 ? '0%' : `${((data.bad_unknown / badTotal) * 100).toFixed(1)}%`,
      },
      {
        contrast: '总计',
        num: total,
        ratio: '100%',
      })
    }
    // 加载饼图
    if (!this.taskPie) {
      this.taskPie = echarts.init(this.$refs['task-pie']);
      const taskOptions = this.initOption(
        '播报内容GSB占比图',
        [
          {value: data.good, name: 'G' },
          {value: data.same, name: 'S' },
          {value: data.bad, name: 'B' },
        ],
        ['G', 'S', 'B']
        )
      this.taskPie.setOption(taskOptions, true);
    }
    if (!this.badTaskPie) {
      this.badTaskPie = echarts.init(this.$refs['bad-task-pie']);
      const valueList = [
        {value: data.bad_road_net, name: '路网' },
        {value: data.bad_strategy, name: '策略' }
      ]
      const nameList = ['路网', '策略']
      if (!this.hiddenUnknow) {
        valueList.push({value: data.bad_unknown, name: '无' })
        nameList.push('无')
      }
      const badTaskOptions = this.initOption(
        'BAD体验问题占比图', valueList, nameList)
      this.badTaskPie.setOption(badTaskOptions, true);
    }
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

  handleOnExportData() {
    const table: any = this.$refs.table
    const columns = taskStatisticsColunms
    this.exportLoading = true
    table.exportCsv({
      filename: `${this.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: this.list
    })
    this.exportLoading = false
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
.top-margin {
  margin-top: 20px;
}
.task-button {
  margin-top: 10px;
}
.task-jump {
  font-size: 12px;
  color: rgb(0, 0, 204);
  cursor: pointer;
}
#taskPie,
#badTaskPie {
  width: 100%;
  min-height: 300px;
  height: auto;
}
</style>

