<template>
  <Layout class="task-detail">
    <template v-if="nc_task_load">
      <div class="task-name">任务名称：{{ query.task_name }}</div>
      <NFilter
        :configs="filterOptions"
        @on-submit="pullTaskList(1)"
        :loading="loading"
        @on-cancel="handleOnReset"
      />
      <!-- 高级筛选 -->
      <HighFilterRule
        @onSendCustomFilterVal="onSendCustomFilterVal"
        type="code"
      />
      <div class="table-wrapper">
        <div class="table-search task-table-search">
          <div class="numbers">
            命中数量：{{ total }}； 总量：{{ query.task_num }}； 占比：{{
              `${((total / query.task_num) * 100).toFixed(2)}%`
            }}
          </div>
        </div>
        <Table
          :loading="loading"
          :columns="columns"
          :data="dataSource"
          size="small"
          border
        >
          <template slot-scope="{ row, index }" slot="action">
            <Button
              size="small"
              style="font-size: 12px"
              type="info"
              :disabled="curIndex === index"
              @click="handleOnViewCase(row, index)"
              >在地图中查看</Button
            >
          </template>
        </Table>
        <div class="table-page">
          <Page
            :total="total"
            @on-change="pullTaskList"
            show-total
            :current.sync="cur_page_num"
            show-elevator
          />
        </div>
      </div>
      <div class="action-btns">
        <ButtonGroup>
          <Button
            :loading="loading"
            type="primary"
            @click="onPrevOrNext(false)"
            :disabled="disabledPrev"
          >
            <Icon type="ios-arrow-back" />
            上一个
          </Button>
          <Button type="primary">{{
            dataSource[curIndex] && dataSource[curIndex].id
          }}</Button>
          <Button
            :loading="loading"
            type="primary"
            @click="onPrevOrNext(true)"
            :disabled="disabledNext"
          >
            下一个
            <Icon type="ios-arrow-forward" />
          </Button>
        </ButtonGroup>
      </div>
      <div class="map-wrapper">
        <PreviewWithMap :geojsons="geojsons" :tts="tts" :drawCode="true" :layerItemsForContentAndTick="layerItemsForContentAndTick"/>
      </div>
    </template>
    <template v-else>
      <div class="no-permission">无此页面权限</div>
    </template>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { ContentAndTickTaskDetailColumns } from './columns'
import PreviewWithMap from '@/components/smart/PreviewWithMap.vue'
import { GetMapT } from '@/components/dumb/types'
import { SelectItem, Columns } from '@/types'
import { getContentAndTickTaskDetail, ContentAndTickTaskDetailResI } from '@/presenter/machine.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole, pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import HighFilterRule from '@/components/smart/HighFilterRule.vue'
import { getEsiweiMapDir } from '@/utils';
import { ContentAndTickLayerItemsI } from '@/views/voice-broadcast/vb-manager/vb-job-evaluation/vb-job-evaluation-tick/tick/types'
import { State } from 'vuex-class'

