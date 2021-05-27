<template>
  <div class="create-content-task">
    <NFilter
      :configs="filterOptions"
      :loading="false"
      @on-submit="onSubmit"
      submit-text="新增任务"
      :has-cancel="false"
    />
    <div class="table-wrapper">
      <Table :columns="columns" :data="dataSource" border size="small">
        <template slot-scope="{ row, index }" slot="create_time">
          <p>{{ row.create_time.split(" ")[0] }}</p>
          <p>{{ row.create_time.split(" ")[1] }}</p>
        </template>
        <template slot-scope="{ row, index }" slot="progress">
          <Progress
            :percent="+row.progress"
            :status="row.status === 'Running' ? 'active' : 'normal'"
          ></Progress>
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

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import NFilter from '@/components/dumb/N-filter.vue';
import { FilterConfigI } from '@/components/dumb/types'
import { ContentAndTickRunningTaskListColumns } from './columns';
import { Columns } from '@/types';
import { UserInfoI } from '@/models/common'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { createContentAndTickTask, getContentAndTickTask, ContentAndTickTaskRunningListResI } from '@/presenter/machine.pre'



@Component({
  components: {
    NFilter,
  },
})
export default class CreateContentAndTickTask extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    original_host: {
      type: 'input',
      label: '线上服务',
      value: '',
      placeholder: '线上服务',
      validate: () => {
        return this.filterOptions.original_host.value.length ? '' : '请填写original_host'
      }
    },
    new_host: {
      type: 'input',
      label: '新策略服务',
      value: '',
      placeholder: '新策略服务',
      validate: () => {
        return this.filterOptions.new_host.value.length ? '' : '请填写new_host'
      }
    },
    jenkins_url: {
      type: 'input',
      label: 'jenkins来源',
      value: '',
      placeholder: 'jenkins来源',
      validate: () => {
        return this.filterOptions.jenkins_url.value.length ? '' : 'jenkins_url'
      }
    },
    task_name: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称',
      validate: () => {
        return this.filterOptions.task_name.value.length ? '' : '请填写任务名称'
      }
    },
    num: {
      type: 'input',
      label: '数量',
      value: '',
      placeholder: '输入数量',
      validate: () => {
        return this.filterOptions.num.value.length ? '' : '请填写任务数量'
      }
    },
  };

  // 表格相关
  columns: Columns[] = ContentAndTickRunningTaskListColumns;
  dataSource: any[] = [];
  total: number = 0 // 总数
  cur_page_num: number = 1 // 当前页码
  loading: boolean = false
  jenkins_url: string = ''
  timer: any = null
  creator: string = this.userInfo.username
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get city_list() {
    return this.baseConfig.city_list
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
    const { task_name, num, original_host, new_host, city, jenkins_url } = this.filterOptions
    this.loading = true
    const { created, msg } = await createContentAndTickTask({
      task_name: task_name.value,
      creator: this.creator,
      num: +num.value,
      jenkins_url: jenkins_url.value,
      original_host: original_host.value,
      new_host: new_host.value,
    })
    this.loading = false
    if (created) {
      this.$Message.success(`创建成功, ${msg}`)
      this.filterOptions.task_name.value = ''
      this.filterOptions.original_host.value = ''
      this.filterOptions.new_host.value = ''
      this.filterOptions.jenkins_url.value = ''
      this.filterOptions.num.value = ''
    } else {
      this.$Message.error(`创建失败, ${msg}`)
    }
    // 定时器不在运行时，重新启动定时器
    this.init()
  }
  handleOnPageChange(page: number) {
    this.cur_page_num = page
    this.handleOnGetRunningTasks(page)
  }

  async handleOnGetRunningTasks(page: number) {
    const res = await getContentAndTickTask({
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
    this.dataSource = this.parseContentAndTickDataSource(data_list)
  }
  parseContentAndTickDataSource(data: ContentAndTickTaskRunningListResI[]) {
    return data.map((item) => {
      const { id, task_name, creator, num, completed_num, create_time, update_time, progress, jenkins_url } = item
      return {
        id,
        task_name,
        creator,
        num,
        completed_num,
        create_time: create_time.replace('T', ' ').replace('+08:00', ''),
        update_time: update_time.replace('T', ' ').replace('+08:00', ''),
        status: progress,
        jenkins_url,
        progress: num == 0 ? 0 : ((completed_num / num) * 100).toFixed(2)
      }
    })
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
