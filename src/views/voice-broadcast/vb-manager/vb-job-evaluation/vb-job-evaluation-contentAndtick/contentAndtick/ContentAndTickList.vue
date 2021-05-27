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
            <Radio
              v-for="(item, index) in job_type"
              :key="index"
              :label="item.value"
              >{{ item.label }}</Radio
            >
          </RadioGroup>
        </div>
      </div>
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
          <Button
            type="primary"
            size="small"
            :to="`/voice-broadcast/task-evaluation/content-and-tick-task-detail?job_id=${row.id}&job_name=${row.job_name}&blind=${row.blind_test}&dispatch_type=${row.dispatch_type}`"
          >
            详情
          </Button>
        </template>
      </Table>
      <div class="table-page">
        <Page
          :total="total"
          :current="cur_page_num"
          show-total
          show-elevator
          @on-change="handleOnGetJobList"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Columns } from '@/types'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { EvaluationTickListColumns } from './columns'
import { EvaluationContentAndTickListRowI } from './types'
import { getEvaluationContentAndTickList, EvaluationContentAndTickListI } from '@/presenter/manager.pre'

@Component({
  components: {
    NFilter
  }
})
export default class ContentAndTickList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID筛选',
    },
    // mark_job_id: {
    //   type: 'input',
    //   label: 'mark_job_id',
    //   value: '',
    //   placeholder: 'mark_job_id筛选'
    // },
    job_name: {
      type: 'input',
      label: '评测名称',
      value: '',
      placeholder: '评测名称筛选',

    },
    // blind: {
    //   type: 'radio-group',
    //   label: '是否盲评',
    //   value: -1,
    //   options: [{ label: '不选择', value: -1 }, { label: '是', value: 1 }, { label: '否', value: 0 }],
    // }
  }

  // 分页相关
  cur_page_num: number = 1
  total: number = 0

  // 其他
  dispatch_type: number = 0 // 全部|评测|质检

  columns: Columns[] = EvaluationTickListColumns
  dataSource: any[] = []
  loading: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get job_type() {
    return this.baseConfig.job_type
  }
  @Watch('dispatch_type')
  onJobTypeChanged(val: number) {
    this.handleOnGetJobList(this.cur_page_num)
    window.localStorage.setItem('content_and_tick_select_job_type', `${val}`)
  }

  async handleOnGetJobList(page: number) {
    this.loading = true
    this.cur_page_num = page
    const { id, job_name } = this.filterOptions
    const res = await getEvaluationContentAndTickList({
      page,
      per_page: 10,
      dispatch_type: this.dispatch_type,
      ...(id.value ? { id: id.value } : {}),
      ...(job_name.value ? { job_name: job_name.value } : {})
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

  parseDataSource(data: EvaluationContentAndTickListI[]): EvaluationContentAndTickListRowI[] {
    return data.map((item) => {
      const {
        id, job_name, create_time, case_count, city_filter,
        deadline, description, complete_count, dispatch_type, blind_test
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
        blind_test
      }
    })
  }

  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.job_name.value = ''
    this.handleOnGetJobList(1)
  }



  // hooks
  mounted() {
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
  .table-search-left,
  .table-search-right {
    display: flex;
    align-items: center;
    .label {
      padding-right: 12px;
    }
  }
}
</style>