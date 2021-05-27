<template>
  <div class="task-manager-detail">
    <NFilter 
      :configs="filterOptions" 
      @on-submit="handleOnGetCaseList(1)" 
      @on-cancel="handleOnReset"
      :loading="loading"
    />
    <div class="table-wrapper">
      <div class="info">评测名称：{{ query.job_name }}</div>
      <Table 
        :columns="columns" 
        :data="dataSource" 
        border 
        ref="table" 
        :loading="loading" 
        @on-selection-change="hanleOnSelect" size="small">
        <template slot-scope="{ row, index }" slot="road_issue">
          <Tooltip transfer :content="row.road_issue_mod">
            <span>{{ row.road_issue_mod }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="arrow_issue">
          <Tooltip transfer :content="row.arrow_issue_mod">
            <span>{{ row.arrow_issue_mod }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="other_issue">
          <Tooltip transfer :content="row.other_issue_mod">
            <span>{{ row.other_issue_mod }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="beauty_road_issue">
          <Tooltip transfer :content="row.beauty_road_issue_mod">
            <span>{{ row.beauty_road_issue_mod }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="beauty_arrow_issue">
          <Tooltip transfer :content="row.beauty_arrow_issue_mod">
            <span>{{ row.beauty_arrow_issue_mod }}</span>
          </Tooltip>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Button size="small" type="primary" @click="handleOnViewCase(row, index)">查看</Button>
        </template>
      </Table>
    </div>
    <div class="footer-wrapper">
      <div class="btns-wrapper">
        <Button :loading="exportLoading" type="info" @click="handleOnExportData">导出CSV</Button>
      </div>
      <div class="page-wrapper">
        <Page 
          :total="total"
          :current="cur_page_num"
          @on-change="handleOnGetCaseList" 
          show-total 
          show-elevator/>
      </div>
    </div>
    <Modal 
      v-model="showLabelModal" 
      footer-hide 
      width="98" 
      class-name="vertical-center-modal" 
      @on-cancel="showLabelModal = false">
      <LabelModal 
        :visible="showLabelModal" 
        :geojsons="geojsons" 
        :marks="marks" 
        :esiweiMapDir="esiweiMapDir">
        <template slot="label-form">
          <LabelVectorForm 
            :cur-data-row="curDataRow" 
            :loading="submitLoading" 
            :disabled-prev-next="disabledPrevNext"
            :is-mark-job="true"
            @on-set-better-version="onSetBetterVersion"
            @on-set-editable="onSetEditable"
            @on-submit="handleOnSubmit"
            @on-pre-or-next="handleOnPreOrNext($event)"
          />
        </template>
        <template slot="label-diff">
          <VectorIndicator 
            :curDataRow="curDataRow" 
            :isMarkJob="true" 
            :betterVersion="betterVersion"
            :editable="editable"
          />
        </template>
      </LabelModal>
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import NFilter from '@/components/dumb/N-filter.vue'
import { State } from 'vuex-class'
import { FilterConfigI } from '@/components/dumb/types'
import { TaskCaseListColumns } from './columns'
import { BaseConfigI } from '@/presenter/distributeConfig.pre'
import { UserInfoI, getUsersByRole } from '@/presenter/common.pre'
import { importTruthDatabase } from '@/presenter/truth.pre'
import { ValueConfig } from '@/types';
import LabelModal from '@/components/smart/LabelModal.vue'
import LabelVectorForm from '@/components/smart/LabelVectorForm.vue'
import VectorIndicator from '@/components/smart/VectorIndicator.vue'
import * as vectorManager from '@/models/manager/vector'
import { getEsiweiMapDir, parseToMapObj } from '@/utils'
import { pullLinkGeojson, RoadVersionI } from '@/presenter/common.pre'

@Component({ components: { NFilter, LabelModal, LabelVectorForm, VectorIndicator } })
export default class TaskDetail extends Vue {
  @State('roadNetVersions') roadNetVersions!: RoadVersionI[]
  // 筛选相关
  filterOptions: { [propName: string]: FilterConfigI } = {
    enlarge_map_diff_record_id: {
      type: 'input',
      label: 'Record ID',
      value: '',
      style: { width: '100px' },
      placeholder: 'Record ID精确匹配'
    },
    better_version: {
      type: 'select',
      label: '新旧版本评价',
      value: '',
      options: this.baseConfig.enlarge_map_better_version,
      style: { width: '100px' },
      placeholder: '新旧版本评价'
    },
    should_recall: {
      type: 'select',
      label: '策略是否应召回',
      value: '',
      options: this.baseConfig.enlarge_map_should_recall,
      style: { width: '100px' },
      placeholder: '策略是否应召回'
    },
    tag: {
      type: 'select',
      label: '展示内容准确性',
      value: '',
      options: this.baseConfig.enlarge_map_tag,
      style: { width: '100px' },
      placeholder: '展示内容准确性'
    },
    show_range: {
      type: 'select',
      label: '展示范围',
      value: '',
      options: this.baseConfig.enlarge_map_show_range,
      style: { width: '100px' },
      placeholder: '展示范围'
    },
    road_issue: {
      type: 'select-multi',
      label: '展示内容道路问题',
      value: [],
      options: this.baseConfig.enlarge_map_issue_road,
      style: { width: '100px' },
      placeholder: '展示内容道路问题'
    },
    arrow_issue: {
      type: 'select-multi',
      label: '展示内容箭头问题',
      value: [],
      options: this.baseConfig.enlarge_map_issue_arrow,
      style: { width: '100px' },
      placeholder: '展示内容箭头问题'
    },
    other_issue: {
      type: 'select-multi',
      label: '展示内容其他问题',
      value: [],
      options: this.baseConfig.enlarge_map_issue_other,
      style: { width: '100px' },
      placeholder: '展示内容其他问题'
    },
    beauty: {
      type: 'select',
      label: '美观度',
      value: '',
      options: this.baseConfig.enlarge_map_beauty,
      style: { width: '100px' },
      placeholder: '美观度'
    },
    beauty_road_issue: {
      type: 'select-multi',
      label: '美观度道路问题',
      value: [],
      options: this.baseConfig.enlarge_map_beauty_road,
      style: { width: '100px' },
      placeholder: '美观度道路问题'
    },
    beauty_arrow_issue: {
      type: 'select-multi',
      label: '美观度箭头问题',
      value: [],
      options: this.baseConfig.enlarge_map_beauty_arrow,
      style: { width: '100px' },
      placeholder: '美观度箭头问题'
    },
  }
  // 表格相关
  loading: boolean = false
  columns = TaskCaseListColumns
  dataSource: vectorManager.VectorMarkedJobCaseListI[] = []
  // 翻页相关
  cur_page_num: number = 1 // 1
  total: number = 0
  total_pages: number = 0
  // 其他
  exportLoading: boolean = false
  importLoading: boolean = false
  selections: vectorManager.VectorMarkedJobCaseListI[] = []
  showLabelModal: boolean = false
  submitLoading: boolean = false
  curDataRow: vectorManager.VectorMarkedJobCaseListI | null = null
  curDataIndex: number = 0
  geojsons: string[] = ['']
  marks: string[] = ['']
  esiweiMapDir: { [propName: string]: number } | null = null
  betterVersion: number = 0
  editable: boolean = true

  get query() {
    const query = this.$route.query
    const {
      job_id, job_name, tag, show_range, road_issue, arrow_issue, other_issue,
      beauty, beauty_road_issue, beauty_arrow_issue
    } = query
    return {
      job_id: +job_id,
      job_name,
      tag: tag ? +tag : '',
      show_range: show_range ? +show_range : '',
      road_issue: road_issue ? (road_issue as string).split(',').map((s) => +s) : [],
      arrow_issue: arrow_issue ? (arrow_issue as string).split(',').map((s) => +s) : [],
      other_issue: other_issue ? (other_issue as string).split(',').map((s) => +s) : [],
      beauty: beauty ? +beauty : '',
      beauty_road_issue: beauty_road_issue ? (beauty_road_issue as string).split(',').map((s) => +s) : [],
      beauty_arrow_issue: beauty_arrow_issue ? (beauty_arrow_issue as string).split(',').map((s) => +s) : [],
    }
  }
  get userInfo(): UserInfoI {
    return this.$store.state.userInfo
  }
  get baseConfig(): BaseConfigI {
    return this.$store.state.baseConfig
  }
  get mapShouldRecall() {
    return parseToMapObj(this.baseConfig.enlarge_map_should_recall)
  }
  get mapTag() {
    return parseToMapObj(this.baseConfig.enlarge_map_tag)
  }
  get mapBetterVersion() {
    return parseToMapObj(this.baseConfig.enlarge_map_better_version)
  }
  get mapShowRange() {
    return parseToMapObj(this.baseConfig.enlarge_map_show_range)
  }
  get mapRoadIssue() {
    return parseToMapObj(this.baseConfig.enlarge_map_issue_road)
  }
  get mapArrowIssue() {
    return parseToMapObj(this.baseConfig.enlarge_map_issue_arrow)
  }
  get mapOtherIssue() {
    return parseToMapObj(this.baseConfig.enlarge_map_issue_other)
  }
  get mapBeauty() {
    return parseToMapObj(this.baseConfig.enlarge_map_beauty)
  }
  get mapBeautyRoadIssue() {
    return parseToMapObj(this.baseConfig.enlarge_map_beauty_road)
  }
  get mapBeautyArrowIssue() {
    return parseToMapObj(this.baseConfig.enlarge_map_beauty_arrow)
  }
  get disabledPrevNext() {
    return {
      prev: !(this.curDataIndex === 0 && this.cur_page_num === 1),
      next: !(this.curDataIndex === this.dataSource.length - 1 && this.cur_page_num === this.total_pages)
    }
  }

  @Watch('curDataRow')
  async onCurDataRowChanged() {
    if (this.curDataRow) {
      const { in_link, out_link, pass_link, map_version } = this.curDataRow
      const { linkids, esiweiMapDir } = getEsiweiMapDir(`${in_link},${out_link},${pass_link}`)
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
  }
  async handleOnGetCaseList(page: number) {
    this.cur_page_num = page
    this.loading = true
    const {
      enlarge_map_diff_record_id, better_version, should_recall, show_range,
      tag, road_issue, arrow_issue, other_issue, beauty, beauty_road_issue, beauty_arrow_issue
    } = this.filterOptions
    const res = await vectorManager.getMarkedJobCaseList(this.query.job_id, {
      user: this.userInfo.username,
      page,
      per_page: 10,
      marked: 1,
      enlarge_map_diff_record_id: enlarge_map_diff_record_id.value,
      better_version: better_version.value,
      should_recall: should_recall.value,
      show_range: show_range.value,
      tag: tag.value,
      road_issue: road_issue.value,
      arrow_issue: arrow_issue.value,
      other_issue: other_issue.value,
      beauty: beauty.value,
      beauty_road_issue: beauty_road_issue.value,
      beauty_arrow_issue: beauty_arrow_issue.value
    })
    this.loading = false
    if (!res) {
      this.$Message.error('请求失败')
      return
    }
    const { total_num, data_list, pages } = res
    this.total = total_num
    this.total_pages = pages
    // @ts-ignore 额外处理会使得某些字段数据类型变化，无碍
    this.dataSource = this.handleWithDataList(data_list)
  }
  handleWithDataList(data_list: vectorManager.VectorMarkedJobCaseListI[]) {
    return data_list.map((item) => {
      return {
        ...item,
        should_recall_mod: this.mapShouldRecall[item.should_recall] || item.should_recall || '',
        tag_mod: this.mapTag[item.tag] || +item.tag || '',
        better_version_mod: this.mapBetterVersion[item.better_version] || item.better_version || '',
        show_range_mod: this.mapShowRange[item.show_range] || item.show_range || '',
        road_issue_mod: item.road_issue.map((n) => this.mapRoadIssue[n] || n).join(','),
        arrow_issue_mod: item.arrow_issue.map((n) => this.mapArrowIssue[n] || n).join(','),
        other_issue_mod: item.other_issue.map((n) => this.mapOtherIssue[n] || n).join(','),
        beauty_mod: this.mapBeauty[item.beauty] || item.beauty || '',
        beauty_road_issue_mod: item.beauty_road_issue.map((n) => this.mapBeautyRoadIssue[n] || n).join(','),
        beauty_arrow_issue_mod: item.beauty_arrow_issue.map((n) => this.mapBeautyArrowIssue[n] || n).join(',')
      }
    })
  }
  handleOnReset() {
    this.filterOptions.enlarge_map_diff_record_id.value = ''
    this.filterOptions.better_version.value = ''
    this.filterOptions.should_recall.value = ''
    this.filterOptions.show_range.value = ''
    this.filterOptions.tag.value = ''
    this.filterOptions.road_issue.value = []
    this.filterOptions.arrow_issue.value = []
    this.filterOptions.other_issue.value = []
    this.filterOptions.beauty.value = ''
    this.filterOptions.beauty_road_issue.value = []
    this.filterOptions.beauty_arrow_issue.value = []
    this.handleOnGetCaseList(1)
  }
  async handleOnExportData() {
    this.exportLoading = true
    this.handleOnReset()
    const res = await vectorManager.getMarkedJobCaseList(this.query.job_id, {
      user: this.userInfo.username,
      page: 1,
      per_page: this.total,
      marked: 1
    })
    this.exportLoading = false
    if (!res) {
      this.$Message.error('导出失败')
      return
    }
    const { data_list } = res
    const data = this.handleWithDataList(data_list)
    if (!data.length) {
      this.$Message.warning('无导出内容！')
      return
    }
    const table: any = this.$refs.table
    const columns = this.columns
    table.exportCsv({
      filename: `${this.query.job_name}--${new Date().toLocaleString()}`,
      columns: columns.slice(0, columns.length - 1),
      quoted: true,
      data
    })
  }
  async handleOnImportData(selected: boolean) {
    this.importLoading = true
    const { imported, msg } = await importTruthDatabase(selected ? {
      id: this.selections.map((se) => se.id)
    } : { job_id: this.query.job_id })
    this.importLoading = false
    if (imported) {
      this.$Message.success(`导入成功, ${msg}`)
    } else {
      this.$Message.error(`导入失败, ${msg}`)
    }
  }
  hanleOnSelect(selections: vectorManager.VectorMarkedJobCaseListI[]) {
    this.selections = selections
  }
  handleOnViewCase(row: vectorManager.VectorMarkedJobCaseListI, index: number) {
    this.showLabelModal = true
    this.curDataRow = row
    this.curDataIndex = index
  }
  async handleOnSubmit(payload: {
    type: 'submit' | 'accept' | 'reject' // 已标注列表只有submit
    params: vectorManager.VectorMarkParamsI
  }) {
    if (!this.curDataRow) {
      return
    }
    const { type, params } = payload
    this.submitLoading = true
    const { id, mark_job_id } = this.curDataRow
    const { isDone, msg } = await vectorManager.markJob(id, mark_job_id, params)
    this.submitLoading = false
    const mapMsg: { [propName: string]: string } = {
      'submit': '标注',
      'accept': '通过',
      'reject': '驳回'
    }
    if (isDone) {
      this.$Message.success(`${mapMsg[type]}成功, ${msg}`)
    } else {
      this.$Message.error(`${mapMsg[type]}失败, ${msg}`)
    }
  }
  onSetBetterVersion(better_version: number) {
    this.betterVersion = better_version
  }
  onSetEditable(editable: boolean) {
    this.editable = editable
  }
  async handleOnPreOrNext(isNext: boolean) {
    if (isNext) {
      // 当前页非最后一个 -> 下一个
      if (this.curDataIndex < this.dataSource.length - 1) {
        this.curDataIndex++
        this.curDataRow = this.dataSource[this.curDataIndex]
      } else {
        // 非最后一页 -> 翻页
        if (this.cur_page_num < this.total_pages) {
          this.cur_page_num++
          await this.handleOnGetCaseList(this.cur_page_num)
          this.curDataIndex = 0
          this.curDataRow = this.dataSource[0]
        } else {
          this.$Message.warning('已经是最后一个')
        }
      }
    } else {
      // 当前页非第一个 -> 上一个
      if (this.curDataIndex > 0) {
        this.curDataIndex--
        this.curDataRow = this.dataSource[this.curDataIndex]
      } else {
        // 非第一页 -> 上一页
        if (this.cur_page_num > 1) {
          this.cur_page_num--
          await this.handleOnGetCaseList(this.cur_page_num)
          this.curDataIndex = this.dataSource.length - 1
          this.curDataRow = this.dataSource[this.curDataIndex]
        } else {
          this.$Message.warning('已经是第一个')
        }
      }
    }
  }
  mounted() {
    const { show_range, tag, road_issue, arrow_issue, other_issue, beauty, beauty_road_issue, beauty_arrow_issue } = this.query
    this.filterOptions.show_range.value = show_range
    this.filterOptions.tag.value = tag
    this.filterOptions.road_issue.value = road_issue
    this.filterOptions.arrow_issue.value = arrow_issue
    this.filterOptions.other_issue.value = other_issue
    this.filterOptions.beauty.value = beauty
    this.filterOptions.beauty_road_issue.value = beauty_road_issue
    this.filterOptions.beauty_arrow_issue.value = beauty_arrow_issue
    this.handleOnGetCaseList(1)
  }
}
</script>

<style lang="less" scoped>
.table-wrapper {
  .info {
    padding: 10px 0;
  }
  margin: 20px 0;
}
.footer-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

