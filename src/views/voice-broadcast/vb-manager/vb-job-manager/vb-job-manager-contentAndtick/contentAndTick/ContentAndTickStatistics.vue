<template>
  <div class="job-statistics-task">
    任务名称: {{ job_name }}
    <Row class="top-margin">
      <Col span="12">
        <div id="contentPie" ref="content-pie"></div>
      </Col>
      <Col span="12">
        <div id="tickPie" ref="tick-pie"></div>
      </Col>
    </Row>
    <div class="top-margin">标注总数: {{ marked }} 验证总数:{{ valid }}</div>
    <div class="content">
      <div class="content-left">
        <Table
          :loading="table_loading"
          :columns="contentColumns"
          ref="contentTable"
          :data="contentList"
          border
          size="small"
        >
          <template slot-scope="{ row, index }" slot="version">
            <div
              :class="{ 'task-jump': row.version !== '总计' }"
              @click="
                jumpTo(
                  `/voice-broadcast/task-manager/content-and-task-detail?job_id=${job_id}&job_name=${job_name}&content_tag=${row.type }`,
                  row.version
                )
              "
            >
              {{ row.version }}
            </div>
          </template>
        </Table>
        <Button
          class="task-button"
          type="primary"
          :loading="exportLoading"
          @click="handleOnContentExportData"
          >导出CSV</Button
        >
      </div>
      <div class="content-right">
        <Table
          :loading="table_loading"
          :columns="tickColumns"
          ref="tickTable"
          :data="tickList"
          border
          size="small"
        >
          <template slot-scope="{ row, index }" slot="version">
            <div
              :class="{ 'task-jump': row.pos !== '总计' }"
              @click="
                jumpTo(
                  `/voice-broadcast/task-manager/content-and-task-detail?job_id=${job_id}&job_name=${job_name}&pos_tag=${row.type}`,
                  row.pos
                )
              "
            >
              {{ row.pos }}
            </div>
          </template>
        </Table>
        <Button
          class="task-button"
          type="primary"
          :loading="exportLoading"
          @click="handleOnTickExportData"
          >导出CSV</Button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import echarts from 'echarts';
import { SelectItem, Columns, DistributorI } from '@/types'
import { contentStatisticsColunms, tickStatisticsColunms } from './columns'
import { getContentAndTickTaskStatistics } from '@/presenter/manager.pre'
import { getUsersByRole } from '@/presenter/common.pre'
import { ContentStatisticsRowI, TickStatisticsRowI } from './type'

@Component
export default class ContentAndTickStatistics extends Vue {
  table_loading: boolean = false
  exportLoading: boolean = false
  contentColumns: Columns[] = contentStatisticsColunms
  tickColumns: Columns[] = tickStatisticsColunms
  hiddenUnknow: boolean = false
  contentDataSorce: ContentStatisticsRowI[] = []
  tickDataSorce: TickStatisticsRowI[] = []
  marked: number = 0
  valid: number = 0
  version_a: number = 0
  version_b: number = 0
  same_bad: number = 0
  same_good: number = 0
  version_tol: number = 0
  pos_early: number = 0
  pos_late: number = 0
  pos_tol: number = 0
  time_right: number = 0
  unknown: number = 0
  contentList: any[] = []
  tickList: any[] = []
  taskPie: any = null
  contentPie: any = null
  tickPie: any = null


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

