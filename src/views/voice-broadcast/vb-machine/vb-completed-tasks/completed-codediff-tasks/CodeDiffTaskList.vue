<template>
  <Layout>
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnPullCodeDiffTaskList(1)" 
      :loading="loading" 
      @on-cancel="handleOnReset"
    />
    <div class="table-wrapper">
      <Table :loading="loading" :columns="columns" :data="dataSource" size="small" border>
        <template slot-scope="{ row, index }" slot="action">
          <div class="action-btn-group">
            <Button size="small" style="font-size: 12px;" type="info" :disabled="!nc_task_to_job" @click="handleOnDistribute(row)">下发</Button>
            <Button
              style="font-size: 12px;"
              size="small"
              type="primary"
              :disabled="!nc_task_load"
              :to="`/voice-broadcast/completed-tasks/codediff-task-detail?task_id=${row.id}&task_name=${row.task_name}&task_num=${row.num}`">
              详情
            </Button>
            <Poptip transfer word-wrap confirm title="确认删除此任务吗" placement="top" @on-ok="handleOnDeleteCodeDiffTask(row, index)">
              <Button size="small" style="font-size: 12px;" type="error" :loading="row.loading" :disabled="!nc_task_delete">删除</Button>
            </Poptip>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="time">
          <p>{{ row.create_time.split(' ')[0] }}</p>
          <p>{{ row.create_time.split(' ')[1] }}</p>
        </template>
      </Table>
      <div class="table-page">
        <Page :total="total" :current="curPageNum" show-total show-elevator @on-change="handleOnPullCodeDiffTaskList"/>
      </div>
      <CodeDiffDeliverModal
        :visible="isModalOpen"
        :cur-data-row="curDataRow"
        @on-close="isModalOpen = false"/>
    </div>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import CodeDiffDeliverModal from './CodeDiffDeliverModal.vue'
import { CodeDiffTaskListColumns } from './columns'
import { Columns } from '@/types'
import { getCodeDiffTasks, deleteCodeDiffTask, CodeDiffTaskRunningListResI } from '@/presenter/machine.pre'
import { getUsersByRole, UserInfoI } from '@/presenter/common.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types';
import NFilter from '@/components/dumb/N-filter.vue'

@Component({
  components: {
    NFilter,
    CodeDiffDeliverModal
  }
})
export default class CodeDiffTaskList extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'ID精确匹配'
    },
    task_name: {
      type: 'input',
      label: '任务名称',
      value: '',
      placeholder: '任务名称模糊匹配'
    },
    city: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配'
    },
    creator: {
      type: 'input',
      label: '创建者',
      value: '',
      placeholder: '创建者模糊匹配'
    },
    map_version: {
      type: 'input',
      label: '路网版本',
      value: '',
      placeholder: '路网版本模糊匹配'
    },
    data_version: {
      type: 'input',
      label: '数据版本',
      value: '',
      placeholder: '数据版本模糊匹配'
    }
  }
  columns: Columns[] = CodeDiffTaskListColumns
  dataSource: CodeDiffTaskRunningListResI[] = []
  loading: boolean = false
  total: number = 0
  curPageNum: number = 1

  curDataRow: CodeDiffTaskRunningListResI | null = null
  isModalOpen: boolean = false

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_load() {
    return this.flags.some((f) => f.name.includes('nc_task_load'))
  }
  get nc_task_delete() {
    return this.flags.some((f) => f.name.includes('nc_task_delete'))
  }
  get nc_task_to_job() {
    return this.flags.some((f) => f.name.includes('nc_task_to_job'))
  }
  get city_list() {
    return this.baseConfig.city_list
  }

  async handleOnPullCodeDiffTaskList(page: number) {
    this.curPageNum = page
    this.loading = true
    const { id, city, creator, task_name, data_version, map_version  } = this.filterOptions
    const res = await getCodeDiffTasks({
      page: this.curPageNum,
      per_page: 10,
      progress: 'Completed',
      ...(id.value ? { id: id.value } : {}),
      ...(city.value ? { city: city.value } : {}),
      ...(creator.value ? { creator: creator.value } : {}),
      ...(task_name.value ? { task_name: task_name.value } : {}),
      ...(data_version.value ? { data_version: data_version.value } : {}),
      ...(map_version.value ? { map_version: map_version.value } : {})
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { cur_page_num, data_list, total_num } = res
    this.dataSource = (data_list || []).map((d) => {
      const { structure } = d
      let city = ''
      try {
        const { City, DiffIndicator, DiffType, inLinkLevel, outLinkLevel } = JSON.parse(structure)
        city = City.join(',')
      } catch (error) {
        console.error('解析structure失败', structure)
      }
      return {
        ...d,
        cities: city
      }
    })
    this.total = total_num
  }
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.city.value = ''
    this.filterOptions.creator.value = ''
    this.filterOptions.task_name.value = ''
    this.filterOptions.map_version.value = ''
    this.filterOptions.data_version.value = ''
    this.handleOnPullCodeDiffTaskList(1)
  }
  async handleOnDeleteCodeDiffTask(row: CodeDiffTaskRunningListResI, index: number) {
    if (!this.nc_task_delete) {
      this.$Message.warning('暂无权限')
      return
    }
    this.$set(this.dataSource[index], 'loading', true)
    const { deleted, msg } = await deleteCodeDiffTask(`${row.id}`)
    this.$set(this.dataSource[index], 'loading', true)
    if (deleted) {
      this.$Message.success(`删除成功, ${msg}`)
      this.handleOnPullCodeDiffTaskList(1)
    } else {
      this.$Message.error(`删除失败, ${msg}`)
    }
  }
  handleOnDistribute(row: CodeDiffTaskRunningListResI) {
    if (!this.nc_task_to_job) {
      this.$Message.warning('暂无权限')
      return
    }
    this.curDataRow = row
    this.isModalOpen = true
  }
  async mounted() {
    this.handleOnPullCodeDiffTaskList(1)
  }
}
</script>