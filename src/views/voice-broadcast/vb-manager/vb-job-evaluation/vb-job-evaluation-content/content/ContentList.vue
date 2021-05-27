<template>
  <div class="task-manager-list">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetJobList(1)" 
      :loading="loading" 
      @on-cancel="handleOnReset"
    />
    <div class="table-wrapper">
      <div class="table-search">
        <div class="search-item">
          <RadioGroup type="button" v-model="dispatch_type">
            <Radio v-for="(item, index) in job_type" :key="index" :label="item.value">{{ item.label }}</Radio>
          </RadioGroup>
        </div>
        <div class="search-item">
          <RadioGroup type="button" v-model="is_public_evaluation">
            <Radio :label="0">以非众验模式查看</Radio>
            <Radio :label="1">以众验模式查看</Radio>
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
        <template slot-scope="{ row, index }" slot="blind">
          <p>{{ +row.blind ? '是' : '否' }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button
            type="primary"
            size="small"
            :to="`/voice-broadcast/task-evaluation/content-task-detail?job_id=${row.id}&job_name=${row.job_name}&blind=${+row.blind}&dispatch_type=${row.dispatch_type}&is_public_evaluation=${+is_public_evaluation}`">
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
import { EvaluationContentListColumns } from './columns'
import { getEvaluationContentList, EvaluationContentOrTickOrCodeDiffListI } from '@/presenter/manager.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common'
import { EvaluationContentListRowI } from './types'

@Component({
  components: { NFilter }
})
export default class ContentList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    blind_test: {
      type: 'select',
      label: '是否盲评',
      value: -1,
      options: [{ label: '所有', value: -1 }, { label: '是', value: 1 }, { label: '否', value: 0 }]
    }
  }
  // 表格相关
  loading: boolean = false
  columns: Columns[] = EvaluationContentListColumns
  dataSource: EvaluationContentListRowI[] = []

  // 分页相关
  cur_page_num: number = 1
  total: number = 0

  // 其他
  dispatch_type: number = 0 // 全部|评测|质检
  is_public_evaluation: number = 0 // 是否开启众验

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
    window.localStorage.setItem('content_select_job_type', `${val}`)
  }
  @Watch('is_public_evaluation')
  onIsPublicEvaluationChanged(val: number) {
    window.localStorage.setItem('is_public_evaluation', `${val}`)
  }

  // methods
  async handleOnGetJobList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const { id, blind_test } = this.filterOptions
    const res = await getEvaluationContentList({
      page,
      per_page: 10,
      ...(+this.dispatch_type ? { type: this.dispatch_type } : {} ),
      ...(id.value ? { id: id.value } : {}),
      ...(`${blind_test.value}` && blind_test.value !== -1 ? { blind_test: !!blind_test.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, pa_jobs } = res
    this.total = total_num
    this.dataSource = this.parseDataSource(pa_jobs)
  }
  parseDataSource(data: EvaluationContentOrTickOrCodeDiffListI[]): EvaluationContentListRowI[] {
    return data.map((item) => {
      const {
        id, job_name, create_time, case_count, city_filter,
        deadline, description, complete_count, blind_test, dispatch_type
      } = item
      return {
        id,
        job_name,
        create_time,
        city: city_filter,
        nums: `${complete_count} / ${case_count}`,
        deadline_time: deadline,
        desc_of_evaluation: description,
        dispatch_type,
        blind: blind_test
      }
    })
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.blind_test.value = -1
    this.handleOnGetJobList(1)
  }

  // hooks
  mounted() {
    const select_job_type = window.localStorage.getItem('content_select_job_type')
    const is_public_evaluation = window.localStorage.getItem('is_public_evaluation')
    if (select_job_type) {
      this.dispatch_type = +select_job_type
    }
    if (is_public_evaluation) {
      this.is_public_evaluation = +is_public_evaluation
    }
    this.handleOnGetJobList(1)
  }
}
</script>
