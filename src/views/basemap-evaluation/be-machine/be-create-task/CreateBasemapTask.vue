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
        <template slot-scope="{ row, index }" slot="blockIds">
          <Poptip trigger="hover" title="子块编号详情" transfer>
            <span>查看子块编号</span>
            <div slot="content" v-html="genBlocksBeauty(row.block_noes)"></div>
          </Poptip>
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
    <TileNoSelect 
      :visible="showModal" 
      @on-cancel="showModal = false" 
      :city-code="filterOptions.city.value"
      :renderHighlightBlocks="renderHighlightBlocks"
      @onGetSelectedBlocks="onGetSelectedBlocks"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { BasemapRunningTaskListColumns } from './columns'
import { Columns } from '@/types'
import NFilter from '@/components/dumb/N-filter.vue'
import TileNoSelect from '@/components/smart/TileNoSelect.vue'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { FilterConfigI } from '@/components/dumb/types'
import { UserInfoI } from '@/models/common';
import * as basemapManage from '@/models/machine/basemap'
import { BlockI } from '@/models/machine/basemap';

@Component({
  components: {
    NFilter,
    TileNoSelect
  }
})
export default class CreateBasemapTask extends Vue {
  filterOptions: { [propName: string]: FilterConfigI } = {
    city: {
      type: 'select',
      label: '城市',
      value: 1,
      options: this.city_list,
      placeholder: '选择城市',
      style: { width: '150px' },
      validate: () => {
        return this.filterOptions.city.value !== ''  ? '' : '请选择城市'
      }
    },
    block_nos: {
      type: 'input',
      label: '子块编号',
      value: '',
      onFocus: () => {
        this.onFocus()
      },
      placeholder: '子块编号',
      validate: () => {
        const v = this.filterOptions.block_nos.value
        if (!v || !JSON.parse(v).length) {
          return '请选择子块瓦片'
        } else {
          return ''
        }
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
  columns: Columns[] = BasemapRunningTaskListColumns
  dataSource: any[] = []
  total: number = 0 // 总数
  cur_page_num: number = 1 // 当前页码
  loading: boolean = false
  showModal: boolean = false

  timer: any = null

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get city_list() {
    return this.baseConfig.city_list.filter((ci) => [1, 4, 2, 10].includes(+ci.value))
  }
  get flags() {
    return this.userInfo.flags
  }
  get renderHighlightBlocks() {
    const v = this.filterOptions.block_nos.value
    const l = v ? JSON.parse(v) as BlockI[] : []
    return l
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
    const { city, task_name, block_nos } = this.filterOptions
    this.loading = true
    const { created, msg } = await basemapManage.createTask({
      city: city.value,
      task_name: task_name.value,
      blocks: block_nos.value,
      // service: service.value
    })
    this.loading = false
    if (created) {
      this.$Message.success(`创建成功, ${msg}`)
      this.filterOptions.task_name.value = ''
    } else {
      this.$Message.error(`创建失败, ${msg}`)
    }
    // 定时器不在运行时，重新启动定时器
    this.init()
  }
  async handleOnGetRunningTasks(page: number) {
    const res = await basemapManage.getTasksByStatus('Running', {
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
  init() {
    this.timer = setInterval(async () => {
      await this.handleOnGetRunningTasks(this.cur_page_num)
      if (!this.dataSource.length) {
        clearInterval(this.timer)
      }
    }, 3000)
  }
  onFocus() {
    this.showModal = true
  }
  onGetSelectedBlocks(selectedBlocks: BlockI[]) {
    this.filterOptions.block_nos.value = JSON.stringify(selectedBlocks)
  }
  genBlocksBeauty(block_noes: { BlockNos: BlockI[] }) {
    const { BlockNos } = block_noes
    return BlockNos.map((bl) => `${bl.block_no} -> ${bl.block_ids.join(',')}`).join('<br />')
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
.map-container {
  width: 100%;
  height: 500px;
}
</style>

