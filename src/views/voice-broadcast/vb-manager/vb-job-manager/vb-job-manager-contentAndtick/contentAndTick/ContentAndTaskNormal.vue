<template>
  <div class="job-manager-tick">
    <NFilter
      :configs="filterOptions"
      @on-submit="handleOnGetJobList(1)"
      @on-cancel="handleOnReset"
      :loading="loading"
    />
    <div class="table-wrapper">
      <Table
        :columns="columns"
        :data="dataSource"
        border
        :loading="loading"
        size="small"
      >
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(" ")[0] }}</p>
          <p>{{ row.create_time.split(" ")[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="deadline_time">
          <p>{{ row.deadline_time.split(" ")[0] }}</p>
          <p>{{ row.deadline_time.split(" ")[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button
              size="small"
              type="info"
              :disabled="!nc_job_manager_dispatch || row.status === 3"
              @click="handleOnOpenModal(row)"
              >分发</Button
            >
            <Button
              size="small"
              type="primary"
              :to="`/voice-broadcast/task-manager/content-and-task-detail?job_id=${row.id}&job_name=${row.job_name}`"
              >已标注</Button
            >
            <Button
              size="small"
              type="primary"
              :to="`/voice-broadcast/task-manager/content-and-tick-task-statistics?job_id=${row.id}&job_name=${row.job_name}&dispatch_count=${row.dispatch_count}&case_count=${row.case_count}`"
              >统计</Button
            >
            <Poptip
              confirm
              title="确认结束此任务吗？"
              transfer
              placement="top"
              @on-ok="handleOnFinishJob(row)"
            >
              <Button
                size="small"
                type="error"
                :loading="row.loading"
                :disabled="!nc_job_manager_control || row.status === 3"
                >结束</Button
              >
            </Poptip>
          </div>
        </template>
      </Table>
      <div class="table-page">
        <Page
          :total="total"
          :current="cur_page"
          @on-change="handleOnGetJobList"
          show-total
          show-elevator
        />
      </div>
      <ContentAndTickDelivery
        :visible="isModalOpen"
        :cur-data-row="curDataRow"
        @on-close="handleOnCloseModal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Columns } from '@/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { ManagerContentAndTickNormalListColumns } from './columns'
import { ManagerContentAndTickTaskListRowI } from './type'
import { UserInfoI } from '@/models/common'
import ContentAndTickDelivery from './ContentAndTickDelivery.vue'
import { getManagerContentAndTickNormalList, EvaluationContentAndTickfDetailListI, getDeliveryContentAndTickDetail, finishContentAndTickTask } from '@/presenter/manager.pre'

@Component({ components: { NFilter, ContentAndTickDelivery } })
export default class ContentAndTickNormal extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      placeholder: '评测名称模糊匹配',
      style: { width: '150px' }
    }
  }

  // 分页相关
  cur_page: number = 1
  total: number = 0

  // 表格相关
  loading: boolean = false
  columns: Columns[] = ManagerContentAndTickNormalListColumns
  dataSource: ManagerContentAndTickTaskListRowI[] = []

  // 模态框相关
  curDataRow: ManagerContentAndTickTaskListRowI | null = null
  isModalOpen: boolean = false

  tableLoading: boolean = false


  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_job_manager() {
    return this.flags.some((f) => f.name.includes('nc_job_manager'))
  }
  get nc_job_manager_control() {
    return this.flags.some((f) => f.name.includes('nc_job_manager_control'))
  }
  get nc_job_manager_dispatch() {
    return this.flags.some((f) => f.name.includes('nc_job_manager_dispatch'))
  }


  async handleOnGetJobList(page: number) {
    if (!this.nc_job_manager) {
      this.$Message.warning('暂无权限')
      return
    }
    this.loading = true
    this.cur_page = page
    const { job_name, id } = this.filterOptions
    const res = await getManagerContentAndTickNormalList({
      page,
      per_page: 10,
      desc: true,
      ...(job_name.value ? { job_name: job_name.value } : {}),
      ...(id.value ? { id: +id.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    // console.log(res.data_list[0].status,'+++');
    const { total_num, data_list } = res
    this.dataSource = this.parseDataSource(data_list)
    this.total = total_num
  }
  parseDataSource(data: EvaluationContentAndTickfDetailListI[]): ManagerContentAndTickTaskListRowI[] {
    return data.map((item) => {
      const {
        id, job_name, create_time, admin, status,
        deadline, update_time, dispatch_count, case_count, description
      } = item
      return {
        id,
        job_name,
        create_time,
        admin,
        deadline_time: deadline,
        update_time,
        dispatch_count,
        case_count,
        status,
        description
      }
    })
  }
  async handleOnFinishJob(row: ManagerContentAndTickTaskListRowI) {
    if (!this.nc_job_manager_control) {
      this.$Message.warning('你无权限')
      return
    }
    (row as any).loading = true
    const { id, status } = row
    // console.log(status,this.nc_job_manager_dispatch,'++');
    const { finished, msg } = await finishContentAndTickTask(id);
    (row as any).loading = false
    if (finished) {
      this.$Message.success(`结束成功, ${msg}`)
      this.handleOnGetJobList(1)
    } else {
      this.$Message.success(`结束失败, ${msg}`)
    }
    this.$forceUpdate()
  }

  handleOnOpenModal(row: ManagerContentAndTickTaskListRowI) {
    this.curDataRow = row
    this.isModalOpen = true
  }
  handleOnCloseModal(refresh: boolean) {
    this.isModalOpen = false
    refresh && this.handleOnGetJobList(1)
  }
  handleOnReset() {
    this.filterOptions.job_name.value = ''
    this.filterOptions.id.value = ''
    this.handleOnGetJobList(1)
  }
  mounted() {
    this.handleOnGetJobList(1)
  }
}
</script>

<style lang="less" scoped>
</style>

