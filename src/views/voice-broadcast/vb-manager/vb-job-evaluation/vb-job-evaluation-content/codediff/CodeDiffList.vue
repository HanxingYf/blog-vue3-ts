<template>
  <div class="task-manager-list">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetJobList(1)" 
      :loading="loading" 
      @on-cancel="handleOnReset"
    />
    <div class="table-wrapper">
      <div class="table-search" style="text-align: left">
        <RadioGroup type="button" v-model="dispatch_type">
          <Radio v-for="(item, index) in job_type" :key="index" :label="item.value">{{ item.label }}</Radio>
        </RadioGroup>
      </div>
      <Table :columns="columns" :data="dataSource" border :loading="loading" size="small">
        <template slot-scope="{ row, index }" slot="time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="nums">
          <p>{{ `${row.complete_count} / ${row.case_count}`, }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button
            type="primary"
            size="small"
            :to="`/voice-broadcast/task-evaluation/codediff-task-detail?job_id=${row.id}&job_name=${row.job_name}&dispatch_type=${row.dispatch_type}`">
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
import { EvaluationCodeDiffListColumns } from './columns'
import { getEvaluationCodeDiffList, EvaluationContentOrTickOrCodeDiffListI } from '@/presenter/manager.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common'

@Component({
  components: { NFilter }
})
export default class CodeDiffList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    // mark_job_id: {
    //   type: 'input',
    //   label: '评测ID',
    //   value: '',
    //   placeholder: '评测ID精确匹配'
    // },
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      placeholder: '评测名称模糊匹配'
    },
    city_filter: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配'
    }
  }
  // 表格相关
  loading: boolean = false
  columns: Columns[] = EvaluationCodeDiffListColumns
  dataSource: EvaluationContentOrTickOrCodeDiffListI[] = []

  // 分页相关
  cur_page_num: number = 1
  total: number = 0

  // 其他
  dispatch_type: number = 0 // 全部|评测|质检

  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get job_type() {
    return this.baseConfig.job_type
  }
  get flags() {
    return this.userInfo.flags
  }
  @Watch('dispatch_type')
  onJobTypeChanged(val: number) {
    this.handleOnGetJobList(this.cur_page_num)
    window.localStorage.setItem('codediff_select_job_type', `${val}`)
  }

  // methods
  async handleOnGetJobList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const { id, job_name, city_filter } = this.filterOptions
    const res = await getEvaluationCodeDiffList({
      page,
      per_page: 10,
      dispatch_type: this.dispatch_type,
      ...(id.value ? { id: id.value } : {}),
      // ...(mark_job_id.value ? { mark_job_id: mark_job_id.value } : {}),
      ...(job_name.value ? { job_name: job_name.value } : {}),
      ...(city_filter.value ? { city_filter: city_filter.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, data_list } = res
    this.total = total_num
    this.dataSource = data_list
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.job_name.value = ''
    this.filterOptions.mark_job_id.value = ''
    this.filterOptions.city_filter.value = ''
    this.handleOnGetJobList(1)
  }

  // hooks
  mounted() {
    const select_job_type = window.localStorage.getItem('codediff_select_job_type')
    if (select_job_type) {
      this.dispatch_type = +select_job_type
    }
    this.handleOnGetJobList(1)
  }
}
</script>