  async init() {
    // console.log(this.job_id);=
    const data = await getContentAndTickTaskStatistics(+this.job_id)
    if (!data) {
      return
    }
    // console.log(data, '+++');
    this.marked = data.marked
    this.valid = data.valid
    this.version_a = data.version_a
    this.version_b = data.version_b
    this.same_good = data.same_good
    this.same_bad = data.SameBad
    this.pos_early = data.pos_early
    this.pos_late = data.pos_late
    this.time_right = data.pos_right
    this.unknown = data.unknown
    this.version_tol = data.marked
    this.pos_tol = this.pos_early + this.pos_late + this.time_right
    this.contentList = [
      {
        version: '新版本好',
        num: this.version_a,
        percent: this.version_a == 0 ? '0%' : ((this.version_a / this.version_tol) * 100).toFixed(1) + '%',
        type: '1'
      },
      {
        version: '旧版本好',
        num: this.version_b,
        percent: this.version_b == 0 ? '0%' : ((this.version_b / this.version_tol) * 100).toFixed(1) + '%',
        type: '2'
      },
      {
        version: '两方都好',
        num: this.same_good,
        percent: this.same_good == 0 ? '0%' : ((this.same_good / this.version_tol) * 100).toFixed(1) + '%',
        type: '3'
      },
      {
        version: '两方都不好',
        num: this.same_bad,
        percent: this.same_bad == 0 ? '0%' : ((this.same_bad / this.version_tol) * 100).toFixed(1) + '%',
        type: '4'
      },
      {
        version: '总计',
        num: this.version_tol,
        percent: '100%',
      }
    ]
    this.tickList = [
      {
        pos: '早',
        num: this.pos_early,
        percent: this.pos_early == 0 ? '0%' : ((this.pos_early / this.pos_tol) * 100).toFixed(1) + '%',
        type: '1'
      },
      {
        pos: '晚',
        num: this.pos_late,
        percent: this.pos_late == 0 ? '0%' : ((this.pos_late / this.pos_tol) * 100).toFixed(1) + '%',
        type: '2'
      },
      {
        pos: '合适',
        num: this.time_right,
        percent: this.time_right == 0 ? '0%' : ((this.time_right / this.pos_tol) * 100).toFixed(1) + '%',
        type: '3'
      },
      {
        pos: '总计',
        num: this.pos_tol,
        percent: '100%',
      }
    ]
    // 加载饼图
    if (!this.contentPie) {
      //   console.log('++++');
      this.taskPie = echarts.init(this.$refs['content-pie']);
      const taskOptions = this.initOption(
        '播报内容评价占比图',
        [
          { value: data.version_a, name: '新版本好' },
          { value: data.version_b, name: '旧版本好' },
          { value: data.same_good, name: '两方都好' },
          { value: data.SameBad, name: '两方都不好' },
        ],
        ['新版本好', '旧版本好', '两方都好', '两方都不好']
      )
      this.taskPie.setOption(taskOptions, true);
    }
    if (!this.tickPie) {
      //   console.log('++++');
      this.taskPie = echarts.init(this.$refs['tick-pie']);
      const taskOptions = this.initOption(
        '播报时机评价占比图',
        [
          { value: data.pos_early, name: '早' },
          { value: data.pos_late, name: '晚' },
          { value: data.pos_right, name: '合适' },
        ],
        ['早', '晚', '合适']
      )
      this.taskPie.setOption(taskOptions, true);
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


  parseContentRow(data: any): ContentStatisticsRowI {
    return data.map((item: any) => {
      return {
        version: item.version_a ? '新版本好' : '旧版本好',
        num: 0,
        percent: '0%'
      }
    })

  }

  handleOnContentExportData() {
    const table: any = this.$refs.contentTable
    const columns = contentStatisticsColunms
    this.exportLoading = true
    table.exportCsv({
      filename: `${this.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: this.contentList
    })
    this.exportLoading = false
  }

  handleOnTickExportData() {
    const table: any = this.$refs.tickTable
    const columns = tickStatisticsColunms
    this.exportLoading = true
    table.exportCsv({
      filename: `${this.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: this.tickList
    })
    this.exportLoading = false
  }

  handleOntickExportData() {
    const table: any = this.$refs.tickTable
    const columns = tickStatisticsColunms
    this.exportLoading = true
    table.exportCsv({
      filename: `${this.job_name}--${new Date().toLocaleString()}`,
      columns,
      quoted: true,
      data: this.tickList
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
#contentPie,
#tickPie,
#badTaskPie {
  width: 100%;
  min-height: 300px;
  height: auto;
}
.content {
  position: relative;
  display: flex;
  align-items: top;
  justify-content: space-between;
  .content-left {
    width: 50%;
    padding: 10px;
    // border-right: 1px solid #c5c8ce;
  }
  .content-right {
    width: 50%;
    padding: 10px;
    // background-color: aliceblue ;
    .content-right-title {
      text-align: center;
      margin-bottom: 10px;
      font-size: 16px;
    }
  }
}
</style>


