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
          <Button
            size="small"
            type="primary"
            style="font-size: 12px;"
            :disabled="!nc_task_load"
            :to="`/voice-broadcast/completed-tasks/content-task-detail?task_id=${row.id}&task_name=${row.task_name}&task_num=${row.task_num}`">
            详情
          </Button>
          <Poptip transfer word-wrap confirm title="确认删除此任务吗" placement="top" @on-ok="handleOnDeleteTask(row, index)">
            <Button type="error" style="font-size: 12px;" size="small" :loading="row.loading" :disabled="!nc_task_delete">删除</Button>
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
    <ContentDeliverModal
      :visible="isModalOpen"
      :cur-data-row="curDataRow"
      @on-close="isModalOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ContentDeliverModal from './ContentDeliverModal.vue'
import { contentTaskListColumns } from './columns'
import { Columns, DistributorI } from '@/types'
import {
  getContentTasks, deleteContentAndHotCodeTask,
  ContentAndHotCodeTaskDetailListResI, ContentAndHotCodeTaskRunningListResI
} from '@/presenter/machine.pre'
import { getUsersByRole } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI } from '@/presenter/common.pre'
import { ContentTaskRowI } from './types'
import { FilterConfigI } from '@/components/dumb/types';
// import NFilter from '@/components/dumb/N-filter.vue'

@Component({
  components: {
    ContentDeliverModal,
    // NFilter
  }
})
export default class ContentTaskList extends Vue {
  // filterOptions: { [propName: string]: FilterConfigI } = {
  //   id: {
  //     type: 'input',
  //     label: 'ID',
  //     value: '',
  //     placeholder: 'ID精确匹配'
  //   },
  //   task_name: {
  //     type: 'input',
  //     label: '任务名称',
  //     value: '',
  //     placeholder: '任务名称模糊匹配'
  //   },
  //   city: {
  //     type: 'input',
  //     label: '城市',
  //     value: '',
  //     placeholder: '城市模糊匹配'
  //   },
  //   creator: {
  //     type: 'input',
  //     label: '创建者',
  //     value: '',
  //     placeholder: '创建者模糊匹配'
  //   }
  // }
  // 表格相关
  columns: Columns[] = contentTaskListColumns
  dataSource: ContentTaskRowI[] = []
  loading: boolean = false
  list: ContentTaskRowI[] = []
  total: number = 0
  curPageNum: number = 1
  curDataRow: ContentTaskRowI | null = null
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

  async handleOnDeleteTask(row: ContentTaskRowI, index: number) {
    if (!this.nc_task_delete) {
      this.$Message.warning('你无权限')
      return
    }
    this.$set(this.dataSource[index], 'loading', true)
    const { deleted, msg } = await deleteContentAndHotCodeTask(`${row.id}`);
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
    const res = await getContentTasks({})
    if (res) {
      const { codeDiffTasks, count } = res
      this.curPageNum = 1
      this.list = this.parseDataSource(codeDiffTasks)
      this.total = count
      this.dataSource = this.list.slice(0, 10)
    } else {
      this.$Message.error('请求失败')
    }
    this.loading = false
  }
  parseDataSource(data: ContentAndHotCodeTaskRunningListResI[]) {
    return data.map((item) => {
      const {
        id, taskid, createtime, city, citylist, recallrate,
        maxweight, creator, codenum, allconsisrate, mainconsisrate
      } = item
      return {
        id,
        task_name: taskid,
        create_time: createtime.replace('T', ' ').replace('+08:00', ''),
        city,
        min_link_level: maxweight,
        creator,
        task_num: codenum,
        all_consisrate: allconsisrate.toFixed(2),
        main_consisrate: mainconsisrate.toFixed(2),
        recall_rate: recallrate.toFixed(2)
      }
    })
  }
  handleOnDistribute(row: ContentTaskRowI) {
    if (!this.nc_task_to_job) {
      this.$Message.warning('你无权限')
      return
    }
    this.curDataRow = row
    this.isModalOpen = true
  }
  handleOnPageChange(page: number) {
    this.curPageNum = page
    this.dataSource = this.list.slice((page - 1) * 10, page * 10)
  }

  async created() {
    this.handleOnPullTaskList()
  }
}
</script>
