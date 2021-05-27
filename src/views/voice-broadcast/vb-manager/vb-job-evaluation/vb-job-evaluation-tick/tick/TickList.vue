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
          <Button
            type="primary"
            size="small"
            :to="`/voice-broadcast/task-evaluation/tick-task-detail?job_id=${row.id}&job_name=${row.job_name}&dispatch_type=${row.dispatch_type}`">
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
import { EvaluationTickListColumns } from './columns'
import { getEvaluationTickList, EvaluationContentOrTickOrCodeDiffListI } from '@/presenter/manager.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common'
import { EvaluationTickListRowI } from './types'

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
  columns: Columns[] = EvaluationTickListColumns
  dataSource: EvaluationTickListRowI[] = []

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
    window.localStorage.setItem('tick_select_job_type', `${val}`)
  }

  // methods
  async handleOnGetJobList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const { id, job_name, dispatch_type, city_filter } = this.filterOptions
    const res = await getEvaluationTickList({
      page,
      per_page: 10,
      dispatch_type: this.dispatch_type,
      ...(id.value ? { id: id.value } : {}),
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
    this.dataSource = this.parseDataSource(data_list)
  }
  parseDataSource(data: EvaluationContentOrTickOrCodeDiffListI[]): EvaluationTickListRowI[] {
    return data.map((item) => {
      const {
        id, job_name, create_time, case_count, city_filter,
        deadline, description, complete_count, dispatch_type
      } = item
      return {
        id,
        job_name,
        create_time,
        city: city_filter,
        nums: `${complete_count} / ${case_count}`,
        deadline_time: deadline,
        desc_of_evaluation: description,
        dispatch_type
      }
    })
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.job_name.value = ''
    this.filterOptions.city_filter.value = ''
    this.handleOnGetJobList(1)
  }

  // hooks
  mounted() {
    const select_job_type = window.localStorage.getItem('tick_select_job_type')
    if (select_job_type) {
      this.dispatch_type = +select_job_type
    }
    this.handleOnGetJobList(1)
  }
}
</script>

<style lang="less" scoped>
.table-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  .table-search-left, .table-search-right {
    display: flex;
    align-items: center;
    .label {
      padding-right: 12px;
    }
  }
}
</style>
