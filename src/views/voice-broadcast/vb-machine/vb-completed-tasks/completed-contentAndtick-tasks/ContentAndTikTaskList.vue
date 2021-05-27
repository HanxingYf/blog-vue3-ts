<template>
  <Layout>
    <NFilter
      :configs="filterOptions"
      @on-cancel="handleOnReset"
      @on-submit="handleOnPullTickTaskList(1)"
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
              :to="`/voice-broadcast/completed-tasks/contentandtick-task-detail?task_id=${row.id}&task_name=${row.task_name}&task_num=${row.num}`"
            >
              详情
            </Button>
            <Poptip
              transfer
              word-wrap
              confirm
              title="确认删除此任务吗"
              placement="top"
              @on-ok="handleOnDeleteContentAndTickTask(row, index)"
            >
              <Button
                size="small"
                style="font-size: 12px"
                type="error"
                :loading="row.loading"
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
          :current="cur_page_num"
          show-total
          show-elevator
          @on-change="handleOnPullTickTaskList"
        />
      </div>
      <ContentAndTickDeliverModal
        :visible="isModalOpen"
        :cur-data-row="curDataRow"
        @on-close="isModalOpen = false"
      />
    </div>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { FilterConfigI } from '@/components/dumb/types';
import NFilter from '@/components/dumb/N-filter.vue'
import { Columns } from '@/types';
import { ContentAndTickTaskListColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI } from '@/presenter/common.pre'
import { ContentAndTickTaskListRowI } from './types'
import ContentAndTickDeliverModal from './ContentAndTickDeliverModal.vue'
import { getContentAndTickTask, ContentAndTickTaskRunningListResI, deleteContentAndTickTask } from '@/presenter/machine.pre'

@Component({
  components: {
    NFilter,
    ContentAndTickDeliverModal
  }
})
export default class ContentAndTickTaskList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id_filter: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    task_name_filter: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称模糊匹配'
    },
    creator_filter: {
      type: 'input',
      label: '创建人',
      value: '',
      placeholder: '创建人模糊匹配'
    },
  }

  cur_page_num: number = 1
  loading: boolean = false
  total: number = 0
  columns: Columns[] = ContentAndTickTaskListColumns;
  dataSource: ContentAndTickTaskListRowI[] = [];
  curDataRow: ContentAndTickTaskRunningListResI | null = null
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

  // 下发
  handleOnDistribute(row: ContentAndTickTaskRunningListResI) {
    if (!this.nc_task_to_job) {
      this.$Message.warning('暂无权限')
      return
    }
    this.curDataRow = row
    this.isModalOpen = true
  }

  handleOnReset() {
    this.filterOptions.id_filter.value = ''
    this.filterOptions.creator_filter.value = ''
    this.filterOptions.task_name_filter.value = ''
    this.handleOnPullTickTaskList(1)
  }

  async handleOnPullTickTaskList(page: number) {
    this.cur_page_num = page
    this.loading = true
    const { create_time_filter, creator_filter, task_name_filter, id_filter } = this.filterOptions
    const res = await getContentAndTickTask({
      page: this.cur_page_num,
      per_page: 10,
      progress: 'Completed',
      ...(id_filter.value ? { id: id_filter.value } : {}),
      ...(creator_filter.value ? { creator: creator_filter.value } : {}),
      ...(task_name_filter.value ? { task_name: task_name_filter.value } : {}),
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    // console.log(res, '成功');
    const { cur_page_num, total_num, data_list, } = res
    this.dataSource = this.parseDataSource(data_list)
    this.total = total_num
  }
  parseDataSource(data: ContentAndTickTaskRunningListResI[]): ContentAndTickTaskListRowI[] {
    return data.map((item) => {
      const { completed_num, creator, create_time, id, jenkins_url, new_host, num, original_host, progress, task_name, update_time } = item
      return {
        completed_num,
        create_time,
        creator,
        id,
        jenkins_url,
        new_host,
        num,
        original_host,
        progress,
        task_name,
        update_time,
      }
    })
  }

  async handleOnDeleteContentAndTickTask(row: ContentAndTickTaskListRowI, index: number) {
    if (!this.nc_task_delete) {
      this.$Message.warning('暂无权限')
      return
    }
    this.$set(this.dataSource[index], 'loading', true)
    const { deleted, msg } = await deleteContentAndTickTask(`${row.id}`)
    this.$set(this.dataSource[index], 'loading', true)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnPullTickTaskList(1)
    } else {
      this.$Message.error(`删除失败, ${msg}`)
    }
  }

  async mounted() {
    this.handleOnPullTickTaskList(1)
  }
}
</script>
