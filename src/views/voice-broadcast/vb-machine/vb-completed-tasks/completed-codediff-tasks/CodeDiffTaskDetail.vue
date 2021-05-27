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
      <HighFilterRule @onSendCustomFilterVal="onSendCustomFilterVal" type="self"/>
      <div class="table-wrapper">
        <div class="table-search task-table-search">
          <div class="numbers">
            命中数量：{{ total }}； 总量：{{ query.task_num }}； 占比：{{ `${((total / query.task_num) * 100).toFixed(2)}%` }}
          </div>
        </div>
        <Table
          :loading="loading" 
          :columns="columns"
          :data="dataSource" 
          size="small"
          border>
          <template slot-scope="{ row, index }" slot="action">
            <Button size="small" style="font-size: 12px;" type="info" :disabled="curIndex === index" @click="handleOnViewCase(row, index)">在地图中查看</Button>
          </template>
        </Table>
        <div class="table-page">
          <Page 
            :total="total" 
            @on-change="pullTaskList" 
            show-total
            :current.sync="cur_page_num"
            show-elevator/>
        </div>
      </div>
      <div class="action-btns">
        <ButtonGroup>
          <Button :loading="loading" type="primary" @click="onPrevOrNext(false)" :disabled="disabledPrev">
              <Icon type="ios-arrow-back" />
              上一个
          </Button>
          <Button type="primary">{{ dataSource[curIndex] && dataSource[curIndex].id }}</Button>
          <Button :loading="loading" type="primary" @click="onPrevOrNext(true)" :disabled="disabledNext">
              下一个
              <Icon type="ios-arrow-forward" />
          </Button>
        </ButtonGroup>
      </div>
      <div class="map-wrapper">
        <PreviewWithMap :geojsons="geojsons" :esiweiMapDir="esiweiMapDir" >
          <template slot="label-mark">
            <CodeDiffIndicator :curDataRow="curDataRow" />
          </template>
        </PreviewWithMap>
      </div>
    </template>
    <template v-else>
      <div class="no-permission">
        无此页面权限
      </div>
    </template>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { CodeDiffTaskDetailColumns } from './columns'
import { State } from 'vuex-class'
import PreviewWithMap from '@/components/smart/PreviewWithMap.vue'
import HighFilterRule from '@/components/smart/HighFilterRule.vue'
import {
  getContentAndHotCodeTaskDetail, getCodeDiffTaskDetail, CodeDiffTaskDetailListResI
} from '@/presenter/machine.pre'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole, pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'
import { FilterConfigI } from '@/components/dumb/types'
import NFilter from '@/components/dumb/N-filter.vue'
import CodeDiffIndicator from '@/components/smart/CodeDiffIndicator.vue'
import { getEsiweiMapDir } from '@/utils';

@Component({
  components: { NFilter, HighFilterRule, PreviewWithMap, CodeDiffIndicator }
})
export default class CodeDiffTaskDetail extends Vue {
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  // 表格相关
  columns = CodeDiffTaskDetailColumns
  dataSource: CodeDiffTaskDetailListResI[] = []
  cur_page_num: number = 1 // 当前页
  num_per_page: number = 10 // 每页数量
  total_pages: number = 0 // 总页数
  total: number = 0 // 筛选得到的总数量
  loading: boolean = false

  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    id: {
      type: 'input',
      label: 'ID',
      value: '',
      placeholder: 'id精确匹配'
    },
    city: {
      type: 'input',
      label: '城市',
      value: '',
      placeholder: '城市模糊匹配'
    },
    diff_type: {
      type: 'input',
      label: 'diff类型',
      value: '',
      placeholder: 'diff类型'
    },
    inlink_level: {
      type: 'input',
      label: 'inlink_level',
      value: '',
      placeholder: 'inlink_level精确匹配'
    },
    outlink_level: {
      type: 'input',
      label: 'outlink_level',
      value: '',
      placeholder: 'outlink_level精确匹配'
    },
    ori_code: {
      type: 'input',
      label: '线上版本code',
      value: '',
      placeholder: '线上版本code模糊匹配'
    },
    ori_assi_code: {
      type: 'input',
      label: '线上版本辅助动作',
      value: '',
      placeholder: '线上版本辅助动作模糊匹配'
    },
    final_code: {
      type: 'input',
      label: '新策略版本code',
      value: '',
      placeholder: '新策略版本code模糊匹配'
    },
    final_assi_code: {
      type: 'input',
      label: '新版本策略辅助动作',
      value: '',
      placeholder: '新版本策略辅助动作模糊匹配'
    },
    link_list: {
      type: 'input',
      label: 'link序列',
      value: '',
      placeholder: 'link序列模糊匹配'
    }
  }
  customFilter: string = ''

  geojsons: string[] = ['']
  curIndex: number = -1
  curDataRow: CodeDiffTaskDetailListResI | null = null
  esiweiMapDir: { [propName: string]: number } | null = null

  get query() {
    const query = this.$route.query
    const { task_id, task_name, task_num } = query
    return {
      task_id: +task_id,
      task_name,
      task_num: +task_num
    }
  }
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
  get disabledPrev() {
    // 处于第一页且第一个 或 初始状态下
    return (this.cur_page_num === 1 && this.curIndex === 0) || this.curIndex === -1 || !this.dataSource.length
  }
  get disabledNext() {
    // 处于最后一页最后一个
    return this.cur_page_num === this.total_pages && this.curIndex === this.dataSource.length - 1 || !this.dataSource.length
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
      id, city, diff_type, inlink_level, outlink_level, final_assi_code,
      final_code, ori_code, ori_assi_code, link_list
    } = this.filterOptions
    this.cur_page_num = page
    this.loading = true
    const { task_id } = this.query
    const res = await getCodeDiffTaskDetail(task_id, {
      page,
      per_page: 10,
      id: id.value,
      city: city.value,
      diff_type: diff_type.value,
      inlink_level: inlink_level.value,
      outlink_level: outlink_level.value,
      final_assi_code: final_assi_code.value,
      final_code: final_code.value,
      ori_code: ori_code.value,
      ori_assi_code: ori_assi_code.value,
      link_list: link_list.value,
      ...(`${this.customFilter}` ? { custom_filter: this.customFilter } : {})
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
  handleOnReset() {
    this.filterOptions.id.value = ''
    this.filterOptions.city.value = ''
    this.filterOptions.diff_type.value = ''
    this.filterOptions.inlink_level.value = ''
    this.filterOptions.outlink_level.value = ''
    this.filterOptions.final_code.value = ''
    this.filterOptions.final_assi_code.value = ''
    this.filterOptions.ori_code.value = ''
    this.filterOptions.ori_assi_code.value = ''
    this.filterOptions.link_list.value = ''
    this.pullTaskList(1)
  }
  resetMapView() {
    this.geojsons = ['']
    this.curIndex = -1
  }
  async handleOnViewCase(row: CodeDiffTaskDetailListResI, index: number) {
    if (!row) {
      return
    }
    this.curIndex = index
    this.curDataRow = row
    const { link_list, map_version } = row
    const { linkids, esiweiMapDir } = getEsiweiMapDir(link_list)
    const geojson = await pullLinkGeojson(
      linkids,
      this.roadNetVersions
        .map((r) => r.version)
        .filter((v) => +v >= +map_version) // 找出大于或等于当前路网版本的集合
        .reverse()
    )
    this.geojsons = [geojson ? JSON.stringify(geojson) : '']
    this.esiweiMapDir = esiweiMapDir
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
</style>