@Component({ components: { NFilter, PreviewWithMap, HighFilterRule } })
export default class ContentAndTickTaskDetail extends Vue {
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]

  // 表格相关
  columns: Columns[] = ContentAndTickTaskDetailColumns
  dataSource: ContentAndTickTaskDetailResI[] = []
  cur_page_num: number = 1 // 当前页
  total_pages: number = 0 // 总页数
  total: number = 0 // 筛选得到的总数量
  loading: boolean = false

  curDataRow: ContentAndTickTaskDetailResI | null = null
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    case_id: {
      type: 'input',
      label: 'CaseID',
      value: '',
      placeholder: 'CaseID精确匹配'
    },
    original_tts: {
      type: 'input',
      label: '线上版本播报',
      value: '',
      placeholder: '线上版本播报模糊匹配'
      // options: this.code_list,
    },
    new_tts: {
      type: 'input',
      label: '新策略版本播报',
      value: '',
      placeholder: '新策略版本播报模糊匹配'
      // options: [],  // 待写
    }
  }
  customFilter: string = ''
  // 地图部分
  geojsons: string[] = ['', '']
  tts: string[] = ['', '']
  curIndex: number = -1
  new_code_list = []

  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get code_list() {
    return this.baseConfig.code_list
  }
  get query() {
    const query = this.$route.query
    const { task_id, task_name, task_num } = query
    return {
      task_id: +task_id,
      task_name,
      task_num: +task_num
    }
  }
  get navi_api() {
    return this.baseConfig.navi_api
  }
  get flags() {
    return this.userInfo.flags
  }
  get nc_task_load() {
    return this.flags.some((f) => f.name.includes('nc_task_load'))
  }
  get disabledPrev() {
    // 处于第一页且第一个 或 初始状态下
    return (this.cur_page_num === 1 && this.curIndex === 0) || this.curIndex === -1 || !this.dataSource.length
  }
  get disabledNext() {
    // 处于最后一页最后一个
    return this.cur_page_num === this.total_pages && this.curIndex === this.dataSource.length - 1 || !this.dataSource.length
  }
  get layerItemsForContentAndTick(): ContentAndTickLayerItemsI | null {
    if (!this.curDataRow) {
      return null
    }
    const { new_json, original_json } = this.curDataRow
    return {
      original_json,
      new_json
    }
  }

  async pullTaskList(page: number, resetView: boolean = true) {
    if (!this.nc_task_load) {
      this.$Message.warning('你无权限')
      return
    }
    if (resetView) {
      this.resetMapView()
    }
    const {
      case_id, original_tts, new_tts
    } = this.filterOptions
    this.cur_page_num = page
    this.loading = true
    const { task_id } = this.query
    const res = await getContentAndTickTaskDetail(task_id, {
      page,
      per_page: 10,
      desc: true,
      ...(case_id.value ? { case_id: case_id.value } : {}),
      ...(original_tts.value ? { original_tts: original_tts.value } : {}),
      ...(new_tts.value ? { new_tts: new_tts.value } : {}),
      // ...(original_tts.value ? { original_tts: original_tts.value } : {}),
      // ...(new_tts.value ? { new_tts: new_tts.value } : {}),
      ...(`${this.customFilter}` ? { custom_filter: this.customFilter } : {}),
    })
    this.loading = false
    if (!res) {
      return
    }
    const { cur_page_num, total_num, pages, data_list } = res
    this.total = total_num
    this.cur_page_num = cur_page_num
    this.total_pages = pages
    this.dataSource = data_list || []
  }

  async onPrevOrNext(isNext: boolean) {
    if (isNext) {
      if (this.curIndex === this.dataSource.length - 1) {
        this.cur_page_num = this.cur_page_num + 1
        await this.pullTaskList(this.cur_page_num, false)
        this.curIndex = 0
      } else {
        this.curIndex = this.curIndex + 1
      }
    } else {
      if (this.cur_page_num !== 1 && this.curIndex === 0) {
        this.cur_page_num = this.cur_page_num - 1
        await this.pullTaskList(this.cur_page_num, false)
        this.curIndex = this.dataSource.length - 1
      } else {
        this.curIndex = this.curIndex - 1
      }
    }
    this.handleOnViewCase(this.dataSource[this.curIndex], this.curIndex)
  }
  handleOnReset() {
    this.filterOptions.case_id.value = ''
    this.filterOptions.original_tts.value = ''
    this.filterOptions.new_tts.value = ''
    this.pullTaskList(1)
  }
  resetMapView() {
    this.geojsons = ['', '']
    this.tts = ['', '']
    this.curIndex = -1
  }
  async handleOnViewCase(row: ContentAndTickTaskDetailResI, index: number) {
    if (!row) {
      return
    }
    this.curDataRow = row;
    this.curIndex = index
    const { original_links, new_links, original_tts, new_tts, map_version, new_geojson, original_geojson } = row
    this.tts = [original_tts, new_tts]
    this.geojsons = [original_geojson, new_geojson]
    // this.geojsons = await Promise.all([original_links, new_links].map(async (link) => {
    //   const { linkids, esiweiMapDir } = getEsiweiMapDir(link)
    //   const geojson = await pullLinkGeojson(
    //     linkids,
    //     this.roadNetVersions
    //       .map((r) => r.version)
    //       .filter((v) => +v >= map_version) // 找出大于或等于当前路网版本的集合
    //       .reverse()
    //   )
    //   return geojson ? JSON.stringify(geojson) : ''
    // }))
  }
  onSendCustomFilterVal(val: string) {
    this.customFilter = val
  }
  // hooks
  mounted() {
    this.pullTaskList(1)
  }
}
</script>

<style lang="less" scoped>
.task-table-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  .numbers {
    font-size: 12px;
  }
}
.action-btns {
  margin-bottom: 20px;
}
.map-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 100px;
  height: 500px;
}
.input-intern {
  width: 20px;
  text-align: center;
}
</style>
