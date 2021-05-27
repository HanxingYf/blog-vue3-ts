<template>
  <div class='create-task'>
    <p style="color: red; margin-bottom: 10px">{{ remind }}</p>
    <NFilter 
      :configs="filterOptions" 
      @on-submit="onSubmit" 
      :loading="loading" 
      submit-text="新增任务"
      :has-cancel="false"
    />
    <div class="table-wrapper">
      <Table :columns="columns" :data="dataSource" border size="small">
        <template
          slot-scope="{ row, index }"
          slot="status">
          {{ row.status }}
        </template>
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="task_type">
          {{ mapTaskType[+row.task_type] || row.task_type }}
        </template>
        <template slot-scope="{ row, index }" slot="progress">
          <Progress :stroke-width="20" :percent="+(row.completed_num / row.num * 100).toFixed(2)" status="active" text-inside />
        </template>
      </Table>
      <div class="table-page">
        <Page
          :total="total" 
          :current="cur_page_num" 
          @on-change="handleOnPageChange" 
          show-total 
          show-elevator
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types';
import { BaseConfigI } from '@/models/distribute_config';
import { columns } from './columns'
import * as vectorMachine from '@/models/machine/vector'
import { UserInfoI } from '@/models/common'
import { parseToMapObj } from '@/utils'

@Component({ components: { NFilter } })
export default class CreateTask extends Vue {
  filterOptions: { [propName: string]: FilterConfigI} = {
    city: {
      type: 'select-multi',
      label: '城市',
      value: [],
      options: this.city_list,
      placeholder: '选择城市',
      style: { width: '150px' },
      validate: () => {
        return this.filterOptions.city.value.length  ? '' : '请选择城市'
      }
    },
    num: {
      type: 'input-slider-number',
      label: '单城数量',
      value: 1,
      placeholder: '',
      style: { width: '100px' },
      validate: () => {
        return `${this.filterOptions.num.value}` ? '' : '请填写单城数量'
      }
    },
    task_name: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称',
      style: { width: '150px' },
      validate: () => {
        return `${this.filterOptions.task_name.value}` ? '' : '请填写任务名称'
      }
    },
    task_type: {
      type: 'select',
      label: '任务类型',
      value: 0,
      options: [{ label: '与现实做对比', value: 0 }, { label: '新旧版本对比', value: 1 }]
    },
    version_a: {
      type: 'input',
      label: '矢量图接口地址(新）',
      value: '10.89.56.20:20798',
      placeholder: '矢量图接口地址(新）',
      style: { width: '150px' },
      hide: false,
      validate: () => {
        return `${this.filterOptions.version_a.value}` ? '' : '请矢量图接口地址(新）'
      }
    },
    version_b: {
      type: 'input',
      label: '对比评测接口地址(旧)',
      value: '',
      hide: true,
      placeholder: '对比评测接口地址(旧)',
      style: { width: '150px' }
    }
  }
  columns = columns
  dataSource: any[] = []
  total: number = 0 // 总数
  cur_page_num: number = 1 // 当前页码
  loading: boolean = false
  showModal: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get city_list() {
    return this.baseConfig.city_list
  }
  get remind() {
    return this.baseConfig.enlarge_map_task_remind
  }
  get mapTaskType() {
    return parseToMapObj(this.baseConfig.enlarge_map_job_info)
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }

  @Watch('filterOptions.task_type.value')
  onTaskTypeChange(val: number) {
    this.filterOptions.version_b.hide = !val
  }

  async onSubmit() {
    const { city, task_name, num, version_a, version_b } = this.filterOptions
    this.loading = true
    const { created, msg } = await vectorMachine.createTask({
      city_list: city.value,
      creator: this.userInfo.username,
      task_name: task_name.value,
      num: num.value,
      version_a: version_a.value,
      version_b: version_b.value
    })
    this.loading = false
    if (created) {
      this.$Message.success(`创建成功, ${msg}`)
      this.filterOptions.task_name.value = ''
      this.handleOnGetRunningTasks(1)
    } else {
      this.$Message.error(`创建失败, ${msg}`)
    }
  }
  async handleOnGetRunningTasks(page: number) {
    const res = await vectorMachine.getTasksByStatus('Running', {
      page,
      per_page: 10
    })
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { data_list, cur_page_num, total_num } = res
    this.dataSource = data_list
    this.total = total_num
    this.cur_page_num = cur_page_num
  }
  handleOnPageChange(page: number) {
    this.cur_page_num = page
    this.handleOnGetRunningTasks(page)
  }
  mounted() {
    this.handleOnGetRunningTasks(1)
  }
}
</script>

<style scoped lang='less'>
.wrapper {
  padding: 10px;
}
</style>
