<template>
  <div class='task-list'>
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnPullTaskList(1)" 
      :loading="loading" 
      submit-text="查询"
      @on-cancel="onReset"
    />
    <div class="table-wrapper">
      <Table 
        :loading="loading"
        :columns="columns"
        :data="dataSource"
        size="small"
        border>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button type="info" style="font-size: 12px;" size="small" @click="handleOnDistribute(row)">下发</Button>
            <Button
              size="small"
              type="primary"
              style="font-size: 12px;"
              :to="`/laneline-evaluation/completed-tasks/task-detail?task_id=${row.id}&task_name=${row.task_name}&task_num=${row.num}`">
              详情
            </Button>
            <Poptip transfer word-wrap confirm title="确认删除此任务吗" placement="top" @on-ok="handleOnDeleteTask(row, index)">
              <Button type="error" style="font-size: 12px;" size="small" :loading="row.loading">删除</Button>
            </Poptip>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
      </Table>
      <div class="table-page">
        <Page :total="total" :current="curPageNum" show-total show-elevator @on-change="handleOnPageChange"/>
      </div>
    </div>
    <DeliveryModal :visible="isModalOpen" :curDataRow="curDataRow" @on-close="isModalOpen = false"/>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import { FilterConfigI } from '@/components/dumb/types';
import NFilter from '@/components/dumb/N-filter.vue'
import DeliveryModal from './DeliveryModal.vue'
import { taskListColumns } from './columns'
import { BaseConfigI } from '@/models/distribute_config';
import { UserInfoI } from '@/models/common';
import * as lanelineMachine from '@/models/machine/laneline'

@Component({
  components: {
    NFilter,
    DeliveryModal
  }
})
export default class TaskList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    task_name: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称模糊匹配'
    },
    city: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配'
    },
    creator: {
      type: 'input',
      label: '创建人',
      value: '',
      placeholder: '创建人模糊匹配'
    }
  }
  loading: boolean = false
  columns = taskListColumns
  dataSource: lanelineMachine.TaskListI[] = []
  total: number = 0
  curPageNum: number = 1
  curDataRow: lanelineMachine.TaskListI | null = null
  isModalOpen: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get city_list() {
    return this.baseConfig.city_list
  }

  async handleOnPullTaskList(page: number) {
    this.loading = true
    const { id, task_name, city, creator } = this.filterOptions
    const res = await lanelineMachine.getTasksByStatus('Completed', {
      page,
      per_page: 10,
      id: id.value,
      city_name: city.value,
      task_name: task_name.value,
      creator: creator.value
    })
    this.loading = false
    if (res) {
      const { data_list, cur_page_num, total_num } = res
      this.curPageNum = cur_page_num
      this.dataSource = data_list
      this.total = total_num
    } else {
      this.$Message.error('请求失败')
    }
  }
  onReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.city.value = ''
    this.filterOptions.task_name.value = ''
    this.filterOptions.creator.value = ''
    this.handleOnPullTaskList(1)
  }
  handleOnDistribute(row: lanelineMachine.TaskListI) {
    this.curDataRow = row
    this.isModalOpen = true
  }
  async handleOnDeleteTask(row: lanelineMachine.TaskListI, index: number) {
    const { deleted, msg } = await lanelineMachine.deleteTask(row.id)
    this.$set(this.dataSource[index], 'loading', false)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnPullTaskList(1)
    } else {
      this.$Message.success(`删除失败, ${msg}`)
    }
  }
  handleOnPageChange(page: number) {
    this.curPageNum = page
    this.handleOnPullTaskList(page)
  }
  mounted() {
    this.handleOnPullTaskList(1)
  }
}
</script>
