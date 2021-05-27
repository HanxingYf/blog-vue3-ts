<template>
  <Layout>
    <NFilter
      :configs="filterOptions"
      @on-submit="handleOnPullTickTaskList(1)"
      :loading="loading"
      @on-cancel="handleOnReset"
    />
    <div class="table-wrapper">
      <Table
        :loading="loading"
        :columns="columns"
        :data="dataSource"
        size="small"
        border
      >
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button
              size="small"
              style="font-size: 12px"
              type="info"
              :disabled="!nc_task_to_job"
              @click="handleOnDistribute(row)"
              >下发</Button
            >
            <Button
              style="font-size: 12px"
              size="small"
              type="primary"
              :disabled="!nc_task_load"
              :to="`/voice-broadcast/completed-tasks/tick-task-detail?task_id=${row.id}&task_name=${row.task_name}&task_num=${row.task_num}`"
            >
              详情
            </Button>
            <Poptip
              transfer
              word-wrap
              confirm
              title="确认删除此任务吗"
              placement="top"
              @on-ok="handleOnDeleteTickTask(row, index)"
            >
              <Button
                size="small"
                style="font-size: 12px"
                type="error"
                :loading="row.loading"
                :disabled="!nc_task_delete"
                >删除</Button
              >
            </Poptip>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="time">
          <p>{{ row.create_time.split(" ")[0] }}</p>
          <p>{{ row.create_time.split(" ")[1] }}</p>
        </template>
      </Table>
      <div class="table-page">
        <Page
          :total="total"
          :current="curPageNum"
          show-total
          show-elevator
          @on-change="handleOnPullTickTaskList"
        />
      </div>
      <TickDeliverModal
        :visible="isModalOpen"
        :cur-data-row="curDataRow"
        @on-close="isModalOpen = false"
      />
    </div>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import TickDeliverModal from './TickDeliverModal.vue'
import { TickTaskListColumns } from './columns'
import { Columns } from '@/types'
import { TickTaskListRowI } from './types'
import { getTickTasks, deleteTickTask, TickTaskRunningListResI } from '@/presenter/machine.pre'
import { getUsersByRole, UserInfoI } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types';
import NFilter from '@/components/dumb/N-filter.vue'


@Component({
  components: {
    NFilter,
    TickDeliverModal
  }
})
export default class TickTaskList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    city_filter: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配'
    },
    creator_filter: {
      type: 'input',
      label: '创建者',
      value: '',
      placeholder: '创建者模糊匹配'
    },
    task_tag_filter: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称模糊匹配'
    }
  }
  columns: Columns[] = TickTaskListColumns
  dataSource: TickTaskListRowI[] = []
  loading: boolean = false
  total: number = 0
  curPageNum: number = 1

  curDataRow: TickTaskListRowI | null = null
  isModalOpen: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_load() {
    return this.flags.some((f) => f.name.includes('nc_task_load'))
  }
  get nc_task_delete() {
    return this.flags.some((f) => f.name.includes('nc_task_delete'))
  }
  get nc_task_to_job() {
    return this.flags.some((f) => f.name.includes('nc_task_to_job'))
  }
  get city_list() {
    return this.baseConfig.city_list
  }

  async handleOnPullTickTaskList(page: number) {
    this.curPageNum = page
    this.loading = true
    const { city_filter, creator_filter, task_tag_filter } = this.filterOptions
    const res = await getTickTasks({
      page: this.curPageNum,
      per_page: 10,
      progress: 'Completed',
      ...(city_filter.value ? { city_filter: city_filter.value } : {}),
      ...(creator_filter.value ? { creator_filter: creator_filter.value } : {}),
      ...(task_tag_filter.value ? { task_tag_filter: task_tag_filter.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { cur_page_num, data_list, total_num } = res
    this.dataSource = this.parseDataSource(data_list)
    this.total = total_num
  }
  parseDataSource(data: TickTaskRunningListResI[]): TickTaskListRowI[] {
    return data.map((item) => {
      const { id, task_tag, create_time, city_name, creator, num } = item
      return {
        id,
        task_name: task_tag,
        create_time,
        city: city_name,
        creator,
        task_num: num
      }
    })
  }
  handleOnReset() {
    this.filterOptions.city_filter.value = ''
    this.filterOptions.creator_filter.value = ''
    this.filterOptions.task_tag_filter.value = ''
    this.handleOnPullTickTaskList(1)
  }
  async handleOnDeleteTickTask(row: TickTaskListRowI, index: number) {
    if (!this.nc_task_delete) {
      this.$Message.warning('暂无权限')
      return
    }
    this.$set(this.dataSource[index], 'loading', true)
    const { deleted, msg } = await deleteTickTask(`${row.id}`)
    this.$set(this.dataSource[index], 'loading', true)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnPullTickTaskList(1)
    } else {
      this.$Message.error(`删除失败, ${msg}`)
    }
  }
  handleOnDistribute(row: TickTaskListRowI) {
    if (!this.nc_task_to_job) {
      this.$Message.warning('暂无权限')
      return
    }
    this.curDataRow = row
    this.isModalOpen = true
  }
  async mounted() {
    this.handleOnPullTickTaskList(1)
  }
}
</script>