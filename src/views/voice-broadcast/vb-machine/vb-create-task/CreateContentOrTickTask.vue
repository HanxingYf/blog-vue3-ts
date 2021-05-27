<template>
  <div class="create-content-task">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="onSubmit" 
      :loading="loading" 
      submit-text="新增任务"
      :has-cancel="false"/>
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
        <template slot-scope="{ row, index }" slot="progress">
          <Progress :percent="+row.progress" :status="row.status === 'Running' ? 'active' : 'normal'"></Progress>
        </template>
      </Table>
      <div class="table-page">
        <Page
          :total="total" 
          :current="cur_page_num" 
          @on-change="handleOnPageChange" 
          show-total 
          show-elevator/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { ContentRunningTaskListColumns, TickRunningTaskListColumns } from './columns'
import { Columns } from '@/types'
import { createContentTask, createTickTask, getContentTasks, getTickTasks, ContentAndHotCodeTaskRunningListResI, TickTaskRunningListResI } from '@/presenter/machine.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common';

@Component({
  components: {
    NFilter
  }
})
export default class CreateContentOrTickTask extends Vue {
  @Prop({ type: String, default: 'content' }) readonly taskType!: 'content' | 'tick'
  filterOptions: { [propName: string]: FilterConfigI } = {
    city: {
      type: 'select-multi',
      label: '城市',
      value: [],
      options: this.city_list,
      placeholder: '选择城市',
      style: { width: '150px' },
      validate: () => {
        return this.filterOptions.city.value.length ? '' : '请选择城市'
      }
    },
    ng_service: {
      type: 'input-select',
      label: 'NG服务',
      value: '10.89.123.12:10100',
      value2: '10.89.123.12:10100',
      disabled: true,
      options: this.navi_ng,
      placeholder: 'NG服务ip+port',
      style: { width: '200px' },
      validate: () => {
        return `${this.filterOptions.ng_service.value}` ? '' : '请填写NG服务'
      }
    },
    min_link_level: {
      type: 'select',
      label: '最低道路等级限制',
      value: 8,
      options: this.road_level,
      placeholder: '请选择',
      hide: !this.isContentTask,
      style: { width: '70px' },
      validate: () => {
        return `${this.filterOptions.min_link_level.value}` ? '' : '请选择最低道路等级限制'
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
    code_num: {
      type: 'input-slider-number',
      label: 'Code数量',
      value: 1,
      hide: !this.isContentTask,
      placeholder: '',
      style: { width: '100px' },
      validate: () => {
        return `${this.filterOptions.code_num.value}` ? '' : '请填写Code数量'
      }
    }
  }
  list: any[] = []
  columns: Columns[] = this.isContentTask ? ContentRunningTaskListColumns : TickRunningTaskListColumns
  dataSource: any[] = []
  total: number = 0 // 总数
  cur_page_num: number = 1 // 当前页码
  loading: boolean = false

  timer: any = null

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get city_list() {
    return this.baseConfig.city_list
  }
  get navi_ng() {
    return this.baseConfig.navi_ng
  }
  get road_level() {
    return this.baseConfig.road_level
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_new() {
    return this.flags.some((f) => f.name.includes('nc_task_new'))
  }
  get isContentTask() {
    return this.taskType === 'content'
  }

  @Watch('filterOptions.ng_service.value2')
  onNgServiceChange(val: string) {
    if (val !== 'custom') {
      this.filterOptions.ng_service.disabled = true
      this.filterOptions.ng_service.value = val
    } else {
      this.filterOptions.ng_service.disabled = false
      this.filterOptions.ng_service.value = ''
    }
  }

  // methods
  async onSubmit() {
    if (!this.nc_task_new) {
      this.$Message.warning('无权限')
      return
    }
    const { city, task_name, code_num, ng_service, min_link_level } = this.filterOptions
    this.loading = true
    const { created, msg } = this.isContentTask ? await createContentTask({
      city_id: city.value,
      code_num: code_num.value,
      ng: ng_service.value,
      task_tag: task_name.value,
      max_wei: min_link_level.value
    }) : await createTickTask({
      city_id: city.value,
      ng: ng_service.value,
      task_tag: task_name.value,
    })
    this.loading = false
    if (created) {
      this.$Message.success(`创建成功, ${msg}`)
      this.filterOptions.city.value = []
      this.filterOptions.task_name.value = ''
    } else {
      this.$Message.error(`创建失败, ${msg}`)
    }
    // 定时器不在运行时，重新启动定时器
    this.init()
  }
  async handleOnGetRunningTasks(page: number) {
    if (this.isContentTask) {
      const res = await getContentTasks({ proc: 'running' })
      if (!res) {
        this.$Message.error('请求失败')
        return
      }
      const { codeDiffTasks, count } = res
      this.list = this.parseContentDataSource(codeDiffTasks)
      this.total = count
      this.cur_page_num = 1
      this.dataSource = this.list.slice(0, 10)
    } else {
      const res = await getTickTasks({
        page,
        per_page: 10,
        progress: 'Running'
      })
      if (!res) {
        this.$Message.error('请求失败')
        return
      }
      const { cur_page_num, total_num, data_list } = res
      this.cur_page_num = cur_page_num
      this.total = total_num
      this.dataSource = this.parseTickDataSource(data_list)
    }
  }
  parseContentDataSource(data: ContentAndHotCodeTaskRunningListResI[]) {
    return data.map((item) => {
      const { id, taskid, createtime, city, maxweight, creator, progress, completeCodeNum, codenum } = item
      return {
        id,
        task_name: taskid,
        create_time: createtime.replace('T', ' ').replace('+08:00', ''),
        city_name: city,
        max_weight: maxweight,
        creator,
        status: progress,
        progress: ((completeCodeNum / codenum) * 100).toFixed(2)
      }
    })
  }
  parseTickDataSource(data: TickTaskRunningListResI[]) {
    return data.map((item) => {
      const { id, task_name, create_time, city_name, creator, progress, total_num, num } = item
      return {
        id,
        task_name,
        create_time,
        city_name,
        creator,
        status: progress,
        progress: total_num && ((num / total_num) * 100).toFixed(2)
      }
    })
  }
  handleOnPageChange(page: number) {
    this.cur_page_num = page
    if (this.isContentTask) {
      this.dataSource = this.list.slice((page - 1) * 10, page * 10)
    } else {
      this.handleOnGetRunningTasks(page)
    }
  }
  init() {
    this.timer = setInterval(async () => {
      await this.handleOnGetRunningTasks(this.cur_page_num)
      if (!this.dataSource.length) {
        clearInterval(this.timer)
      }
    }, 3000)
  }

  async mounted() {
    await this.handleOnGetRunningTasks(1)
    this.init()
  }
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>
