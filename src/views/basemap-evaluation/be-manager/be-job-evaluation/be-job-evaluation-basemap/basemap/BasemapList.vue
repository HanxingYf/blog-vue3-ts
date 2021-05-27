<template>
  <div class="task-manager-list">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetJobList(1)" 
      :loading="loading" 
      @on-cancel="handleOnReset"
    />
    <div class="table-wrapper">
      <Table :columns="columns" :data="dataSource" border :loading="loading" size="small">
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="city_id">
          {{ mapCity[+row.city_filter] }}
        </template>
        <template slot-scope="{ row, index }" slot="deadline">
          <p>{{ row.deadline.split(' ')[0] }}</p>
          <p>{{ row.deadline.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="marked">
          <p>POI：{{ row.complete_count }} / {{ row.case_count }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="city">
          <p>{{ row.city_filter }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button
            type="primary"
            size="small"
            :to="`/basemap-evaluation/task-evaluation/basemap-task-detail?job_id=${row.id}&job_name=${row.job_name}&city_code=${row.city_filter}`">
            详情
          </Button>
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Columns } from '@/types'
import { EvaluationBasemapListColumns } from './columns'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common'
import * as basemapManager from '@/models/manager/basemap'
import { BaseMapEvaluationListI } from '@/models/manager/basemap'
import { parseToMapObj } from '@/utils'

@Component({
  components: { NFilter }
})
export default class BasemapList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    city_filter: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市ID模糊匹配'
    },
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      placeholder: '评测名称模糊匹配'
    }
  }
  // 表格相关
  loading: boolean = false
  columns: Columns[] = EvaluationBasemapListColumns
  dataSource: BaseMapEvaluationListI[] = []

  // 分页相关
  cur_page_num: number = 1
  total: number = 0

  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get flags() {
    return this.userInfo.flags
  }
  get mapCity() {
    return parseToMapObj(this.baseConfig.city_list)
  }

  // methods
  async handleOnGetJobList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const { id, city_filter, job_name } = this.filterOptions
    const res = await basemapManager.getPaJobList({
      page,
      per_page: 10,
      id: id.value,
      job_name: job_name.value,
      city_filter: city_filter.value
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, data_list, cur_page_num } = res
    this.total = total_num
    this.cur_page_num = cur_page_num
    this.dataSource = data_list
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.city_filter.value = ''
    this.filterOptions.job_name.value = ''
    this.handleOnGetJobList(1)
  }

  mounted() {
    this.handleOnGetJobList(1)
  }
}
</script>
