<template>
  <div class="table-wrapper">
    <!-- <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnPullCodeDiffTaskList(1)" 
      :loading="loading" 
      @on-cancel="handleOnReset"
    /> -->
    <Table 
      :loading="loading"
      :columns="columns"
      :data="dataSource"
      size="small"
      border>
      <template slot-scope="{ row, index }" slot="action">
        <div class="action-btn-group">
          <Button type="info" style="font-size: 12px;" size="small" :disabled="!nc_task_to_job" @click="handleOnDistribute(row)">下发</Button>
          <!-- <Button
            size="small"
            type="primary"
            style="font-size: 12px;"
            :disabled="!nc_task_load"
            :to="`/basemap-evaluation/completed-tasks/basemap-task-detail?task_id=${row.id}&task_name=${row.task_name}&task_num=${row.task_num}`">
            详情
          </Button> -->
          <Poptip transfer word-wrap confirm title="确认删除此任务吗" placement="top" @on-ok="handleOnDeleteTask(row, index)">
            <Button type="error" style="font-size: 12px;" size="small" :loading="row.loading" :disabled="!nc_task_delete">删除</Button>
          </Poptip>
        </div>
      </template>
      <template slot-scope="{ row, index }" slot="create_time">
        <p>{{ row.create_time.split(' ')[0] }}</p>
        <p>{{ row.create_time.split(' ')[1] }}</p>
      </template>
      <template slot-scope="{ row, index }" slot="blockIds">
        <Poptip trigger="hover" title="子块编号详情" transfer>
          <span>查看子块编号</span>
          <div slot="content" v-html="genBlocksBeauty(row.block_noes)"></div>
        </Poptip>
      </template>
    </Table>
    <div class="table-page">
      <Page :total="total" :current="curPageNum" show-total show-elevator @on-change="handleOnPageChange"/>
    </div>
    <BasemapDeliverModal
      :visible="isModalOpen"
      :cur-data-row="curDataRow"
      @on-close="isModalOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BasemapDeliverModal from './BasemapDeliverModal.vue'
import { basemapTaskListColumns } from './columns'
import { Columns, DistributorI } from '@/types'
import {
  getContentTasks, deleteContentAndHotCodeTask,
  ContentAndHotCodeTaskDetailListResI, ContentAndHotCodeTaskRunningListResI
} from '@/presenter/machine.pre'
import { getUsersByRole } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types';
// import NFilter from '@/components/dumb/N-filter.vue'
import * as basemapManage from '@/models/machine/basemap'
import { BlockI } from '@/models/machine/basemap'

@Component({
  components: {
    BasemapDeliverModal,
    // NFilter
  }
})
export default class BasemapTaskList extends Vue {
  // 表格相关
  columns: Columns[] = basemapTaskListColumns
  dataSource: any[] = []
  loading: boolean = false
  total: number = 0
  curPageNum: number = 1
  curDataRow: any | null = null
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

  async handleOnDeleteTask(row: any, index: number) {
    if (!this.nc_task_delete) {
      this.$Message.warning('你无权限')
      return
    }
    this.$set(this.dataSource[index], 'loading', true)
    const { deleted, msg } = await basemapManage.deleteTask(row.id)
    this.$set(this.dataSource[index], 'loading', false)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnPullTaskList()
    } else {
      this.$Message.success(`删除失败, ${msg}`)
    }
  }
  async handleOnPullTaskList() {
    this.loading = true
    const res = await basemapManage.getTasksByStatus('Completed', {
      page: this.curPageNum,
      per_page: 10
    })
    if (res) {
      const { data_list, cur_page_num, total_num } = res
      this.curPageNum = cur_page_num
      this.dataSource = data_list
      this.total = total_num
    } else {
      this.$Message.error('请求失败')
    }
    this.loading = false
  }
  handleOnDistribute(row: any) {
    if (!this.nc_task_to_job) {
      this.$Message.warning('你无权限')
      return
    }
    this.curDataRow = row
    this.isModalOpen = true
  }
  handleOnPageChange(page: number) {
    this.curPageNum = page
    this.handleOnPullTaskList()
  }
  genBlocksBeauty(block_noes: { BlockNos: BlockI[] }) {
    const { BlockNos } = block_noes
    return BlockNos.map((bl) => `${bl.block_no} -> ${bl.block_ids.join(',')}`).join('<br />')
  }

  async created() {
    this.handleOnPullTaskList()
  }
}
</script>
