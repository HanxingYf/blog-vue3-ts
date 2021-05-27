<template>
  <div class='create-task'>
    <NaviTitle :navi-title="[{ name: '创建任务' }]"/>
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
        <!-- <template slot-scope="{ row, index }" slot="progress">
          <Progress :percent="+row.progress" :status="row.status === 'Running' ? 'active' : 'normal'"></Progress>
        </template> -->
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

<script lang='ts'>
import { Component, Prop, Vue, Emit } from 'vue-property-decorator'
import NaviTitle from '@/components/dumb/N-navi-title.vue'
import NFilter from '@/components/dumb/N-filter.vue'
import { FilterConfigI } from '@/components/dumb/types';
import { BaseConfigI } from '@/models/distribute_config';
import { columns } from './columns'
import * as lanelineMachine from '@/models/machine/laneline'
import { UserInfoI } from '@/models/common';

@Component({ components: { NaviTitle, NFilter } })
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
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }

  async onSubmit() {
    const { city, task_name, num } = this.filterOptions
    this.loading = true
    const { created, msg } = await lanelineMachine.createTask({
      city_list: city.value,
      creator: this.userInfo.username,
      task_name: task_name.value,
      num: num.value
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
    const res = await lanelineMachine.getTasksByStatus('Running', {
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
