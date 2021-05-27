<template>
  <!-- 评测列表 -->
  <div class="task-manager-list">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetJobList(1)" 
      @on-cancel="handleOnReset"
      :loading="loading" />
    <div class="table-wrapper">
      <Table :columns="columns" :data="dataSource" border :loading="loading" size="small">
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="city_id">
          {{ mapCity[+row.city_filter] }}
        </template>
        <template slot-scope="{ row, index }" slot="deadline_time">
          <p>{{ row.deadline.split(' ')[0] }}</p>
          <p>{{ row.deadline.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="dispatch">
          <p>子块：{{ row.block_dispatch_count }} / {{ row.block_count }}</p>
          <p>POI数量：{{ row.dispatch_count }} / {{ row.case_count }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button size="small" type="info" :disabled="!nc_job_manager_dispatch || row.status === 3" @click="handleOnDelivery(row)">分发</Button>
            <Button size="small" type="primary" :to="`/basemap-evaluation/task-manager/basemap-task-detail?job_id=${row.id}&job_name=${row.job_name}&city_code=${row.city_filter}`">已标注</Button>
            <!-- <Button size="small" type="primary" :to="`/basemap-evaluation/task-manager/basemap-task-statistics?job_id=${row.id}&job_name=${row.job_name}&dispatch_count=${row.dispatch_count}&case_count=${row.nums}`">统计</Button> -->
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
    <BasemapDelivery 
      :visible="isModalOpen"
      :cur-data-row="curDataRow"
      @on-close="handleOnCloseModal"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import BasemapDelivery from './BasemapDelivery.vue'
import { SelectItem, Columns, DistributorI } from '@/types'
import { ManagerBasemapTaskListColumns } from './columns'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common'
import * as basemapManage from '@/models/manager/basemap'
import { BaseMapManagerListI } from '@/models/manager/basemap'
import { parseToMapObj } from '@/utils'

@Component({ components: { NFilter, BasemapDelivery } })
export default class BasemapNormal extends Vue {
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
      placeholder: '城市ID模糊匹配',
      style: { width: '150px' }
    }
  }
  // 表格相关
  loading: boolean = false
  columns: Columns[] = ManagerBasemapTaskListColumns
  dataSource: BaseMapManagerListI[] = []

  // 分页相关
  cur_page_num: number = 1
  total: number = 0

  // 模态框相关
  curDataRow: BaseMapManagerListI | null = null
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
  get nc_job_manager() {
    return this.flags.some((f) => f.name.includes('nc_job_manager'))
  }
  get nc_job_manager_control() {
    return this.flags.some((f) => f.name.includes('nc_job_manager_control'))
  }
  get nc_job_manager_dispatch() {
    return this.flags.some((f) => f.name.includes('nc_job_manager_dispatch'))
  }
  get mapCity() {
    return parseToMapObj(this.baseConfig.city_list)
  }

  async handleOnGetJobList(page: number) {
    if (!this.nc_job_manager) {
      this.$Message.warning('你无权限')
      return
    }
    this.cur_page_num = page
    this.loading = true
    const { city_filter, id, job_name } = this.filterOptions
    const res = await basemapManage.getJobList({
      page,
      per_page: 10,
      ...(city_filter.value ? { city_filter: city_filter.value } : {}),
      ...(id.value ? { id: id.value } : {}),
      ...(job_name.value ? { job_name: job_name.value } : {})
    })
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { data_list, cur_page_num, total_num } = res
    this.cur_page_num = cur_page_num
    this.total = total_num
    this.dataSource = data_list
    this.loading = false
  }
  handleOnReset() {
    this.filterOptions.city_filter.value = ''
    this.filterOptions.id.value = ''
    this.filterOptions.job_name.value = ''
    this.handleOnGetJobList(1)
  }
  // 结束任务
  async handleOnFinishJob(row: BaseMapManagerListI) {
    if (!this.nc_job_manager_control) {
      this.$Message.warning('你无权限')
      return
    }
    (row as any).loading = true
    const { id } = row
    const { stoped, msg } = await basemapManage.stopJob(`${id}`);
    (row as any).loading = false
    if (stoped) {
      this.$Message.success(`结束成功, ${msg}`)
      this.handleOnGetJobList(1)
    } else {
      this.$Message.success(`结束失败, ${msg}`)
    }
    this.$forceUpdate()
  }
  // 打开分发modal
  handleOnDelivery(row: BaseMapManagerListI) {
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
