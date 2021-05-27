<template>
  <Layout class="task-detail">
    <template v-if="nc_task_load">
      <div class="task-name">任务名称：{{ query.task_name }}</div>
      <NFilter 
        :configs="filterOptions" 
        @on-submit="pullTaskList(1)" 
        :loading="loading" 
        @on-cancel="handleOnReset"
      />
      <!-- 高级筛选 -->
      <HighFilterRule @onSendCustomFilterVal="onSendCustomFilterVal" type="lane" />
      <div class="table-wrapper">
        <div class="table-search task-table-search">
          <div class="numbers">
            命中数量：{{ total }}； 总量：{{ query.task_num }}； 占比：{{ `${((total / query.task_num) * 100).toFixed(2)}%` }}
          </div>
        </div>
        <Table
          :loading="loading" 
          :columns="columns"
          :data="dataSource" 
          size="small"
          border>
          <template slot-scope="{ row, index }" slot="diff_type">
            {{ mapDiffType[row.diff_type] }}
          </template>
          <template slot-scope="{ row, index }" slot="action">
            <Button size="small" style="font-size: 12px;" type="info" :disabled="curIndex === index" @click="handleOnViewCase(row, index)">在地图中查看</Button>
          </template>
        </Table>
        <div class="table-page">
          <Page 
            :total="total" 
            @on-change="pullTaskList" 
            show-total
            :current.sync="cur_page_num"
            show-elevator/>
        </div>
      </div>
      <div class="action-btns">
        <ButtonGroup>
          <Button :loading="loading" type="primary" @click="onPrevOrNext(false)" :disabled="disabledPrev">
              <Icon type="ios-arrow-back" />
              上一个
          </Button>
          <Button type="primary">{{ dataSource && dataSource[curIndex] && dataSource[curIndex].id }}</Button>
          <Button :loading="loading" type="primary" @click="onPrevOrNext(true)" :disabled="disabledNext">
              下一个
              <Icon type="ios-arrow-forward" />
          </Button>
        </ButtonGroup>
      </div>
      <div class="map-wrapper">
        <PreviewWithMap :geojsons="geojsons" :extraPointForLane="curDataRow">
          <template slot="label-mark">
            <LanelineIndicator :curDataRow="curDataRow" />
          </template>
        </PreviewWithMap>
      </div>
    </template>
    <template v-else>
      <div class="no-permission">
        无此页面权限
      </div>
    </template>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { taskCaseListColumns } from './columns'
import PreviewWithMap from '@/components/smart/PreviewWithMap.vue'
import HighFilterRule from '@/components/smart/HighFilterRule.vue'
import LanelineIndicator from '@/components/smart/LanelineIndicator.vue'
import { getContentAndHotCodeTaskDetail } from '@/presenter/machine.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import * as lanelineMachine from '@/models/machine/laneline'
import { parseToMapObj } from '@/utils';

@Component({
  components: { NFilter, HighFilterRule, PreviewWithMap, LanelineIndicator }
})
export default class TaskDetail extends Vue {
  // 表格相关
  columns = taskCaseListColumns
  dataSource: lanelineMachine.TaskCaseListI[] = []
  cur_page_num: number = 1 // 当前页
  num_per_page: number = 10 // 每页数量
  total_pages: number = 0 // 总页数
  total: number = 0 // 筛选得到的总数量
  loading: boolean = false

  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    caseId: {
      type: 'input',
      label: 'CaseID精确匹配',
      value: '',
    },
    diff_type: {
      type: 'select',
      label: '对比结果筛选',
      value: '',
      style: { width: '200px' },
      options: this.baseConfig.lane_diff_type
    }
  }
  customFilter: string = ''

  geojsons: string[] = ['']
  curIndex: number = -1
  curDataRow: lanelineMachine.TaskCaseListI | null = null

  get query() {
    const query = this.$route.query
    const { task_id, task_name, task_num } = query
    return {
      task_id: +task_id,
      task_name,
      task_num: +task_num
    }
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get mapDiffType() {
    return parseToMapObj(this.baseConfig.lane_diff_type)
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_load() {
    return this.flags.some((f) => f.name.includes('nc_task_load'))
  }
  get disabledPrev() {
    // 处于第一页且第一个 或 初始状态下
    return (this.cur_page_num === 1 && this.curIndex === 0) || this.curIndex === -1 || !this.dataSource.length
  }
  get disabledNext() {
    // 处于最后一页最后一个
    return this.cur_page_num === this.total_pages && this.curIndex === this.dataSource.length - 1 || !this.dataSource.length
  }

  async pullTaskList(page: number, resetView: boolean = true) {
    if (!this.nc_task_load) {
      this.$Message.warning('你无权限')
      return
    }
    if (resetView) {
      this.resetMapView()
    }
    const { caseId, diff_type } = this.filterOptions
    this.cur_page_num = page
    this.loading = true
    const { task_id } = this.query
    const res = await lanelineMachine.getTaskDetail(`${task_id}`, {
      page,
      per_page: 10,
      id: caseId.value,
      diff_type: diff_type.value,
      custom_filter: this.customFilter
    })
    this.loading = false
    if (!res) {
      return
    }
    const { cur_page_num, total_num, pages, data_list } = res
    this.total = total_num
    this.cur_page_num = cur_page_num
    this.total_pages = pages
    this.dataSource = data_list || []
  }
  handleOnReset() {
    this.filterOptions.caseId.value = ''
    this.filterOptions.diff_type.value = ''
    this.customFilter = ''
    this.pullTaskList(1)
  }
  resetMapView() {
    this.geojsons = ['']
    this.curIndex = -1
    this.curDataRow = null
  }
  handleOnViewCase(row: lanelineMachine.TaskCaseListI, index: number) {
    if (!row) {
      return
    }
    this.curDataRow = row
    this.curIndex = index
    const { geojson } = row
    this.geojsons = [geojson]
  }
  async onPrevOrNext(isNext: boolean) {
    if (isNext) {
      if (this.curIndex === this.dataSource.length - 1) {
        this.cur_page_num = this.cur_page_num + 1
        await this.pullTaskList(this.cur_page_num, false)
        this.curIndex = 0
      } else {
        this.curIndex = this.curIndex + 1
      }
    } else {
      if (this.cur_page_num !== 1 && this.curIndex === 0) {
        this.cur_page_num = this.cur_page_num - 1
        await this.pullTaskList(this.cur_page_num, false)
        this.curIndex = this.dataSource.length - 1
      } else {
        this.curIndex = this.curIndex - 1
      }
    }
    this.handleOnViewCase(this.dataSource[this.curIndex], this.curIndex)
  }
  onSendCustomFilterVal(val: string) {
    this.customFilter = val
  }
  // hooks
  mounted() {
    this.pullTaskList(1)
  }
}
</script>

<style lang="less" scoped>
.task-table-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .numbers {
    font-size: 12px;
  }
}
.action-btns {
  margin-bottom: 20px;
}
.map-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 100px;
  height: 500px;
}
</style>
