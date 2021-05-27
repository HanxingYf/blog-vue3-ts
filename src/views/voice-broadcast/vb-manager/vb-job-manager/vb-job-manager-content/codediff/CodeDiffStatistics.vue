<template>
  <div class="job-statistics-task">
    任务名称: {{ job_name }}
    <Row class="top-margin">
      <Col span="12">
        <div id="taskPie" ref="task-pie"></div>
      </Col>
      <Col span="12">
        <div id="badTaskPie" ref="bad-task-pie"></div>
      </Col>
    </Row>
    <div class="top-margin">
      总数量: {{ case_count }}条 分发数量: {{ dispatch_count }} 已标注数量:
      {{ markedNum }} 有效数量: {{ validNum }}
    </div>
    <div class="top-margin">
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
            :class="{ 'task-jump': row.contrast !== '总计' }"
            @click="
              jumpTo(
                `/voice-broadcast/task-manager/codediff-task-detail?job_id=${job_id}&job_name=${job_name}&tag=${row.type}`,
                row.contrast
              )
            "
          >
            {{ row.contrast }}
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="questionType">
          <div
            class="task-jump"
            @click="
              jumpTo(
                `/voice-broadcast/task-manager/codediff-task-detail?job_id=${job_id}&job_name=${job_name}&tag=${row.type}&err_level=${row.questionTypeName}`
              )
            "
          >
            {{ row.questionType }}
          </div>
        </template>
      </Table>
      <Button
        class="task-button"
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
import { taskStatisticsColunms } from './columns'
import { getCodeDiffTaskStatistics } from '@/presenter/manager.pre'
import { getUsersByRole } from '@/presenter/common.pre'

@Component
export default class CodeDiffStatistics extends Vue {
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

  handleSpan(option: { row: any, column: any, rowIndex: number, columnIndex: number }) {
    const { rowIndex, columnIndex } = option
    // 第3行第1，2，3列 占3行
    if (rowIndex === 2 && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 3,
        colspan: 1
      }
      // 第5行第1，2，3列 占0行
    } else if ([3, 4].includes(rowIndex) && [0, 1, 2].includes(columnIndex)) {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }

  async init() {
    const data = await getCodeDiffTaskStatistics(+this.job_id)
    if (!data) {
      return
    }
    this.hiddenUnknow = data.unknown === 0
    this.markedNum = data.marked
    this.validNum = data.valid
    const total = data.good_num + data.same_num + data.bad_num + data.unknown
    const badTotal = data.bad_num
    this.list = [
      {
        contrast: 'G',
        type: 1,
        num: data.good_num,
        ratio: total === 0 ? '0%' : `${((data.good_num / total) * 100).toFixed(1)}%`
      },
      {
        contrast: 'S',
        type: 2,
        num: data.same_num,
        ratio: total === 0 ? '0%' : `${((data.same_num / total) * 100).toFixed(1)}%`
      },
      {
        contrast: 'B',
        type: 3,
        num: data.bad_num,
        ratio: total === 0 ? '0%' : `${((data.bad_num / total) * 100).toFixed(1)}%`,
        questionType: 'P0',
        questionTypeName: '1',
        questionNum: data.p0_num,
        questionRatio: badTotal === 0 ? '0%' : `${((data.p0_num / badTotal) * 100).toFixed(1)}%`,
      },
      {
        contrast: 'B',
        type: 3,
        num: data.bad_num,
        ratio: total === 0 ? '0%' : `${((data.bad_num / total) * 100).toFixed(1)}%`,
        questionType: 'P1',
        questionTypeName: '2',
        questionNum: data.p1_num,
        questionRatio: badTotal === 0 ? '0%' : `${((data.p1_num / badTotal) * 100).toFixed(1)}%`,
      },
      {
        contrast: 'B',
        type: 3,
        num: data.bad_num,
        ratio: total === 0 ? '0%' : `${((data.bad_num / total) * 100).toFixed(1)}%`,
        questionType: 'P2',
        questionTypeName: '3',
        questionNum: data.p2_num,
        questionRatio: badTotal === 0 ? '0%' : `${((data.p2_num / badTotal) * 100).toFixed(1)}%`,
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
        contrast: '无法确认',
        type: 4,
        num: data.unknown,
        ratio: total === 0 ? '0%' : `${((data.unknown / total) * 100).toFixed(1)}%`
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
        'Code GSB占比图',
        [
          { value: data.good_num, name: 'G' },
          { value: data.same_num, name: 'S' },
          { value: data.bad_num, name: 'B' },
          { value: data.unknown, name: '无法确定' }
        ],
        ['G', 'S', 'B', '无法确定']
      )
      this.taskPie.setOption(taskOptions, true);
    }
    if (!this.badTaskPie) {
      this.badTaskPie = echarts.init(this.$refs['bad-task-pie']);
      const valueList = [
        { value: data.p0_num, name: 'P0' },
        { value: data.p1_num, name: 'P1' },
        { value: data.p2_num, name: 'P2' }
      ]
      const nameList = ['P0', 'P1', 'P2']
      // if (!this.hiddenUnknow) {
      //   valueList.push({value: data.unknown, name: '无法确定' })
      //   nameList.push('无法确定')
      // }
      const badTaskOptions = this.initOption(
        'BAD问题等级占比图', valueList, nameList)
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

