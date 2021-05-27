<template>
  <!-- 评测列表 -->
  <div class="task-manager-list">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetJobList(1)" 
      @on-cancel="handleOnReset"
      :loading="loading" />
    <div class="table-wrapper">
      <div class="table-search">
        <div class="search-item"></div>
        <div class="search-item">
          <RadioGroup type="button" v-model="control_blind">
            <Radio :label="0">以非盲评模式查看已标注</Radio>
            <Radio :label="1">以盲评模式查看已标注</Radio>
          </RadioGroup>
        </div>
      </div>
      <Table :columns="columns" :data="dataSource" border :loading="loading" size="small">
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="deadline_time">
          <p>{{ row.deadline_time.split(' ')[0] }}</p>
          <p>{{ row.deadline_time.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button size="small" type="info" :disabled="!nc_job_manager_dispatch || row.status === 3" @click="handleOnDelivery(row)">分发</Button>
            <Button size="small" type="primary" :to="`/voice-broadcast/task-manager/content-task-detail?job_id=${row.id}&job_name=${row.job_name}&blind=${+control_blind}`">已标注</Button>
            <Button size="small" type="primary" :to="`/voice-broadcast/task-manager/content-task-statistics?job_id=${row.id}&job_name=${row.job_name}&dispatch_count=${row.dispatch_count}&case_count=${row.nums}`">统计</Button>
            <Poptip confirm title="确认结束此任务吗？" transfer placement="top" @on-ok="handleOnFinishJob(row)">
              <Button size="small" type="error" :loading="row.loading" :disabled="!nc_job_manager_control || row.status === 3">结束</Button>
            </Poptip>
          </div>
        </template>
      </Table>
      <div class="table-page">
        <Page 
          :total="total"
          :current="cur_page_num"
          @on-change="handleOnGetJobList"
          show-total
          show-elevator/>
      </div>
    </div>
    <ContentDelivery 
      :visible="isModalOpen"
      :cur-data-row="curDataRow"
      @on-close="handleOnCloseModal"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ContentDelivery from './ContentDelivery.vue'
import { SelectItem, Columns, DistributorI } from '@/types'
import { ManagerContentTaskListColumns } from './columns'
import { getManagerContentNormalList, finishTask, ManagerContentOrTickOrCodeDiffNormalListI } from '@/presenter/manager.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common'
import { ManagerContentTaskListRowI } from './types'

@Component({ components: { NFilter, ContentDelivery } })
export default class ContentNormal extends Vue {
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配',
      style: { width: '150px' }
    },
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      placeholder: '评测名称模糊匹配',
      style: { width: '150px' }
    },
    city_filter: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配',
      style: { width: '150px' }
    },
    diff_res_filter: {
      type: 'select',
      label: '对比结果筛选',
      value: '',
      options: this.machine_tag,
      style: { width: '150px' }
    }
  }
  // 表格相关
  loading: boolean = false
  columns: Columns[] = ManagerContentTaskListColumns
  dataSource: ManagerContentTaskListRowI[] = []

  // 分页相关
  cur_page_num: number = 1
  total: number = 0

  // 模态框相关
  curDataRow: ManagerContentTaskListRowI | null = null
  isModalOpen: boolean = false

  // 控制是否以盲评模式查看盲评任务，默认否
  control_blind: number = 0

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
  get machine_tag() {
    return this.baseConfig.machine_tag
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
      this.$Message.warning('你无权限')
      return
    }
    this.cur_page_num = page
    this.loading = true
    const { diff_res_filter, city_filter, id, job_name } = this.filterOptions
    const res = await getManagerContentNormalList({
      page,
      per_page: 10,
      ...(diff_res_filter.value ? { diff_res_filter: diff_res_filter.value } : {}),
      ...(city_filter.value ? { city_filter: city_filter.value } : {}),
      ...(id.value ? { id: id.value } : {}),
      ...(job_name.value ? { job_name: job_name.value } : {})
    })
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { jobs, cur_page_num, total_num } = res
    this.cur_page_num = cur_page_num
    this.total = total_num
    this.dataSource = this.parseDataSource(jobs)
    this.loading = false
  }
  parseDataSource(data: ManagerContentOrTickOrCodeDiffNormalListI[]): ManagerContentTaskListRowI[]  {
    return data.map((item) => {
      const {
        id, job_name, create_time, city_filter, diff_res_filter,
        code_filter, content_filter, case_count, deadline, description,
        dispatch_count, status
      } = item
      return {
        id,
        job_name,
        create_time,
        city: city_filter,
        result_of_comparison: diff_res_filter,
        filter_of_code: code_filter,
        filter_of_description: content_filter,
        nums: case_count,
        deadline_time: deadline,
        desc_of_evaluation: description,
        dispatch_count,
        status
      }
    })
  }
  handleOnReset() {
    this.filterOptions.diff_res_filter.value = ''
    this.filterOptions.city_filter.value = ''
    this.filterOptions.id.value = ''
    this.filterOptions.job_name.value = ''
    this.handleOnGetJobList(1)
  }
  // 结束任务
  async handleOnFinishJob(row: ManagerContentTaskListRowI) {
    if (!this.nc_job_manager_control) {
      this.$Message.warning('你无权限')
      return
    }
    (row as any).loading = true
    const { id } = row
    const { finished, msg } = await finishTask(id, 'content', { jobid: id });
    (row as any).loading = false
    if (finished) {
      this.$Message.success(`结束成功, ${msg}`)
      this.handleOnGetJobList(1)
    } else {
      this.$Message.success(`结束失败, ${msg}`)
    }
    this.$forceUpdate()
  }
  // 打开分发modal
  handleOnDelivery(row: ManagerContentTaskListRowI) {
    this.curDataRow = row
    this.isModalOpen = true
  }
  // 关闭分发modal
  handleOnCloseModal(reflash: boolean) {
    this.isModalOpen = false
    reflash && this.handleOnGetJobList(this.cur_page_num)
  }
  mounted() {
    this.handleOnGetJobList(1)
  }
}
</script>
