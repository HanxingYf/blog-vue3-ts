<template>
  <div class="create-codediff-task">
    <p class="remind">注意!: {{ self_task_remind }}</p>
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
import { CodeDiffRunningTaskListColumns } from './columns'
import { Columns, ValueConfig } from '@/types'
import {
  createCodeDiffTask, getCodeDiffTasks, getRoadNetMapVersions,
  CodeDiffTaskRunningListResI
} from '@/presenter/machine.pre'
import NFilter from '@/components/dumb/N-filter.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI, RoadVersionI } from '@/models/common';

@Component({
  components: {
    NFilter
  }
})
export default class CreateCodeDiffTask extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    map_version: {
      type: 'select',
      label: '路网版本',
      value: '',
      options: this.mapVersions,
      placeholder: '请选择',
      style: { width: '150px' },
      validate: () => {
        return `${this.filterOptions.map_version.value}` ? '' : '请选择路网版本'
      }
    },
    data_version: {
      type: 'input',
      label: '数据版本',
      value: '',
      placeholder: '请输入数据版本',
      style: { width: '150px' },
      validate: () => {
        const { data_version } = this.filterOptions
        const { value } = data_version
        return value && value.length < 32 ? '' : '最长32个字符'
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
    }
  }
  list: any[] = []
  columns: Columns[] = CodeDiffRunningTaskListColumns
  dataSource: any[] = []
  total: number = 0 // 总数
  cur_page_num: number = 1 // 当前页码
  loading: boolean = false

  timer: any = null

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get self_task_remind() {
    return this.baseConfig.self_task_remind
  }
  get mapVersions(): ValueConfig[] {
    const versions: RoadVersionI[] = this.$store.state.roadNetVersions
    return versions.map((v) => ({ label: v.version, value: v.version }))
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_new() {
    return this.flags.some((f) => f.name.includes('nc_task_new'))
  }

  // methods
  async onSubmit() {
    if (!this.nc_task_new) {
      this.$Message.warning('无权限')
      return
    }
    const { task_name, data_version, map_version } = this.filterOptions
    this.loading = true
    const { created, msg } = await createCodeDiffTask({
      data_version: data_version.value,
      map_version: map_version.value,
      task_name: task_name.value
    })
    this.loading = false
    if (created) {
      this.$Message.success(`创建成功, ${msg}`)
      this.filterOptions.task_name.value = ''
      this.filterOptions.data_version.value = ''
      this.filterOptions.map_version.value = ''
      this.init()
    } else {
      this.$Message.error(`创建失败, ${msg}`)
    }
  }
  async handleOnGetRunningTasks(page: number) {
    const res = await getCodeDiffTasks({
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
    this.dataSource = this.parseDataSource(data_list)
  }
  parseDataSource(data: CodeDiffTaskRunningListResI[]) {
    return data.map((item) => {
      const { id, create_time, task_name, cities, creator, map_version, data_version, progress, num } = item
      return {
        id,
        task_name,
        create_time,
        city_name: cities,
        map_version,
        data_version,
        creator,
        status: progress,
        progress: num // total_num && ((num / total_num) * 100).toFixed(2)
      }
    })
  }
  handleOnPageChange(page: number) {
    this.cur_page_num = page
    this.handleOnGetRunningTasks(page)
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

<style lang="less" scoped>
.remind {
  padding: 10px 0;
  color: red;
}
</style>

